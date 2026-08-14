package com.mapconductor.react.template

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.mapconductor.react.wrapper.MapConductorMapViewCommands

/**
 * prop の受け口。**中身はすべて共通基底（[TemplateMapViewWrapper] の親）にある**ので、
 * ここは prop 名とビューの生成／破棄をつなぐだけ。
 *
 * その地図SDKにしかない prop（API キー等）を足すときだけ `@ReactProp` を増やす。
 */
class MapConductorTemplateViewManager : SimpleViewManager<TemplateMapViewWrapper>() {
    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): TemplateMapViewWrapper =
        TemplateMapViewWrapper(reactContext)

    override fun onAfterUpdateTransaction(view: TemplateMapViewWrapper) {
        super.onAfterUpdateTransaction(view)
        // prop が揃ってから地図を作る。ここより前に作ると API キー等が間に合わない。
        view.initializeMapIfNeeded()
    }

    @ReactProp(name = "cameraPosition")
    fun setCameraPosition(
        view: TemplateMapViewWrapper,
        cameraPosition: ReadableMap?,
    ) {
        view.setCameraPosition(cameraPosition)
    }

    @ReactProp(name = "mapDesignType")
    fun setMapDesignType(
        view: TemplateMapViewWrapper,
        mapDesignType: String?,
    ) {
        view.setMapDesignType(mapDesignType)
    }

    @ReactProp(name = "infoBubblePositions")
    fun setInfoBubblePositions(
        view: TemplateMapViewWrapper,
        positions: ReadableArray?,
    ) {
        view.setInfoBubblePositions(positions)
    }

    @ReactProp(name = "markerTilingOptions")
    fun setMarkerTilingOptions(
        view: TemplateMapViewWrapper,
        options: ReadableMap?,
    ) {
        view.setMarkerTilingOptions(options)
    }

    override fun receiveCommand(
        root: TemplateMapViewWrapper,
        commandId: String,
        args: ReadableArray?,
    ) {
        // コマンド名の対応は全プロバイダ共通。写経すると綴り違いが黙って無効化されるため
        // js-sdk-react に集約してある。
        MapConductorMapViewCommands.receive(root, commandId, args)
    }

    override fun onDropViewInstance(view: TemplateMapViewWrapper) {
        view.onDropViewInstance()
        super.onDropViewInstance(view)
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> =
        MapConductorMapViewCommands.directEventTypeConstants()

    companion object {
        /** JS の `requireNativeComponent` と ios の `RCT_EXPORT_MODULE` に合わせること。 */
        const val REACT_CLASS = "TemplateMapView"
    }
}
