#import "MapConductorTomTomViewManager.h"

// 入れ物の生成・reactTag からの解決は MCReactNativeMapViewManagerBase（js-sdk-react/ios）。
// **新規プロバイダで書くのはこの 3 か所だけ。**
@implementation MapConductorTomTomViewManager

// JS の requireNativeComponent と android の REACT_CLASS に合わせること。
RCT_EXPORT_MODULE(TomTomMapView)

- (NSString *)mapViewClassName
{
  // Swift 側の @objc(...) 名。
  return @"MCTomTomReactNativeView";
}

// イベント / prop / コマンドの宣言。RN は Commands をこのクラス自身の
// メソッド一覧からしか組み立てないため、基底に置けず各クラスで展開する。
MC_REACT_NATIVE_MAP_VIEW_MANAGER_BODY

@end

__attribute__((constructor)) static void MCTomTomRegisterLegacyInterop(void)
{
  MCReactNativeRegisterLegacyViewManagerInterop(@"TomTomMapView");
}
