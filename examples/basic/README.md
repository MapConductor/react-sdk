# MapConductor Basic Example

This example demonstrates how to use the MapConductor React SDK with both MapLibre and Google Maps providers.

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**

   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` and add your Google Maps API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

   Get a Google Maps API key from: https://console.cloud.google.com/

## Running

### Development mode:
```bash
pnpm run dev
```

The app will be available at `http://localhost:3000`.

### Production build:
```bash
pnpm run build
```

### Preview production build:
```bash
pnpm run preview
```

## Environment Variables

This project uses Vite's environment variable system. All environment variables must be prefixed with `VITE_` to be exposed to the client code.

### Available variables:

- `VITE_GOOGLE_MAPS_API_KEY` - Your Google Maps API key (required for Google Maps provider)

### Security Note:

- The `.env.local` file is ignored by git and should never be committed
- Environment variables prefixed with `VITE_` are embedded in the client bundle
- Never put sensitive secrets that should remain server-side in `VITE_` variables
- For production deployment, set environment variables in your hosting platform

## Features

- Switch between MapLibre and Google Maps providers
- Interactive map with markers
- Camera controls (fly to locations)
- Demonstrates unified API across different map providers

## Map Providers

### MapLibre
- Open source, no API key required
- Uses OpenStreetMap Japan tiles by default
- Fast and lightweight

### Google Maps
- Requires API key (set in `.env.local`)
- Official Google Maps experience
- Rich features and styling options
