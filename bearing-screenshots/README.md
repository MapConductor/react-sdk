# bearing スクリーンショット

`MapCameraPosition.bearing` の回転方向（値を増やすと地図が時計回り）を示す実測スクリーンショット。
各 PR の本文から参照するためだけのブランチで、どこにもマージしない。不要になったら削除してよい。

撮影条件: エッフェル塔 / zoom 17 / tilt 0 / MapLibre プロバイダ。
サンプルアプリの Tilt ページの初期カメラの bearing だけを 0 と 90 に差し替えて撮影した。

- `web-bearing-{0,90}.png`     react-sdk examples/basic（Chrome）
- `android-bearing-{0,90}.png` android-sdk example-app（実機 Lenovo TB520FU）
- `ios-bearing-{0,90}.png`     ios-sdk MapConductorSampleApp（iPad Pro 13" シミュレータ）
