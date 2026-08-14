import MapConductorCore
@_spi(MapConductorDriver) import MapConductorForLongdo
import MapConductorReactMarkerClustering
import MapConductorReactNativeCore
import UIKit

/// RN の Longdo ビュー。
///
/// コマンドの受け口・マーカー取り込み・スクリーン座標の通知は
/// ``MCReactNativeMapViewBase``（js-sdk-react/ios）が全部持っているので、ここは
/// プロバイダ固有のアダプタを差すだけ。android の `LongdoMapViewWrapper` が
/// `LongdoMapSurface` を載せるだけになっているのと同じ形。
@objc(MCLongdoReactNativeView)
public final class LongdoReactNativeView: MCReactNativeMapViewBase {
    public override func makeHost() -> MCReactNativeMapHost { LongdoReactNativeHost() }
}

/// `LongdoMapHost`（ios-sdk）を RN の基底クラスが扱える非ジェネリックな形へ翻訳する。
@MainActor
final class LongdoReactNativeHost: MCReactNativeMapHost {
    weak var mcDelegate: MCReactNativeMapHostDelegate?

    private let state = LongdoViewState(id: "rn-longdo")
    private lazy var mapHost: LongdoMapHost = {
        LongdoMapHost(
            state: state,
            handlers: MapViewHandlers(
                // 地図の準備完了は WebView のブリッジ（onReady）から来る。
                // 作った直後に鳴らしてはいけない（まだ何も描けない）。android 側と同じ。
                onMapLoaded: { [weak self] _ in self?.mcDelegate?.mcMapLoaded() },
                onMapClick: { [weak self] point in self?.mcDelegate?.mcMapClick(point) },
                onMapLongClick: { [weak self] point in self?.mcDelegate?.mcMapLongClick(point) },
                onCameraMoveStart: { [weak self] camera in self?.mcDelegate?.mcCameraMoveStart(camera) },
                onCameraMove: { [weak self] camera in self?.mcDelegate?.mcCameraMove(camera) },
                onCameraMoveEnd: { [weak self] camera in self?.mcDelegate?.mcCameraMoveEnd(camera) }
            )
        )
    }()

    var mcServiceRegistry: MutableMapServiceRegistry { state.serviceRegistry }
    var mcCameraZoom: Double { state.cameraPosition.zoom }

    func mcMakeMapView(content: MapViewContent) -> UIView {
        // API キーは Info.plist の LONGDO_API_KEY から取る（`LongdoInitSDK.resolveApiKey`）。
        // RN の prop では渡さない — android がマニフェストのプレースホルダから取るのと揃えている。
        mapHost.makeMapView(apiKey: nil, cameraRestriction: nil, content: content)
    }

    func mcUpdateContent(_ content: MapViewContent) {
        mapHost.updateContent(content)
    }

    func mcSyncNativeViewSettings() {
        mapHost.updateGestures(state.uiSettings)
    }

    func mcUnbind() {
        mapHost.unbind()
    }

    func mcSetMapDesign(id: String?) {
        state.mapDesignType = LongdoDesign.fromId(id)
    }

    func mcMoveCamera(_ camera: MapCameraPosition, durationMillis: Int64?) {
        if let durationMillis {
            state.moveCameraTo(cameraPosition: camera, durationMillis: durationMillis)
        } else {
            state.moveCameraTo(cameraPosition: camera)
        }
    }

    func mcFitBounds(_ bounds: GeoRectBounds, padding: Int) {
        state.fitBounds(bounds: bounds, padding: padding)
    }

    func mcApplyUISettings(_ settings: MapUISettings) {
        state.uiSettings = settings
    }

    /// Longdo のホルダーは同期投影を持たない（WebView ブリッジ越しのため）。
    /// **黙って nil を返しているのではなく、これがこの SDK の性質**である。
    /// RN 側は JS で Web Mercator の投影を行うので InfoBubble は出る
    /// （`LongdoMapView.native.tsx` の `screenProjection="webMercator"`）。android と同じ。
    func mcToScreenOffset(_ position: GeoPointProtocol) -> CGPoint? {
        state.getMapViewHolder()?.toScreenOffset(position: position)
    }

    func mcMakeLocalExtensionRenderer(
        type: String,
        extensionId: String,
        eventSink: @escaping NativeMapExtensionEventSink
    ) -> NativeMapExtensionRenderer? {
        guard type == "marker-clustering" else { return nil }
        return MarkerClusterExtensionRenderer<LongdoActualMarker>(extensionId: extensionId, eventSink: eventSink)
    }
}
