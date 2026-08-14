# 地図SDKドライバーの書き方（React Native）

このパッケージは **動く最小のブリッジ** です。読んで、コピーして、`Template` を
あなたの地図SDK名に置き換えるところから始めてください。

`react-for-template` が「web の**ドライバー**」の雛形なのに対し、こちらは
「既にあるネイティブドライバーを **React Native へ出す**」ための雛形です。
つまり **`android-for-<sdk>` と `ios-for-<sdk>` が先に必要** で、このパッケージは
その 2 つを RN のブリッジに載せるだけです。

android-sdk の `android-for-template`、ios-sdk の `ios-for-template`、
react-sdk の `react-for-template` と**同じ構造**にしてあります。

---

## 1. 何を書くのか

| # | 実装点 | ファイル | 行数の目安 |
|---|---|---|---|
| A | Android のアダプタ | `android/.../TemplateMapViewWrapper.kt` | 約 95 |
| B | iOS のアダプタ | `ios/TemplateReactNativeView.swift` | 約 90 |
| C | JS の薄いラッパー | `src/*.ts` | 約 120 |
| D | ObjC の ViewManager | `ios/MapConductor*ViewManager.m` | 約 25 |
| E | Android の ViewManager / Package | `android/.../MapConductorTemplate*.kt` | 約 95 |
| F | 足回り（package.json / podspec / gradle） | ルート | 約 100 |

**A と B が本体**です。「ネイティブの地図を作る」「デザイン ID を SDK のデザイン型へ
訳す」「投影」「破棄」の 4 つしかありません。

## 2. 何を書かなくてよいのか

以下はすべて `@mapconductor/js-sdk-react` が持っています。
**書き始める前にこの一覧を読んでください。** 移行前のプロバイダはこれらを各自で
書いており、それが 1 本あたり 600〜700 行の重複の正体でした。

- **22 個のコマンドの受け口** — `MapConductorMapViewCommands`（綴り違いが
  コンパイルエラーになる。写経すると黙って無効化される）
- **マーカーのバックグラウンド取り込み** — 2 万件でも UI スレッドを止めない
  取り込みキュー、generation 方式の分割コミット、ACK の返送
- **スクリーン座標の通知** — InfoBubble とマーカー追従。空ペイロードの
  連投抑止まで込み
- **拡張モジュールのレイヤ** — ヒートマップ / GeoJSON / クラスタリングの Compose・
  SwiftUI ホスト
- **イベント 20 種の配線** — ネイティブ → JS の prop 名対応表
- **カメラ / クリックのリスナー配線**
- **ObjC の ViewManager 本体** — `MC_REACT_NATIVE_MAP_VIEW_MANAGER_BODY`

## 3. 手順

1. `reactnative-for-template` をコピーして `reactnative-for-<sdk>` にする
2. `Template` を SDK 名へ一括置換（`REACT_CLASS` / `RCT_EXPORT_MODULE` /
   `requireNativeComponent` の **3 か所が一致**していること。ずれると
   「View config not found」で落ちる）
3. Android: `createXxxViewController()` を呼ぶだけに書き換える
4. iOS: `ios-for-<sdk>` の `*MapHost` を呼ぶだけに書き換える
   （**まだ無ければ先に切り出す。** SwiftUI の `Coordinator` に実装が入っている
   プロバイダは `ios-for-maplibre` の `MapLibreMapHost` を参考に）
5. `package.json` / `podspec` / `build.gradle` の依存を差し替える
6. サンプルアプリに登録して**実機で確かめる**（§5）

## 4. つまずきやすいところ

- **`MarkerRenderingSupportKey` の登録漏れ** — マーカークラスタリングが黙って
  何も描画しない。`createXxxViewController()` の中で登録すること。
- **iOS のコマンドを基底クラスに置かない** — RN は ViewManager の `Commands` を
  マネージャ自身のメソッド一覧からしか組み立てない。基底に置くと prop は効くのに
  コマンドだけ届かず、「地図は出るがマーカーが出ない」になる。
- **Android は measure パスが回らない** — RN はビューのフレームを直接書き換える。
  子が内部で `requestLayout()` を呼んでも誰も拾わないので、共通基底が肩代わりして
  いる（画面回転で効く）。
- **投影を持たない SDK** — `toScreenOffset` で黙って `null` を返さないこと。
  InfoBubble とマーカー追従が理由も出ずに死ぬ。

## 5. 確かめる

```bash
# JS
npm run build -w @mapconductor/reactnative-for-template

# Android（実機/エミュレータ）
cd examples/reactnative-basic/android && ./gradlew :app:installDebug

# iOS（シミュレータ）
cd examples/reactnative-basic/ios && pod install && \
  xcodebuild -workspace MapConductorBasic.xcworkspace -scheme MapConductorBasic \
    -destination "id=<UDID>" build
```

**スクリーンショットだけで済ませないこと。** タップと回転は目視では分からない
壊れ方をする（実際に「描画は正しいがタップが全部吸われている」「回転で地図が
はみ出す」がその形で見つかっている）。

## 6. 雛形の地図について

`android-for-template` / `ios-for-template` の地図は本物の SDK ではなく、
ディスプレイリストを持つだけの代役です。そのため

- Android は Compose の Canvas でしか描けないので `ComposeView` を挟んでいます。
  **本物のプロバイダは SDK の `MapView`（`android.view.View`）をそのまま返します。**
- iOS は描画面を持たないので空の `UIView` を返します。画面には何も出ません。
  構造の確認とコンパイル検証が目的です。
