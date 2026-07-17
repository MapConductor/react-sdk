package com.mapconductor.basic

import android.content.Context
import android.graphics.Color
import android.net.Uri
import com.mapconductor.geojson.DefaultGeoJSONStyleProvider
import com.mapconductor.geojson.GeoJSONFeature
import com.mapconductor.geojson.GeoJSONStyleProviderInterface
import com.mapconductor.geojson.GeoJSONTileRenderer
import java.io.FileInputStream
import java.io.InputStream
import java.util.zip.ZipInputStream
import org.json.JSONArray

/** Example-only provider loaded from the style JSON packaged beside the GeoJSON. */
class ExampleGeoJSONStyler(
    private val routeColors: Map<RouteKey, Int>,
) : GeoJSONStyleProviderInterface {
    override fun getStyle(
        feature: GeoJSONFeature,
        defaultStyle: GeoJSONTileRenderer.LayerStyle,
    ): GeoJSONTileRenderer.LayerStyle {
        val fallback = DefaultGeoJSONStyleProvider.getStyle(feature, defaultStyle)
        val company = feature.properties[COMPANY_PROPERTY]?.toString() ?: return fallback
        val line = feature.properties[LINE_PROPERTY]?.toString() ?: return fallback
        return routeColors[RouteKey(company, line)]?.let { fallback.copy(strokeColor = it) } ?: fallback
    }

    data class RouteKey(
        val company: String,
        val line: String,
    )

    companion object {
        private const val COMPANY_PROPERTY = "N02_004"
        private const val LINE_PROPERTY = "N02_003"
        private const val STYLE_ENTRY = "N02-22_RailroadSection.style.json"

        fun fromZip(
            context: Context,
            sourceUri: String,
        ): ExampleGeoJSONStyler {
            val json = openUri(context, sourceUri).use { rawInput ->
                ZipInputStream(rawInput).use { zip ->
                    var entry = zip.nextEntry
                    while (entry != null) {
                        val fileName = entry.name.substringAfterLast('/')
                        if (!entry.isDirectory && fileName.equals(STYLE_ENTRY, ignoreCase = true)) {
                            return@use zip.bufferedReader(Charsets.UTF_8).readText()
                        }
                        zip.closeEntry()
                        entry = zip.nextEntry
                    }
                    error("$STYLE_ENTRY was not found in $sourceUri")
                }
            }
            return ExampleGeoJSONStyler(parseRouteColors(json))
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

        private fun openUri(
            context: Context,
            uriString: String,
        ): InputStream {
            val uri = Uri.parse(uriString)
            return when (uri.scheme?.lowercase()) {
                "content", "android.resource" -> context.contentResolver.openInputStream(uri)
                    ?: error("Unable to open GeoJSON URI: $uriString")
                "file" -> FileInputStream(uri.path ?: error("URI has no file path: $uriString"))
                else -> FileInputStream(uriString)
            }
        }
    }
}
