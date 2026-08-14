package com.mapconductor.react.template

import android.content.Context
import android.view.View
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.platform.ComposeView
import com.mapconductor.core.features.GeoPointInterface
import com.mapconductor.core.map.MapCameraPosition
import com.mapconductor.core.map.MutableMapServiceRegistry
import com.mapconductor.core.marker.MarkerTilingOptions
import com.mapconductor.react.wrapper.MapConductorMapViewWrapperBase
import com.mapconductor.react.wrapper.MapConductorReactNativeHost
import com.mapconductor.react.wrapper.MapConductorReactNativeHostDelegate
import com.mapconductor.template.TemplateDesign
import com.mapconductor.template.TemplateMap
import com.mapconductor.template.TemplateMapCanvas
import com.mapconductor.template.TemplateMapDesignType
import com.mapconductor.template.TemplateMapViewController
import com.mapconductor.template.TemplateMapViewScope
import com.mapconductor.template.createTemplateViewController

/**
 * RN の地図ビュー。
 *
 * **ここに書くことはほとんど無い。** コマンドの受け口・マーカーのバックグラウンド
 * 取り込み・スクリーン座標の通知・拡張モジュールの Compose レイヤは、すべて
 * [MapConductorMapViewWrapperBase]（js-sdk-react/android）が持っている。
 */
class TemplateMapViewWrapper(context: Context) : MapConductorMapViewWrapperBase(context) {
    override val host: MapConductorReactNativeHost = TemplateReactNativeHost()
}

/**
 * 地図SDK固有のアダプタ。**新規プロバイダで書くのはこのクラスだけ。**
 *
 * 実装点は 6 つ（[providerName] / [extensionScope] / [serviceRegistry] /
 * [createMapView] / [setMapDesign] / [toScreenOffset] / [destroy]）で、
 * 1 つでも忘れるとコンパイルエラーになる（黙って無反応にはならない）。
 */
private class TemplateReactNativeHost : MapConductorReactNativeHost {
    override val providerName = "Template"
    override val extensionScope = TemplateMapViewScope()
    override val serviceRegistry = MutableMapServiceRegistry()

    private val map = TemplateMap()
    private var controller: TemplateMapViewController? = null
    // Compose の状態にしておくと、差し替えたときに Canvas が描き直す。
    private val mapDesign = mutableStateOf<TemplateMapDesignType>(TemplateDesign())
    private val revision = mutableIntStateOf(0)

    override fun createMapView(
        context: Context,
        initialCamera: MapCameraPosition,
        markerTiling: MarkerTilingOptions,
        delegate: MapConductorReactNativeHostDelegate,
    ): View {
        val viewController = createTemplateViewController(map, serviceRegistry)
        controller = viewController
        // 雛形の地図は再描画のトリガを自分で持たないので、invalidate を数えて Compose へ渡す。
        // 本物のプロバイダは SDK 自身が描き直すのでこの仕掛けは要らない。
        map.onInvalidate = { revision.intValue++ }

        // 本物のプロバイダはここで SDK の MapView（android.view.View）をそのまま返す。
        // 雛形の地図は Compose の Canvas でしか描けないので ComposeView を挟んでいる。
        // 描画面が Compose / SwiftUI しか無い SDK（ArcGIS の iOS 等）も同じ形になる。
        val composeView =
            ComposeView(context).apply {
                setContent {
                    TemplateMapCanvas(
                        map = map,
                        design = mapDesign.value,
                        revision = revision.intValue,
                        controller = viewController,
                    )
                }
            }

        delegate.onControllerReady(viewController)
        delegate.onMapLoaded()
        composeView.post { viewController.moveCamera(initialCamera) }
        return composeView
    }

    /**
     * JS から来たデザイン ID を SDK のデザイン型へ訳す。
     * 本物のプロバイダは訳したあとコントローラ（または state）へ流し込む。
     */
    override fun setMapDesign(id: String?) {
        mapDesign.value = TemplateDesign(id = id ?: "plain")
    }

    override fun toScreenOffset(position: GeoPointInterface): Offset? = map.project(position)

    override fun destroy() {
        controller?.destroy()
        controller = null
    }
}
