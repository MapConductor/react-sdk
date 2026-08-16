#!/usr/bin/env node
// Gate every npm publish. Run AFTER `npm run build:packages` and AFTER
// `scripts/unlink-local-workspaces.mjs`, i.e. against exactly the tree that is
// about to be uploaded.
//
// Each check exists because the corresponding mistake actually shipped:
//
//   dist-in-tarball   @mapconductor/react-for-mapkit@0.1.3 is on npm containing
//                     only LICENSE + README + package.json. It was the one
//                     public package missing from build:packages, so it was
//                     never built and `files: ["dist"]` matched nothing. npm
//                     publishes an empty package without complaint.
//   in-build-script   the root cause of the above.
//   internal-dep-pin  link-local-workspaces.mjs rewrites internal deps to "*"
//                     for local resolution. If the restore step is skipped or
//                     only covers submodules, packages ship depending on "*".
//   license           every package said "Apache2", which is not a valid SPDX
//                     id, so npm showed the license as unrecognized.
//   version           catches a half-applied version bump.
//
// Exits non-zero and prints every problem; it never stops at the first one,
// because finding out about the second problem after a publish is the
// expensive case.

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Packages are NOT required to share one version. A single-package patch
// release (react-for-openlayers 0.2.1 while everything else stays 0.2.0) is
// normal, so each package is judged on its own version and internal ranges are
// checked by semver satisfaction rather than string equality.
import semver from 'semver';

const sh = (cmd) => execSync(cmd, { maxBuffer: 1e9, stdio: ['ignore', 'pipe', 'ignore'] }).toString();

const rootPkg = JSON.parse(readFileSync('package.json', 'utf8'));
const inBuildScript = new Set(
  [...rootPkg.scripts['build:packages'].matchAll(/--workspace (\S+)/g)].map((m) => m[1]),
);

const workspaces = JSON.parse(sh('npm query .workspace --json'));
const publishable = workspaces.filter((w) => !w.private);

const problems = [];
const add = (pkg, msg) => problems.push(`${pkg}: ${msg}`);

// name -> version for every workspace, so internal ranges can be checked
// against what this repo would actually publish.
const versionOf = new Map(
  workspaces.map((w) => [
    JSON.parse(readFileSync(resolve(w.location, 'package.json'), 'utf8')).name,
    JSON.parse(readFileSync(resolve(w.location, 'package.json'), 'utf8')).version,
  ]),
);

console.log(`preflight: ${publishable.length} publishable package(s)\n`);

for (const w of publishable) {
  const pkg = JSON.parse(readFileSync(resolve(w.location, 'package.json'), 'utf8'));
  const name = pkg.name;
  const local = [];

  if (!semver.valid(pkg.version)) local.push(`version "${pkg.version}" is not valid semver`);
  if (pkg.license !== 'Apache-2.0') local.push(`license is ${JSON.stringify(pkg.license)}, want "Apache-2.0"`);
  if (!pkg.files) local.push('no "files" field');
  if (!inBuildScript.has(name)) local.push('missing from build:packages (will publish without dist/)');

  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const [dep, spec] of Object.entries(pkg[field] ?? {})) {
      if (!dep.startsWith('@mapconductor/')) continue;
      if (spec === '*') {
        local.push(`${field}.${dep} is "*" - unlink step did not run`);
        continue;
      }
      const depVersion = versionOf.get(dep);
      if (!depVersion) {
        local.push(`${field}.${dep} is not a workspace in this repo`);
      } else if (!semver.validRange(spec)) {
        local.push(`${field}.${dep} spec "${spec}" is not a valid range`);
      } else if (!semver.satisfies(depVersion, spec)) {
        // The range must admit the version this repo is about to publish,
        // otherwise consumers resolve an older copy than the code was built
        // against.
        local.push(`${field}.${dep} is "${spec}" but the workspace is ${depVersion}`);
      }
    }
  }

  let meta;
  try {
    meta = JSON.parse(sh(`npm pack --dry-run --json --workspace ${name}`))[0];
  } catch {
    local.push('npm pack failed');
  }

  if (meta) {
    if (!meta.files.some((f) => f.path.startsWith('dist/'))) local.push('tarball contains no dist/');
    if (meta.files.some((f) => f.path.includes('node_modules'))) local.push('tarball contains node_modules');
    if (meta.entryCount < 3) local.push(`tarball has only ${meta.entryCount} entries`);
  }

  const size = meta ? `${String(meta.entryCount).padStart(4)} files ${String(Math.round(meta.unpackedSize / 1024)).padStart(6)}kB` : '';
  console.log(`${local.length ? 'BAD ' : 'ok  '} ${name.padEnd(40)} ${size}`);
  for (const m of local) {
    console.log(`       - ${m}`);
    add(name, m);
  }
}

console.log();
if (problems.length) {
  console.error(`preflight FAILED: ${problems.length} problem(s) across ${new Set(problems.map((p) => p.split(':')[0])).size} package(s)`);
  process.exit(1);
}
console.log(`preflight OK: all ${publishable.length} packages ready to publish`);
