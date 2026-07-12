# Setup Guide for MapConductor React SDK

This guide explains how to set up the development environment for the MapConductor React SDK monorepo.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Install Dependencies

This repository uses npm workspaces. Run installs from the repository root so local packages are linked automatically.

```bash
npm install
```

## Build Packages

Build every workspace package that defines a `build` script:

```bash
npm run build
```

## Development

Start package watch builds and the web example from the repository root:

```bash
npm run dev
```

Run only package watch builds:

```bash
npm run dev:packages
```

Run only the web example:

```bash
npm run dev:examples
```

The web example is available at `http://localhost:3000`.

## Running the Example App Directly

```bash
cd examples/basic
npm run dev
```

## Verification

```bash
npm run lint
npm run test
```

For React Native Android changes, run the Gradle compile task from the repository root when configured:

```bash
./gradlew :android:app:compileDebugKotlin
```

## Troubleshooting

If dependency resolution looks stale, remove installed dependencies and reinstall:

```bash
npm run clean
npm install
npm run build
```

If TypeScript reports missing local packages, verify that dependencies were installed from the repository root, then rebuild the workspace packages.
