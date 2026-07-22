#!/usr/bin/env node
// Normalize internal @mapconductor/* dependency specs to "*" across every
// workspace package.json so npm always links the local workspace (git
// submodule) instead of falling back to the npm registry.
//
// The submodule packages pin each other to exact versions (e.g.
// "@mapconductor/js-sdk-core": "0.1.0"). When a workspace has since been
// bumped (e.g. to 0.1.1) that exact spec no longer matches the local
// package, so npm tries to download it from registry.npmjs.org and fails
// with a 404 because these packages are not published yet.
//
// Rewriting the internal specs to "*" makes npm satisfy them from the local
// workspaces regardless of the exact version each package declares. We only
// touch dependencies that point at packages living in this repo's
// workspaces, so external deps are left untouched.
//
// Run this after `git submodule update --init` and before `npm install`.
// It edits checked-out files in place; do not commit the submodule changes.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

// Resolve the workspaces entries (including simple "dir/*" globs) into
// concrete directories that contain a package.json.
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
  } else if (cleaned.includes('*')) {
    throw new Error(`Unsupported workspaces glob pattern: ${pattern}`);
  } else if (existsSync(join(repoRoot, cleaned, 'package.json'))) {
    workspaceDirs.add(cleaned);
  }
}

// Map of workspace package name -> directory, so we know which deps are local.
const localNames = new Set();
const pkgPaths = [];
for (const dir of workspaceDirs) {
  const pkgPath = join(repoRoot, dir, 'package.json');
  const pkg = readJson(pkgPath);
  if (pkg.name) localNames.add(pkg.name);
  pkgPaths.push({ dir, pkgPath });
}

const DEP_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

let changedFiles = 0;
let changedSpecs = 0;
for (const { dir, pkgPath } of pkgPaths) {
  const pkg = readJson(pkgPath);
  let touched = false;
  for (const field of DEP_FIELDS) {
    const deps = pkg[field];
    if (!deps) continue;
    for (const name of Object.keys(deps)) {
      if (localNames.has(name) && deps[name] !== '*') {
        deps[name] = '*';
        touched = true;
        changedSpecs++;
      }
    }
  }
  if (touched) {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    changedFiles++;
    console.log(`  linked ${dir}/package.json`);
  }
}

console.log(
  `link-local-workspaces: normalized ${changedSpecs} internal dep spec(s) across ${changedFiles} package(s) to "*".`,
);
