import MapConductorCore
import MapConductorReactNativeCore
@_spi(MapConductorDriver) import MapConductorForTemplate
import UIKit

/// RN の地図ビュー。
///
/// **ここに書くことはほとんど無い。** コマンドの受け口・マーカーの取り込み・
/// スクリーン座標の通知・拡張モジュールのレイヤは、すべて
/// ``MCReactNativeMapViewBase``（js-sdk-react/ios）が持っている。
@objc(MCTemplateReactNativeView)
public final class TemplateReactNativeView: MCReactNativeMapViewBase {
    public override func makeHost() -> MCReactNativeMapHost { TemplateReactNativeHost() }
}

/// 地図SDK固有のアダプタ。**新規プロバイダで書くのはこのクラスだけ。**
///
/// `MCReactNativeMapHost` の実装を 1 つでも忘れるとコンパイルエラーになる
/// （黙って無反応にはならない）。
@MainActor
final class TemplateReactNativeHost: MCReactNativeMapHost {
    weak var mcDelegate: MCReactNativeMapHostDelegate?

    private let state = TemplateViewState()
    private let mapHost = TemplateMapHost()

    var mcServiceRegistry: MutableMapServiceRegistry { state.serviceRegistry }
    var mcCameraZoom: Double { state.cameraPosition.zoom }

    func mcMakeMapView(content: MapViewContent) -> UIView {
        // 本物のプロバイダはここで SDK の MapView を返す。
        let view = mapHost.makeMapView(state: state, content: content)
        // 地図が描けるようになったら知らせる。SDK に読み込み完了の通知があるなら
        // そのコールバックから呼ぶこと（雛形の地図は同期で用意できる）。
        mcDelegate?.mcMapLoaded()
        return view
    }

    func mcUpdateContent(_ content: MapViewContent) {
        mapHost.updateContent(content)
    }

    /// state を書き換えたあとにネイティブビューへ直接書く分（スタイル・ジェスチャ）。
    /// 雛形は state 経由で足りるので何もしない。
    func mcSyncNativeViewSettings() {}

    func mcUnbind() {
        mapHost.unbind()
    }

    func mcSetMapDesign(id: String?) {
        state.mapDesignType = TemplateDesign(id: id ?? "plain")
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

    /// 地理座標 → スクリーン座標。InfoBubble とマーカー追従に使う。
    /// 同期投影を持たない SDK は nil を返す（機能が理由つきで落ちる）。
    func mcToScreenOffset(_ position: GeoPointProtocol) -> CGPoint? {
        state.getMapViewHolder()?.toScreenOffset(position: position)
    }

    /// プロバイダ固有のネイティブマーカー型に紐づく拡張（marker-clustering）。
    /// 対応するなら `MarkerClusterExtensionRenderer<XxxActualMarker>` を返す。
    func mcMakeLocalExtensionRenderer(
        type: String,
        extensionId: String,
        eventSink: @escaping NativeMapExtensionEventSink
    ) -> NativeMapExtensionRenderer? {
        nil
    }
}
