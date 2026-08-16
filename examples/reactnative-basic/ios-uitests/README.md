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
  -resultBundlePath /tmp/ui.xcresult LONGDO_API_KEY="$LONGDO_API_KEY"

# 3) スクリーンショットを取り出す
xcrun xcresulttool export attachments --path /tmp/ui.xcresult --output-path /tmp/uiout
```

`xcrun devicectl list devices` で UDID が分かる。Debug ビルドは Metro が要る。

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
