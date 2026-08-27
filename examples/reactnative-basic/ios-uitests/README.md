# 実機の UI テスト

実機（iOS 17 以降）は、外部ツールからスクリーンショットもタップも取れない。

- `com.apple.mobile.screenshotr` は無くなった（`idb screenshot` / `idevicescreenshot` が使う）
- idb-companion は iOS 26 の実機を駆動できない
  （`Target doesn't conform to FBSimulatorLifecycleCommands`）
- `xcrun devicectl` にスクリーンショットのサブコマンドは無い

**実機の画を機械的に取る道はいま XCUITest しかない。**

## 使い方

```bash
# 1) ターゲットを配線する（prebuild のあとは毎回）
./scripts/add-ui-test-target.rb
cd ios && pod install

# 2) 実機で流す
set -a && . ../.env.local && set +a
xcodebuild test -workspace MapConductorBasic.xcworkspace -scheme MapConductorBasic \
  -destination 'id=<DEVICE_UDID>' -derivedDataPath build_dev -allowProvisioningUpdates \
  -resultBundlePath /tmp/ui.xcresult \
  LONGDO_API_KEY="$LONGDO_API_KEY" MAPTILER_API_KEY="$MAPTILER_API_KEY" \
  MAPBOX_ACCESS_TOKEN="$MAPBOX_ACCESS_TOKEN" IOS_GOOGLE_MAPS_API_KEY="$IOS_GOOGLE_MAPS_API_KEY"

# 3) スクリーンショットを取り出す
xcrun xcresulttool export attachments --path /tmp/ui.xcresult --output-path /tmp/uiout
```

`xcrun devicectl list devices` で UDID が分かる。Debug ビルドは Metro が要る。

## API キーは 4 つとも xcodebuild へ渡すこと

`app.config.ts` が Info.plist へ書くのは**プレースホルダだけ**で、実値は xcodebuild の
ビルド設定から展開される。渡し忘れると `$(...)` が空文字に潰れ、Info.plist のキーが
空のまま静かにビルドが通る。

| Info.plist のキー | 渡す変数 | 効く先 |
|---|---|---|
| `LONGDO_API_KEY` | `LONGDO_API_KEY` | Longdo（`LongdoInitSDK.resolveApiKey`） |
| `MapTilerAPIKey` | `MAPTILER_API_KEY` | MapTiler（`MapTilerMapHost.resolveApiKey`） |
| `MBXAccessToken` | `MAPBOX_ACCESS_TOKEN` | Mapbox |
| `GMSApiKey` | `IOS_GOOGLE_MAPS_API_KEY` | Google Maps |

**キーが要るのはビルド時。** `build-for-testing` と `test-without-building` に分ける場合、
渡すのは前者。後者に付けても Info.plist はもう焼き上がっている。

入ったかどうかは成果物を見れば分かる（実機で流す前にこれを見るほうが速い）:

```bash
P=build_dev/Build/Products/Release-iphoneos/MapConductorBasic.app/Info.plist
for k in LONGDO_API_KEY MapTilerAPIKey MBXAccessToken GMSApiKey; do
  printf '%-18s = ' "$k"; /usr/libexec/PlistBuddy -c "Print :$k" "$P"
done
```

`EXPO_PUBLIC_*`（ArcGIS / HERE）は経路が違う。JS から `process.env` で読まれ、
Metro のバンドル時に `.env.local` から**インライン化**されるので、xcodebuild へ渡す
必要は無い。入ったかは `strings main.jsbundle | grep -F "<key>"` で見る。

失敗の切り分けでは、**キー欠落はプロバイダ単位ではなくテスト単位でまだらに出る**ことに
注意する。タイルが出なくてもマーカーやクラスタの層は描けてしまうため、キーを落とした
状態でも MapTiler のクラスタ系 3 件は通り、マーカー + InfoBubble の 1 件だけが落ちた。
「一部通っているからキーは足りている」とは言えない。

## Longdo が `UNREGISTERED APP` を出すとき

地図が白紙になり、中央に Longdo 自身のエラーページが出る。

```
UNREGISTERED APP
ID: com.mapconductor.basic
```

これは**キーが届いていない**のではなく、キーは届いたうえで**バンドル ID がその
キーに登録されていない**状態。Longdo のコンソールで `com.mapconductor.basic` を
登録するか、登録済みのキーへ差し替える。Longdo を使うテストは地図が白紙になる分
すべて道連れで落ちる（マーカーもタップ判定も成立しないため）。

## 置き場所が `ios/` の外な理由

`expo prebuild` は `ios/` を作り直す。中に置くと消えるので、Swift はここに置き、
配線は `scripts/add-ui-test-target.rb` でやり直す（何度流しても同じ結果になる）。

## 要素の掴み方

RN のこのアプリでは `Text` が要素ツリーに**名前の無い Other** としてしか出ない。
`accessibilityLabel` を付けたものだけが掴める。付け先は
`App.tsx`（`PROVIDER_LABELS` / `SAMPLE_PAGES`）と各ページの InfoBubble。

要素の見え方が変わったら `testDumpAccessibilityTree` を流す。画と要素ツリーが
添付されるので、当てずっぽうで述語を書き直すより早い。

## マーカーのタップ

地図のマーカーは WKWebView の中の DOM 要素で、アクセシビリティの座標が
**全部同じ退化した矩形**（`{{0,84},{375,10}}`）になるため、要素としては掴めない。
座標で叩くしかない。

**連打しないこと。** 外れるたびに WebView 側が地図を動かしてしまい、実機で
ズームが 9 → 8 まで下がって以降の候補が全部無意味になった。1 タップで判定するか、
判定のたびにページを開き直す。
