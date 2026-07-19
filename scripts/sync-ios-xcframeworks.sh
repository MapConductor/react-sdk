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

copy_framework MapConductorGeoJSON react-geojson-layer
copy_framework MapConductorHeatmap react-heatmap
copy_framework MapConductorMarkerCluster react-marker-clustering
copy_framework MapConductorForMapLibre react-for-maplibre

# MapConductorCore (js-sdk-react's MapConductorReactNativeCore pod) and MapConductorForGoogleMaps
# (reactnative-for-googlemaps's pod) are no longer vendored/prebuilt here - both now ship as
# CocoaPods source pods (see ios-sdk-core/MapConductorCore.podspec and
# ios-for-googlemaps/MapConductorForGoogleMaps.podspec) so GoogleMaps' own real pod gets installed
# by CocoaPods directly instead of being statically embedded into a prebuilt xcframework.

echo "iOS XCFrameworks synchronized from $SOURCE_DIR"
