package com.mapconductor.react.tomtom

import android.content.Context
import android.view.View
import androidx.compose.ui.geometry.Offset
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactContext
import com.mapconductor.core.features.GeoPointInterface
import com.mapconductor.core.map.MapCameraPosition
import com.mapconductor.core.map.MutableMapServiceRegistry
import com.mapconductor.core.marker.MarkerTilingOptions
import com.mapconductor.react.wrapper.MapConductorMapViewWrapperBase
import com.mapconductor.react.wrapper.MapConductorReactNativeHost
import com.mapconductor.react.wrapper.MapConductorReactNativeHostDelegate
import com.mapconductor.tomtom.TomTomMapDesign
import com.mapconductor.tomtom.TomTomMapViewController
import com.mapconductor.tomtom.TomTomMapViewHolder
import com.mapconductor.tomtom.TomTomMapViewScope
import com.mapconductor.tomtom.createTomTomMapViewController
import com.mapconductor.tomtom.setupMarkerTileRaster
import com.mapconductor.tomtom.tomtomApiKey
import com.tomtom.sdk.map.display.MapOptions
import com.tomtom.sdk.map.display.ui.MapView

/**
 * RN の TomTom ビュー。
 *
 * コマンドの受け口・マーカー取り込み・スクリーン座標の通知・拡張の Compose レイヤは
 * [MapConductorMapViewWrapperBase]（js-sdk-react/android）が全部持っているので、
 * ここはプロバイダ固有のアダプタを差すだけ。
 */
class TomTomMapViewWrapper(context: Context) : MapConductorMapViewWrapperBase(context) {
    override val host: MapConductorReactNativeHost = TomTomReactNativeHost()
}

/** TomTom の地図一式を RN のラッパー基底が扱える形へ翻訳する。 */
private class TomTomReactNativeHost : MapConductorReactNativeHost {
    override val providerName = "TomTom"
    override val extensionScope = TomTomMapViewScope()
    override val serviceRegistry = MutableMapServiceRegistry()

    private var mapView: MapView? = null
    private var holder: TomTomMapViewHolder? = null
    private var controller: TomTomMapViewController? = null
    private var mapDesign: TomTomMapDesign = TomTomMapDesign.Standard
    private var lifecycleListener: LifecycleEventListener? = null
    private var reactContext: ReactContext? = null

    override fun createMapView(
        context: Context,
        initialCamera: MapCameraPosition,
        markerTiling: MarkerTilingOptions,
        delegate: MapConductorReactNativeHostDelegate,
    ): View {
        val options =
            MapOptions(
                mapKey = tomtomApiKey(context),
                // RN のビュー階層に埋め込むため TextureView 描画にする（Compose 版と同じ）。
                renderToTexture = true,
            )
        val nativeMapView = MapView(context, options).apply { onCreate(null) }
        mapView = nativeMapView
        attachLifecycle(context, nativeMapView)

        nativeMapView.getMapAsync { map ->
            if (!delegate.isAttached) return@getMapAsync
            val mapHolder = TomTomMapViewHolder(nativeMapView, map)
            holder = mapHolder
            val viewController =
                createTomTomMapViewController(
                    holder = mapHolder,
                    // そのまま渡す。タイル経路に倒すかはコントローラが件数を見て決める
                    // （他プロバイダと同じ規則）。ここで独自のゲートを作らないこと。
                    markerTiling = markerTiling,
                    serviceRegistry = serviceRegistry,
                )
            controller = viewController
            // **これを忘れるとタイル経路の大量マーカーが 1 つも描かれない**
            // （例外も警告も出ない）。Compose 版も同じ関数を呼んでいる。
            viewController.setupMarkerTileRaster(
                apiKey = tomtomApiKey(context),
                cacheDir = context.cacheDir,
            )
            delegate.onControllerReady(viewController)
            delegate.onMapLoaded()
            nativeMapView.post {
                // スタイル読み込みでカメラが戻されることがあるので、貼り付いてから当て直す。
                viewController.moveCamera(initialCamera)
            }
        }
        return nativeMapView
    }

    /**
     * TomTom の [MapView] にホストのライフサイクルを流す。
     *
     * **これが無いとタイルが 1 枚も出ない。** Compose 版は `DisposableEffect` で
     * `onStart` / `onResume` を送っており（`TomTomMapView.kt` にその旨のコメントがある）、
     * RN には対応する仕組みが無い。他の RN プロバイダ（MapLibre 等）は `onDestroy` しか
     * 呼んでいないが、TomTom はここが描画の前提になっている。
     *
     * 生成された時点で画面に出す前提なので `onStart` / `onResume` は即座に送り、
     * 以降のアプリの前面・背面の切り替えは [LifecycleEventListener] で追う。
     */
    private fun attachLifecycle(
        context: Context,
        target: MapView,
    ) {
        target.onStart()
        target.onResume()
        val ctx = context as? ReactContext ?: return
        val listener =
            object : LifecycleEventListener {
                override fun onHostResume() {
                    target.onStart()
                    target.onResume()
                }

                override fun onHostPause() {
                    target.onPause()
                }

                override fun onHostDestroy() {
                    target.onStop()
                }
            }
        ctx.addLifecycleEventListener(listener)
        reactContext = ctx
        lifecycleListener = listener
    }

    override fun setMapDesign(id: String?) {
        val design = TomTomMapDesign.create(id ?: TomTomMapDesign.Standard.id)
        mapDesign = design
        controller?.setMapDesignType(design)
    }

    override fun toScreenOffset(position: GeoPointInterface): Offset? = holder?.toScreenOffset(position)

    override fun destroy() {
        lifecycleListener?.let { reactContext?.removeLifecycleEventListener(it) }
        lifecycleListener = null
        reactContext = null
        controller?.destroy()
        controller = null
        holder = null
        mapView?.apply {
            onPause()
            onStop()
            onDestroy()
        }
        mapView = null
    }
}
