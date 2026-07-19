# Repository Guidelines

## Project Structure & Module Organization

This is a npm workspace for the MapConductor React SDK. Core shared logic lives in `js-sdk-core/src`. Shared React and React Native bindings live in `js-sdk-react/src`, with platform entry points such as `index.native.ts`, `Marker.native.tsx`, and `MapViewScope.native.tsx`. `react-for-*` packages (`react-for-googlemaps/`, `react-for-maplibre/`, `react-for-arcgis/`, `react-for-leaflet/`, `react-for-openlayers/`) are the web/React DOM providers only. Each non-web platform gets its own sibling package instead of being folded into the `react-for-*` package: React Native bridges live in `reactnative-for-*/` (`reactnative-for-googlemaps/`, `reactnative-for-maplibre/`, `reactnative-for-arcgis/`), and future platforms (e.g. Cordova) should follow the same convention (`cordova-for-*/`) rather than growing a `react-for-*` package's `android/`/`ios/` directories. A `reactnative-for-*` package's TypeScript uses `*.native.ts`/`*.native.tsx`, re-exports what it can from its `react-for-*` sibling (design/state types, web-agnostic core re-exports), and its native Android/iOS bridge code lives under that package's own `android/`/`ios/` directories, thinly wrapping the corresponding native SDK module from the sibling `android-sdk`/`ios-sdk` repos (e.g. `com.mapconductor:for-arcgis`, `MapConductorForArcGIS`). This repo previously experimented with folding React Native code into the `react-for-*` packages; that approach was abandoned specifically because it doesn't generalize to non-RN platforms, so do not repeat it. Extension packages include `react-icons/`, `react-heatmap/`, and `react-marker-clustering/`. Examples live under `examples/basic` for web and `examples/reactnative-basic` for React Native. End-to-end and integration tests belong in `tests/`; generated output such as `dist/`, `build/`, and `test-results/` should not be edited manually.

## React Native Android Architecture

The React Native providers create the native Google Maps or MapLibre view and controller directly. Ordinary markers use this path:

`JS MarkerState -> RN batch bridge -> provider wrapper -> native controller -> core -> provider SDK`

Do not route ordinary markers back through the Compose layer. The Compose host inside each wrapper is intentionally limited to native extensions that still require Compose, such as heatmap and marker clustering. Raster layers and extension raster layers must continue sharing the provider's raster-layer state so that one feature does not remove another feature's overlay.

The shared extension boundary is `NativeMapExtensionCapable` in `js-sdk-react`. Heatmap, marker clustering, future GeoJSON layers, and weather layers should use generic extension descriptors and events through this boundary. Do not add marker-cluster-only, heatmap-only, or other extension-specific commands to the Google Maps or MapLibre public controller interfaces.

Map readiness is owned by the provider controller and native wrapper. JSX overlays may be declared before `onMapLoaded`; pending marker and raster compositions are queued and dispatched when the map is ready. Keep this behavior aligned with `OverlayCollector.setUpdateHandler()`. Do not add page-level `mapReady` gates merely to make an overlay appear, because that hides lifecycle bugs and makes behavior differ from `<Marker />`.

## Large Marker Transport and Performance

Use `<Markers states={states} />` for large collections. It performs one collector replacement and avoids one React component/effect tree per marker. Individual `<Marker />` remains appropriate for small or independently managed markers.

React Native marker composition uses a generation protocol implemented by `NativeMarkerBatch.ts` and both native provider controllers:

1. Build one icon registry for the entire generation.
2. Send `beginMarkerComposition(generation, icons)` once.
3. Send structure-of-arrays batches of 500 markers with `iconIndex` values.
4. Wait for the native ACK before sending the next batch.
5. Send `commitMarkerComposition(generation)` after the final ACK.

Do not put the icon payload back into every 500-marker batch. Android resolves each generation's icon dictionary once and shares the resulting `MarkerIconInterface` instances across all marker states. Identical drawable, file, or content URIs must not be decoded per marker. `android.resource://` images should be read directly from resources rather than copied to the cache directory.

The Google Maps decoder runs on `GoogleMapMarkerIngest`; the MapLibre decoder runs on `MapLibreMarkerIngest`. Keep `ReadableMap`/`ReadableArray` decoding and large marker-state construction off the main thread. UI and provider SDK operations that require the main thread should be the smallest possible sections.

Tiling happens in the Android core after the marker definitions reach the native controller, so all marker IDs, positions, and attributes still cross the RN bridge. `tiled=N, add=0` means no native provider markers were created; it does not mean the source data avoided the bridge. Any future source-level transport optimization should be generic and capable of supporting markers, heatmap points, GeoJSON, and similar bulk data.

For MapLibre, tiled markers have `entity.marker == null` and are rendered by `MarkerTileRenderer`. Never register their images in the MapLibre Style. `MapLibreMarkerOverlayRenderer.ensureStyleImages()` must only process native marker entities and must deduplicate by icon key; otherwise a style reload can call `style.addImage()` tens of thousands of times and delay the first tile for nearly a minute.

`MarkerTilingOptions.iconScaleCallback(state, zoom)` may depend on priority, category, or other marker state. A global zoom-stop replacement is not API-equivalent. A general RN serialization design for state-dependent callbacks is currently deferred. The React Native post-office example temporarily uses a fixed `ReactNativeImageIcon` scale of `0.4`.

Use the `MCMarkerTrace` tag when profiling marker ingestion. Compare JS batch time, native decoding time, core diff time, provider post-processing, controller completion, first tile request, and tile response separately. A long gap after `CoreSDK ingest end` but before the first tile request is not tile-rendering time and should be traced in controller/style synchronization. GC during RN decoding and GC during tile bitmap/PNG generation are different costs; do not attribute every GC to the bridge.

## Extension and Example Notes

The React Native example contains native ports of the web post-office marker page, post-office clustering page, heatmap page, and raster-layer page. Keep behavior comparable across Google Maps and MapLibre when changing these examples. The root app must retain `SafeAreaProvider`, and the sidebar must remain a vertically scrollable layout inside the safe area.

`react-heatmap` uses the Android heatmap Maven module through the generic native extension host. Its large point list is treated as an immutable composition (`trackPointUpdates = false` on the RN path); updates should be sent through the JS/native extension interface instead of adding a Compose snapshot observer per point.

`react-marker-clustering` follows the same pattern and sets `trackMarkerUpdates = false` for the RN-rendered group. The cluster icon provider uses `res/drawable-nodpi/cluster_red.png` and draws the clustered marker count over it. Preserve the count placement logic used by the post-office cluster example. Debug hull visibility changes must be applied immediately through the native group's debug-hull setter; they must not wait for a map/provider switch.

## Android SDK Dependencies

The React Native Android packages consume the sibling Android SDK through MavenLocal rather than copying its implementation. Current artifacts are:

- `com.mapconductor:for-googlemaps:1.2.0`
- `com.mapconductor:for-maplibre:1.2.0`
- `com.mapconductor:for-arcgis:1.2.0`
- `com.mapconductor:heatmap:1.0.2`
- `com.mapconductor:marker-clustering:1.0.2`

When changing `/Users/masashi/mapconductor/android-sdk`, compile the affected module and run its `publishToMavenLocal` task before verifying the React Native app. The Android Studio bundled JDK may need to be supplied explicitly:

`JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew :android-for-maplibre:compileDebugKotlin :android-for-maplibre:publishToMavenLocal`

Use the equivalent module tasks for Google Maps, heatmap, or marker clustering. Keep MavenLocal versions and the dependencies in each React package's `android/build.gradle` aligned.

## Build, Test, and Development Commands

- `npm run build`: builds all workspace packages with a `build` script.
- `npm run dev`: builds once, then starts package watch builds and the web example.
- `npm run dev:packages`: watches core/provider packages for development.
- `npm run dev:examples`: starts example apps that define a dev script.
- `npm run lint`: runs ESLint over TypeScript and TSX files.
- `npm run lint:fix`: applies ESLint fixes.
- `npm run test`: runs workspace tests where present.
- `./gradlew :android:app:compileDebugKotlin`: from the repo root, verifies the React Native Android example when configured.
- `git -C <package> diff --check`: checks nested package repositories, because provider and shared SDK directories may be separate Git worktrees/submodules from the workspace root.

## Coding Style & Naming Conventions

Use TypeScript for SDK packages and Kotlin for Android native modules. Follow existing local style: two-space indentation in TS/TSX, concise named exports, `PascalCase` for React components and classes, `camelCase` for functions and variables, and package-specific folders by feature (`marker`, `polyline`, `react-native`). Prefer typed APIs and existing abstractions over ad hoc objects. Run `npm run lint` before submitting broad changes.

## Testing Guidelines

Add focused tests near the package or feature being changed. Use existing Playwright tests in `tests/` for browser-facing behavior. For React Native Android changes, build `js-sdk-react` and the affected provider package, run the relevant Android SDK compile/publish task when MavenLocal code changed, then run `./gradlew :android:app:compileDebugKotlin`. When possible, verify both Google Maps and MapLibre manually with a large marker set and inspect `MCMarkerTrace` rather than judging only by when the loading overlay disappears.

## Commit & Pull Request Guidelines

Recent history uses short imperative commit messages, sometimes with a `chore:` prefix. Keep commits scoped, for example `implement camera sync page` or `chore: update provider package`. Pull requests should describe behavior changes, list verification commands, link related issues, and include screenshots or recordings for visible map/UI changes.

## Security & Configuration Tips

Do not commit local API keys or machine-specific paths. Google Maps keys should come from `local.properties`, Gradle properties, or environment variables such as `GOOGLE_MAPS_API_KEY`.
