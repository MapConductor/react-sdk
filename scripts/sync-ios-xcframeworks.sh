#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IOS_SDK_DIR="${IOS_SDK_DIR:-$ROOT_DIR/../ios-sdk}"
SOURCE_DIR="${XCFRAMEWORK_DIR:-$IOS_SDK_DIR/build/xcframeworks/output}"

copy_framework() {
  local product="$1"
  local package="$2"
  local source="$SOURCE_DIR/$product.xcframework"
  local destination="$ROOT_DIR/$package/ios/Frameworks/$product.xcframework"

  if [[ ! -d "$source" ]]; then
    echo "Missing $source. Run ios-sdk/scripts/build-xcframeworks.sh first." >&2
    exit 1
  fi

  mkdir -p "$(dirname "$destination")"
  rm -rf "$destination"
  cp -R "$source" "$destination"
}

copy_framework MapConductorCore js-sdk-react
copy_framework MapConductorGeoJSON react-geojson-layer
copy_framework MapConductorHeatmap react-heatmap
copy_framework MapConductorMarkerCluster react-marker-clustering
copy_framework MapConductorForGoogleMaps react-for-googlemaps
copy_framework MapConductorForMapLibre react-for-maplibre

google_maps_bundle_source="$(find "$IOS_SDK_DIR/build/xcframeworks/derived/MapConductorForGoogleMaps-iOS" \
  -path '*/UninstalledProducts/iphoneos/GoogleMaps_GoogleMapsTarget.bundle/GoogleMaps.bundle' \
  -type d -print -quit)"
if [[ -z "$google_maps_bundle_source" ]]; then
  echo "Missing GoogleMaps.bundle. Rebuild the Google Maps iOS SDK archive first." >&2
  exit 1
fi
rm -rf "$ROOT_DIR/react-for-googlemaps/ios/Frameworks/GoogleMaps.bundle"
cp -R "$google_maps_bundle_source" "$ROOT_DIR/react-for-googlemaps/ios/Frameworks/GoogleMaps.bundle"

google_maps_headers_source="$(find "$IOS_SDK_DIR/build/xcframeworks/derived/MapConductorForGoogleMaps-Simulator" \
  -path '*/GoogleMaps.xcframework/ios-arm64_x86_64-simulator/Headers/GoogleMaps' \
  -type d -print -quit)"
if [[ -z "$google_maps_headers_source" ]]; then
  echo "Missing Google Maps headers. Rebuild the Google Maps iOS SDK archive first." >&2
  exit 1
fi
rm -rf "$ROOT_DIR/react-for-googlemaps/ios/Frameworks/GoogleMapsHeaders"
mkdir -p "$ROOT_DIR/react-for-googlemaps/ios/Frameworks/GoogleMapsHeaders/GoogleMaps.framework/Headers"
mkdir -p "$ROOT_DIR/react-for-googlemaps/ios/Frameworks/GoogleMapsHeaders/GoogleMaps.framework/Modules"
cp -R "$google_maps_headers_source/." \
  "$ROOT_DIR/react-for-googlemaps/ios/Frameworks/GoogleMapsHeaders/GoogleMaps.framework/Headers"
cp "$ROOT_DIR/react-for-googlemaps/ios/GoogleMaps.modulemap" \
  "$ROOT_DIR/react-for-googlemaps/ios/Frameworks/GoogleMapsHeaders/GoogleMaps.framework/Modules/module.modulemap"

echo "iOS XCFrameworks synchronized from $SOURCE_DIR"
