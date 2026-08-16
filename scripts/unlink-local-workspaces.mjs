#!/usr/bin/env node
// Reverse of link-local-workspaces.mjs.
//
// link-local-workspaces.mjs rewrites every internal @mapconductor/* dependency
// spec to "*" so npm resolves it from the local workspace instead of the
// registry. Those "*" specs must never reach npm: a published package that
// depends on "@mapconductor/js-sdk-core": "*" will happily pull a future major
// and break at runtime.
//
// This script restores each internal spec to "^<version of that workspace>",
// reading the version from the depended-on package's own package.json. That
// makes it correct by construction after a version bump, with no second place
// to remember to edit.
//
// Why not `git restore`: the publish workflow used
// `git submodule foreach 'git restore -- package.json'`, which only covers
// submodules. react-for-mappls, react-kml and the reactnative-for-* packages
// live directly in this repo, so their "*" specs survived the restore. They
// had never been published, so the bug had never shipped.
//
// examples/* pin internal deps to "*" on purpose - they are private and always
// consume the local workspaces - so they are left alone.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

const rootPkg = readJson(join(repoRoot, 'package.json'));
const workspaceDirs = new Set();
for (const pattern of rootPkg.workspaces ?? []) {
  const cleaned = pattern.replace(/\/$/, '');
  if (cleaned.endsWith('/*')) {
    const base = cleaned.slice(0, -2);
    const baseDir = join(repoRoot, base);
    if (!existsSync(baseDir)) continue;
    for (const entry of readdirSync(baseDir, { withFileTypes: true })) {
      const dir = join(base, entry.name);
      if (entry.isDirectory() && existsSync(join(repoRoot, dir, 'package.json'))) {
        workspaceDirs.add(dir);
      }
    }
  } else if (existsSync(join(repoRoot, cleaned, 'package.json'))) {
    workspaceDirs.add(cleaned);
  }
}

// name -> version, so an internal spec can be rebuilt from the real version.
const versionOf = new Map();
const pkgPaths = [];
for (const dir of workspaceDirs) {
  const pkgPath = join(repoRoot, dir, 'package.json');
  const pkg = readJson(pkgPath);
  if (pkg.name) versionOf.set(pkg.name, pkg.version);
  pkgPaths.push({ dir, pkgPath });
}

const DEP_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

let changedFiles = 0;
let changedSpecs = 0;
const unresolved = [];

for (const { dir, pkgPath } of pkgPaths) {
  if (dir.startsWith('examples/')) continue;

  const pkg = readJson(pkgPath);
  let touched = false;
  for (const field of DEP_FIELDS) {
    const deps = pkg[field];
    if (!deps) continue;
    for (const name of Object.keys(deps)) {
      if (!versionOf.has(name)) continue;
      if (deps[name] !== '*') continue;
      const version = versionOf.get(name);
      if (!version) {
        unresolved.push(`${dir} -> ${name}`);
        continue;
      }
      deps[name] = `^${version}`;
      touched = true;
      changedSpecs++;
    }
  }
  if (touched) {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    changedFiles++;
    console.log(`  unlinked ${dir}/package.json`);
  }
}

if (unresolved.length) {
  console.error('unlink-local-workspaces: no version found for:');
  for (const entry of unresolved) console.error(`  ${entry}`);
  process.exit(1);
}

console.log(
  `unlink-local-workspaces: restored ${changedSpecs} internal dep spec(s) across ${changedFiles} package(s).`,
);
