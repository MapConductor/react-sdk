import MapConductorCore
@_spi(MapConductorDriver) import MapConductorForTomTom
import MapConductorReactMarkerClustering
import MapConductorReactNativeCore
import UIKit

/// RN の TomTom ビュー。
///
/// コマンドの受け口・マーカー取り込み・スクリーン座標の通知は
/// ``MCReactNativeMapViewBase``（js-sdk-react/ios）が全部持っているので、ここは
/// プロバイダ固有のアダプタを差すだけ。android の `TomTomMapViewWrapper` が
/// `createTomTomMapViewController` を呼ぶだけになっているのと同じ形。
@objc(MCTomTomReactNativeView)
public final class TomTomReactNativeView: MCReactNativeMapViewBase {
    public override func makeHost() -> MCReactNativeMapHost { TomTomReactNativeHost() }
}

/// `TomTomMapHost`（ios-sdk）を RN の基底クラスが扱える非ジェネリックな形へ翻訳する。
@MainActor
final class TomTomReactNativeHost: MCReactNativeMapHost {
    weak var mcDelegate: MCReactNativeMapHostDelegate?

    private let state = TomTomMapViewState(id: "rn-tomtom")
    private lazy var mapHost: TomTomMapHost = {
        TomTomMapHost(
            state: state,
            handlers: MapViewHandlers(
                // 地図の準備完了は最初の cameraSteady から来る（`performMapLoadedOnce`）。
                // 生成直後に鳴らしてはいけない（まだスタイルが載っていない）。
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
        // API キーは Info.plist の TomTomAPIKey から取る（`TomTomMapHost.resolveApiKey`）。
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
        // 未知の id は Standard に落ちる（`TomTomMapDesign.Create`）。
        let design = TomTomMapDesign.Create(id: id ?? TomTomMapDesign.Standard.id)
        state.mapDesignType = design
        // SwiftUI 版は `updateUIView` から `applyDesign` を呼ぶ。RN には
        // その再描画が無いので、ここで明示的に流す。
        mapHost.applyDesign(design)
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

    /// **ホルダーへ聞く。** TomTom は `map.pointForCoordinate` という同期の投影を
    /// 持っているので、Longdo のようにホスト側の自前計算へ迂回する必要はない。
    /// ここでコアの `WebMercatorScreenProjection` を使ってはいけない（TomTom は
    /// tilt を持つし、投影は SDK が正しい）。
    func mcToScreenOffset(_ position: GeoPointProtocol) -> CGPoint? {
        state.getMapViewHolder()?.toScreenOffset(position: position)
    }

    func mcMakeLocalExtensionRenderer(
        type: String,
        extensionId: String,
        eventSink: @escaping NativeMapExtensionEventSink
    ) -> NativeMapExtensionRenderer? {
        guard type == "marker-clustering" else { return nil }
        return MarkerClusterExtensionRenderer<TomTomActualMarker>(extensionId: extensionId, eventSink: eventSink)
    }
}
