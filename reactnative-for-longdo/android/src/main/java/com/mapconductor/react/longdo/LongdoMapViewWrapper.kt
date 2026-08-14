package com.mapconductor.react.longdo

import android.content.Context
import android.view.View
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.platform.ComposeView
import com.mapconductor.core.features.GeoPointInterface
import com.mapconductor.core.map.MapCameraPosition
import com.mapconductor.core.map.MutableMapServiceRegistry
import com.mapconductor.core.marker.MarkerTilingOptions
import com.mapconductor.longdo.LongdoDesign
import com.mapconductor.longdo.LongdoMapDesignTypeInterface
import com.mapconductor.longdo.LongdoMapSurface
import com.mapconductor.longdo.LongdoMapViewController
import com.mapconductor.longdo.LongdoMapViewScope
import com.mapconductor.longdo.LongdoViewState
import com.mapconductor.react.wrapper.MapConductorMapViewWrapperBase
import com.mapconductor.react.wrapper.MapConductorReactNativeHost
import com.mapconductor.react.wrapper.MapConductorReactNativeHostDelegate

/**
 * RN の Longdo ビュー。
 *
 * コマンドの受け口・マーカーの取り込み・拡張のレイヤは
 * [MapConductorMapViewWrapperBase]（js-sdk-react/android）が持つ。
 */
class LongdoMapViewWrapper(context: Context) : MapConductorMapViewWrapperBase(context) {
    override val host: MapConductorReactNativeHost = LongdoReactNativeHost()
}

/**
 * Longdo の地図一式を RN のラッパー基底が扱える形へ翻訳する。
 *
 * **このプロバイダは Compose を内側に持つ。** Longdo はマーカーと InfoBubble を
 * 地図SDKではなく Compose のオーバーレイで描く（WebView 越しの `Renderer.project` で
 * 得た画素位置に重ねる）ため、その層ごと [LongdoMapSurface] を載せる。
 * ArcGIS の iOS が SwiftUI を内側に持つのと同じ扱い。
 *
 * マーカーは共通基底 → `controller.compositionMarkers()` → `controller.markers` と
 * 流れ、そのオーバーレイが描く。
 */
private class LongdoReactNativeHost : MapConductorReactNativeHost {
    override val providerName = "Longdo"
    override val extensionScope = LongdoMapViewScope()
    override val serviceRegistry = MutableMapServiceRegistry()

    private val state = LongdoViewState(mapDesignType = LongdoDesign.Normal, id = "rn-longdo")
    private var controller: LongdoMapViewController? = null
    private val mapDesign = mutableStateOf<LongdoMapDesignTypeInterface>(LongdoDesign.Normal)

    override fun createMapView(
        context: Context,
        initialCamera: MapCameraPosition,
        markerTiling: MarkerTilingOptions,
        delegate: MapConductorReactNativeHostDelegate,
    ): View {
        state.moveCameraTo(initialCamera)
        return ComposeView(context).apply {
            setContent {
                state.mapDesignType = mapDesign.value
                LongdoMapSurface(
                    state = state,
                    // そのまま渡す。タイル経路に倒すかはコントローラが件数を見て決める
                    // （他プロバイダと同じ規則）。ここで独自のゲートを作らないこと。
                    markerTiling = markerTiling,
                    onControllerReady = { viewController ->
                        controller = viewController
                        delegate.onControllerReady(viewController)
                    },
                    // 地図の準備完了は WebView のブリッジ（bridge.onReady）から来る。
                    // コントローラ生成時に鳴らしてはいけない（まだ何も描けない）。
                    onMapLoaded = {
                        android.util.Log.d("MCMarkerTrace", "[Longdo][RN] bridge.onReady -> onMapLoaded")
                        delegate.onMapLoaded()
                    },
                )
            }
        }
    }

    override fun setMapDesign(id: String?) {
        mapDesign.value = LongdoDesign.fromId(id)
        controller?.setMapDesignType(mapDesign.value)
    }

    /**
     * 投影はコントローラのホルダーが持つ（コアの `WebMercatorScreenProjection`）。
     * ここで JS 側の投影に逃がさないこと。同じ式が 2 か所に増えるうえ、
     * タップの当たり判定（ネイティブ側にしかない）と食い違う。
     */
    override fun toScreenOffset(position: GeoPointInterface): Offset? =
        controller?.holder?.toScreenOffset(position)

    override fun destroy() {
        controller?.destroy()
        controller = null
    }
}
