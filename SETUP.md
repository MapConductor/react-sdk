# Setup Guide for MapConductor React SDK

This guide explains how to set up the development environment for the MapConductor React SDK monorepo.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 (or use pnpm/yarn as alternatives)

## Package Linking

Since this is a monorepo with multiple packages that depend on each other, you need to link the local packages together.

### Option 1: Using pnpm (Recommended)

pnpm handles monorepos better than npm. Install pnpm and use it instead:

```bash
# Install pnpm globally
npm install -g pnpm

# Install all dependencies and link workspace packages
pnpm install

# Build all packages
pnpm run build
```

### Option 2: Using Yarn Workspaces

Yarn also has excellent workspace support:

```bash
# Install dependencies and link packages
yarn install

# Build all packages
yarn build
```

### Option 3: Using npm with Manual Linking

If you must use npm, you'll need to link packages manually:

#### On Windows (Requires Administrator Privileges)

1. Open Command Prompt or PowerShell **as Administrator**
2. Navigate to the project directory
3. Run the linking script:

```cmd
cd C:\Users\masashi\Desktop\react-sdk
link-packages.bat
```

#### On macOS/Linux

```bash
cd /path/to/react-sdk
chmod +x link-packages.sh
./link-packages.sh
```

### Option 4: Manual Symlink Creation

If automatic linking fails, create symlinks manually:

#### Windows (PowerShell as Administrator):

```powershell
cd C:\Users\masashi\Desktop\react-sdk

# Link core to google-maps
cd packages\google-maps
New-Item -ItemType Directory -Force -Path node_modules\@mapconductor
New-Item -ItemType SymbolicLink -Path node_modules\@mapconductor\core -Target ..\..\core

# Link core to maplibre
cd ..\maplibre
New-Item -ItemType Directory -Force -Path node_modules\@mapconductor
New-Item -ItemType SymbolicLink -Path node_modules\@mapconductor\core -Target ..\..\core

# Link all to example app
cd ..\..\examples\basic
New-Item -ItemType Directory -Force -Path node_modules\@mapconductor
New-Item -ItemType SymbolicLink -Path node_modules\@mapconductor\core -Target ..\..\packages\core
New-Item -ItemType SymbolicLink -Path node_modules\@mapconductor\google-maps -Target ..\..\packages\google-maps
New-Item -ItemType SymbolicLink -Path node_modules\@mapconductor\maplibre -Target ..\..\packages\maplibre
```

#### macOS/Linux:

```bash
cd /path/to/react-sdk

# Link core to google-maps
cd packages/google-maps
mkdir -p node_modules/@mapconductor
ln -sf ../../core node_modules/@mapconductor/js-sdk-core

# Link core to maplibre
cd ../maplibre
mkdir -p node_modules/@mapconductor
ln -sf ../../core node_modules/@mapconductor/js-sdk-core

# Link all to example app
cd ../../examples/basic
mkdir -p node_modules/@mapconductor
ln -sf ../../packages/core node_modules/@mapconductor/js-sdk-core
ln -sf ../../packages/google-maps node_modules/@mapconductor/google-maps
ln -sf ../../packages/maplibre node_modules/@mapconductor/maplibre
```

## Building Packages

After linking, build all packages:

```bash
# Using npm
npm run build

# Using pnpm
pnpm run build

# Using yarn
yarn build
```

This will:
1. Build `@mapconductor/js-sdk-core`
2. Build `@mapconductor/google-maps`
3. Build `@mapconductor/maplibre`

## Running the Example App

```bash
cd examples/basic

# Install example app dependencies (if not already done)
npm install

# Run the development server
npm run dev
```

The example app will be available at `http://localhost:3000`.

## Troubleshooting

### npm workspaces Error

If you encounter `Cannot read properties of null (reading 'matches')` error with npm, this is a known issue with npm 11.x and workspaces. Solutions:

1. **Use pnpm or yarn** (recommended)
2. Downgrade npm: `npm install -g npm@10`
3. Use manual linking (see above)

### Permission Errors on Windows

If you get "You do not have sufficient privilege" errors:

1. Run Command Prompt or PowerShell as Administrator
2. Or use pnpm/yarn which don't require admin privileges

### Symlink Not Working

If symlinks don't work:

1. On Windows, enable Developer Mode:
   - Settings → Update & Security → For developers → Developer Mode
2. Or use pnpm/yarn which handle this automatically

### Build Errors

If builds fail with TypeScript errors:

```bash
# Clean all build artifacts
npm run clean

# Rebuild everything
npm run build
```

### Module Resolution Errors

If you get "Cannot find module '@mapconductor/js-sdk-core'" errors:

1. Verify symlinks are created: `ls -la packages/google-maps/node_modules/@mapconductor/`
2. Rebuild the core package: `cd packages/core && npm run build`
3. Clear TypeScript cache: `rm -rf **/*.tsbuildinfo`

## Development Workflow

1. Make changes to source files in any package
2. The build will automatically run (if using `npm run dev` in that package)
3. Or manually rebuild: `npm run build`
4. The example app will hot-reload if it's running

### Watching for Changes

To watch for changes in a specific package:

```bash
# Watch core package
cd packages/core
npm run dev

# Watch google-maps package
cd packages/google-maps
npm run dev
```

## Alternative: Using Relative Imports

If linking is too problematic, you can temporarily use relative imports in development:

In `packages/google-maps/src/GoogleMapsController.ts`:

```typescript
// Instead of:
import { MapController } from '@mapconductor/js-sdk-core';

// Use:
import { MapController } from '../../../core/src';
```

This is not recommended for production but can help during development.

## Next Steps

After successful setup:

1. Read the [README.md](./README.md) for API documentation
2. Read the [CLAUDE.md](./CLAUDE.md) for development guidelines
3. Explore the example app in `examples/basic/`
4. Start building!
