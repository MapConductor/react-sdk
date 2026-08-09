package com.mapconductor.basic

import android.content.Context
import android.graphics.Color
import android.net.Uri
import com.mapconductor.geojson.DefaultGeoJSONStyleProvider
import com.mapconductor.geojson.GeoJSONFeature
import com.mapconductor.geojson.GeoJSONStyleProviderInterface
import com.mapconductor.geojson.GeoJSONTileRenderer
import org.json.JSONArray
import java.io.FileInputStream
import java.io.IOException
import java.io.InputStream
import java.util.zip.ZipInputStream

/**
 * Example-only style provider: colors each railway line with the color declared in the
 * `*.style.json` packaged inside the same zip as the GeoJSON.
 *
 * This is the Android counterpart of `ios/MapConductorBasic/ExampleGeoJSONStyler.swift`
 * and of android-sdk's `example-app/.../geojson/layer/ExampleGeoJSONStyler.kt`. The point of
 * the sample is that **the application picks the colors**: `react-geojson-layer` only ships a
 * uniform fallback style, and the app registers a provider under an id which the JS side
 * references via `GeoJSONLayerState({ styleProviderId })`.
 */
class ExampleGeoJSONStyler(
    private val routeColors: Map<RouteKey, Int>,
) : GeoJSONStyleProviderInterface {
    override fun getStyle(
        feature: GeoJSONFeature,
        defaultStyle: GeoJSONTileRenderer.LayerStyle,
    ): GeoJSONTileRenderer.LayerStyle {
        val baseStyle = DefaultGeoJSONStyleProvider.getStyle(feature, defaultStyle)
        val companyName = feature.properties[COMPANY_PROPERTY]?.toString() ?: return baseStyle
        val lineName = feature.properties[LINE_PROPERTY]?.toString() ?: return baseStyle
        val color = routeColors[RouteKey(companyName, lineName)] ?: return baseStyle
        return baseStyle.copy(strokeColor = color)
    }

    data class RouteKey(
        val companyName: String,
        val lineName: String,
    )

    companion object {
        private const val COMPANY_PROPERTY = "N02_004"
        private const val LINE_PROPERTY = "N02_003"
        private const val STYLE_ENTRY = "N02-22_RailroadSection.style.json"

        /**
         * `sourceUri` is whatever the JS side handed to `<GeoJSONLayer sourceUri=... />`.
         * Expo's `Asset.localUri` gives a `file://` URL, so accept the same schemes the
         * bridge itself accepts in GeoJSONLayerRenderer.openUri().
         */
        fun fromZip(
            context: Context,
            sourceUri: String,
        ): ExampleGeoJSONStyler = ExampleGeoJSONStyler(parseRouteColors(readStyleJson(context, sourceUri)))

        private fun readStyleJson(
            context: Context,
            sourceUri: String,
        ): String {
            openUri(context, sourceUri).use { rawInput ->
                ZipInputStream(rawInput).use { zip ->
                    while (true) {
                        val entry = zip.nextEntry ?: break
                        val fileName = entry.name.substringAfterLast('/')
                        if (!entry.isDirectory && fileName.equals(STYLE_ENTRY, ignoreCase = true)) {
                            return zip.bufferedReader(Charsets.UTF_8).readText()
                        }
                        zip.closeEntry()
                    }
                }
            }
            throw IOException("$STYLE_ENTRY was not found in $sourceUri")
        }

        private fun openUri(
            context: Context,
            uriString: String,
        ): InputStream {
            val uri = Uri.parse(uriString)
            return when (uri.scheme?.lowercase()) {
                "content", "android.resource" ->
                    context.contentResolver.openInputStream(uri)
                        ?: throw IOException("Unable to open GeoJSON URI: $uriString")
                "file" -> FileInputStream(uri.path ?: throw IOException("file URI has no path: $uriString"))
                else -> FileInputStream(uriString)
            }
        }

        private fun parseRouteColors(json: String): Map<RouteKey, Int> {
            val result = mutableMapOf<RouteKey, Int>()
            val companies = JSONArray(json)
            for (companyIndex in 0 until companies.length()) {
                val company = companies.optJSONObject(companyIndex)?.optJSONObject("company") ?: continue
                val companyName = company.optString("name").takeIf(String::isNotBlank) ?: continue
                val lines = company.optJSONArray("lines") ?: continue
                for (lineIndex in 0 until lines.length()) {
                    val line = lines.optJSONObject(lineIndex) ?: continue
                    val lineName = line.optString("name").takeIf(String::isNotBlank) ?: continue
                    val color = line.optString("color").takeIf(String::isNotBlank) ?: continue
                    result[RouteKey(companyName, lineName)] = Color.parseColor(color)
                }
            }
            return result
        }
    }
}
