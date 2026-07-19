import MapConductorGeoJSON
import MapConductorReactGeoJSONLayer
import UIKit

/// Example-only provider loaded from the style JSON packaged beside the GeoJSON.
final class ExampleGeoJSONStyler: GeoJSONStyleProvider {
  struct RouteKey: Hashable {
    let companyName: String
    let lineName: String
  }

  private let routeColors: [RouteKey: UIColor]

  init(routeColors: [RouteKey: UIColor]) {
    self.routeColors = routeColors
  }

  func style(
    for feature: GeoJSONFeature,
    defaultStyle: GeoJSONTileRenderer.LayerStyle
  ) -> GeoJSONTileRenderer.LayerStyle {
    let fallback = DefaultGeoJSONStyleProvider.shared.style(
      for: feature,
      defaultStyle: defaultStyle
    )
    guard let companyName = feature.properties[Self.companyProperty] as? String,
          let lineName = feature.properties[Self.lineProperty] as? String,
          let color = routeColors[RouteKey(companyName: companyName, lineName: lineName)] else {
      return fallback
    }
    return GeoJSONTileRenderer.LayerStyle(
      strokeColor: color,
      fillColor: fallback.fillColor,
      strokeWidth: fallback.strokeWidth,
      pointRadius: fallback.pointRadius
    )
  }

  static func fromZip(sourceUri: String) throws -> ExampleGeoJSONStyler {
    let data = try GeoJSONZipArchive.entryData(
      sourceUri: sourceUri,
      fileName: styleEntry
    )
    guard let companies = try JSONSerialization.jsonObject(with: data) as? [[String: Any]] else {
      throw StyleError.invalidJSON
    }
    var routeColors: [RouteKey: UIColor] = [:]
    for item in companies {
      guard let company = item["company"] as? [String: Any],
            let companyName = nonEmptyString(company["name"]),
            let lines = company["lines"] as? [[String: Any]] else { continue }
      for line in lines {
        guard let lineName = nonEmptyString(line["name"]),
              let colorString = nonEmptyString(line["color"]),
              let color = UIColor(androidHex: colorString) else { continue }
        routeColors[RouteKey(companyName: companyName, lineName: lineName)] = color
      }
    }
    return ExampleGeoJSONStyler(routeColors: routeColors)
  }

  private static func nonEmptyString(_ value: Any?) -> String? {
    guard let value = value as? String, !value.isEmpty else { return nil }
    return value
  }

  private enum StyleError: Error {
    case invalidJSON
  }

  private static let companyProperty = "N02_004"
  private static let lineProperty = "N02_003"
  private static let styleEntry = "N02-22_RailroadSection.style.json"
}

private extension UIColor {
  convenience init?(androidHex value: String) {
    let hex = value.hasPrefix("#") ? String(value.dropFirst()) : value
    guard hex.count == 6 || hex.count == 8,
          let parsed = UInt64(hex, radix: 16) else { return nil }
    let alpha: UInt64 = hex.count == 8 ? (parsed >> 24) & 0xff : 0xff
    let red = (parsed >> 16) & 0xff
    let green = (parsed >> 8) & 0xff
    let blue = parsed & 0xff
    self.init(
      red: CGFloat(red) / 255,
      green: CGFloat(green) / 255,
      blue: CGFloat(blue) / 255,
      alpha: CGFloat(alpha) / 255
    )
  }
}
