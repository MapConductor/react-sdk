# 地図SDKドライバーの書き方（React / Web）

このパッケージは **動く最小のドライバー** です。読んで、コピーして、`Template` を
あなたの地図SDK名に置き換えるところから始めてください。

`TemplateMap` が「あなたが使う地図SDK」の代役です。**置き換えるのはそこだけ**で、
まわりのホルダー・コントローラ・レンダラの**形はそのまま**使えます。

android-sdk の `android-for-template`、ios-sdk の `ios-for-template` と
**同じ構造**にしてあります。3 プラットフォームを少人数で保守するための前提です。

---

## 1. 何を書くのか

| # | 実装点 | ファイル |
|---|---|---|
| A | ホルダー — `mapView` / `map` / 投影 2 つ | `TemplateMap.ts` |
| B | コントローラ — `holder` / カメラ読み書き / `fitBounds` | `TemplateViewController.ts` |
| C | 地図デザイン型 | `TemplateMap.ts` |
| D | **レンダラ 6 種 × onAdd / onChange / onRemove** | `TemplateOverlays.ts` |
| E | SDK イベントの転送 | `installListeners()` |
| F | ドラッグ中のパン抑止 | `applyUISettings()` |
| G | State サブクラス | `MapViewState` を継承 |
| H | capability の宣言 | `declareCapabilities()` |

D と A は SDK 固有の翻訳なので減らせません。残りはほぼ定型です。

## 2. 何を書かなくてよいのか

以下はすべてコアが持っています。**書き始める前にこの一覧を読んでください。**
移行前のプロバイダはこれらを各自で書いており、それが重複の正体でした。

- **クリックのカスケード** — `marker → circle → groundImage → polyline → polygon → map`。
  `dispatchTap(position)` を呼ぶだけ。移行前は web だけで 4 通りの順序がありました。
- **オーバーレイの当たり判定** — 各 `Manager` が持っています（測地線ポリゴンの
  巻き数判定、穴の除外、球面距離、線分への近接）。
- **`clickable = false` の透過** — 握り潰しではなく次の層へ流します。
- **Capable ファサードの 22 メソッド** — `registerOverlayController` するだけ。
- **マーカーのポインタ処理とドラッグ** — `DefaultMarkerEventController`
  （`pointerdown/move/up`、3px のドラッグ判定、`dragPan` の抑止と復元）。
- **ズームの往復換算** — `WebMercatorZoomAltitudeConverter`。
- **オーバーレイの差分計算** — `OverlayCollector`。

## 3. 手順

1. `react-for-template` をコピーして `react-for-<sdk>` にする
2. `TemplateMap.ts` の `TemplateMap` を実際の SDK の地図型に置き換える
3. `TemplateOverlays.ts` の 6 レンダラを SDK のオブジェクト生成に書き換える（**ここが本体**）
4. `TemplateViewController.ts` のカメラ換算とイベント転送を SDK に合わせる
5. `<SdkName>View.web.tsx` を書いて SDK の地図をマウントする
6. `test/TemplateDriverConformance.test.mjs` をそのまま動かす
7. **ブラウザで確かめる**（§5）

```bash
npm run build -w @mapconductor/js-sdk-core
npm run build -w @mapconductor/react-for-template
npm test -w @mapconductor/react-for-template
```

ルートの `package.json` の `workspaces` に追加すると CI のビルド・テストに乗ります
（**雛形が腐らない唯一の仕組み**）。

---

## 4. つまずくところ（実際に作り込んだ不具合）

### 4-1. コントローラを `registerOverlayController` し忘れる

Capable ファサードもクリックカスケードも**黙って**効かなくなります。
「追加したのに表示されない」「クリックしても無反応」の大半はこれです。

移行時に調べたところ、**13 プロバイダのどれ 1 つとして呼んでいませんでした**
（全部に追加が必要だった）。

→ `MapDriverConformance.checkOverlaySlots()` が 1 本で捕まえます。必ず入れてください。

### 4-2. `SlottedOverlayController` を実装し忘れる

**TypeScript は構造的型付けなので、`implements` を書かなくても型は通ります。**
だからこそ `kind` や `resolveTap` の書き忘れがコンパイルで止まりません。
コアのコントローラ（`CircleController` など）を継承していれば付いてきますが、
**継承せず自前で組んだ**とき（複数レンダラを束ねる「コンダクタ」を作りたくなったとき）に漏れます。

規約として **`implements SlottedOverlayController` を明示して書いてください。**
実際 10 個のコンダクタがスロットに載っていませんでした。

### 4-3. マーカーのドラッグで `dragPan` を無条件に `enable()` する

アプリが `uiSettings.scrollGesture = false` にしていた地図が、ドラッグ後に
動くようになります。**掴む前の値を覚えて戻す**のが 3 プラットフォーム共通の契約で、
`DefaultMarkerEventController` がやります。自前で書かないでください。

### 4-4. `unsupported` と `unknown` を混同する

宣言が無い（`unknown`）は「まだ宣言していない」であって「使えない」ではありません。
地図の初期化途中もここに入ります。`unsupported` にすると**コアが動いている機能を止めます**。
別経路で動いているなら `degraded` / `approximated` にしてください。**理由は必ず書く**
（書かないと診断ログがアプリ開発者に何も伝えません）。

### 4-5. `optimisticCameraUpdate`

web の地図エンジンはカメライベントが非同期なので、既定で **true**（android / iOS は false）。
`moveCamera` の直後に `state.cameraPosition` を読んでも古い値が返らないようにするためです。
React には push の等価物がないので、ここだけプラットフォームで既定が違います。

---

## 5. ブラウザで確かめること

適合テストが緑でも、以下は**ブラウザでしか確かめられません**。

| ページ | 回帰を示す症状 |
|---|---|
| `marker` | 吹き出しが出ない / 地図イベントも同時に飛ぶ（＝カスケードが止まっていない） |
| `circle` / `ground-image` | 内側でイベントが出ない、外側で出る |
| `polyline` | 表示座標がクリック点になっている（線上の最近点でなければならない） |
| `polygon` | Inside/Outside 判定、頂点マーカーのドラッグ（§5-1） |
| `polygon-hole` | 穴の中が Outside になる |

### 5-1. マーカードラッグの偽陽性の罠

**前後比較では検出できません。** ポインタを離すとマーカーは最終位置へスナップするので、
壊れていても「開始前」と「終了後」のスクリーンショットは正しく見えます。壊れ方は
**「ドラッグ中だけポインタに追従しない」**。したがって**ポインタが下りている間**の
フレームを見る必要があります。

加えて **「離した後に地図をパンできるか」** を必ず確認してください
（`dragPan` を掴む前の値へ戻す経路）。

---

## 6. 適合スイート

```ts
MapDriverConformance.checkOverlaySlots(controller.overlayControllers);
MapDriverConformance.checkZoomConverter(controller.zoomConverter);
MapDriverConformance.checkCascadeOrder();
MapDriverConformance.checkCapabilityDeclarations(registry);
MapDriverConformance.checkProjectionRoundTrip(toScreen, fromScreen, samples);
```

テストランナーに依存しない（素の関数と例外だけ）ので、どこからでも使えます。
android-sdk / ios-sdk にも同じ名前・同じ 5 つのチェックがあります。
