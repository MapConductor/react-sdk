#!/usr/bin/env bash
set -euo pipefail

# MapConductorCore, GoogleMaps, marker clustering, heatmap and GeoJSON layer now ship as CocoaPods
# source pods instead of vendored prebuilt xcframeworks - see ios-sdk-core/MapConductorCore.podspec
# and ios-sdk/CLAUDE.md's "iOS Provider Distribution" section for why (mixing a source-compiled
# MapConductorCore with a prebuilt xcframework that imports it directly breaks in several
# hard-to-fix ways, and none of those modules wrap a third-party vendor SDK anyway). MapLibre stays
# a genuinely prebuilt xcframework because it wraps a real vendor SDK shipped as a *dynamic*
# framework - see ios-sdk/scripts/build-xcframeworks.sh's own comment on when prebuilding applies.

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

copy_framework MapConductorForMapLibre react-for-maplibre

echo "iOS XCFrameworks synchronized from $SOURCE_DIR"
