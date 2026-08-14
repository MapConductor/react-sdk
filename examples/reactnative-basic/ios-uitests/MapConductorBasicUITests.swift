import XCTest

/// 実機での目視確認を自動化するための UI テスト。
///
/// ## なぜ要るのか
///
/// 実機（iOS 17 以降）はスクリーンショットもタップも外部ツールから叩けない。
/// `com.apple.mobile.screenshotr` は無くなり（idb / idevicescreenshot が使う）、
/// idb-companion は iOS 26 の実機を駆動できない（`Target doesn't conform to
/// FBSimulatorLifecycleCommands`）。`xcrun devicectl` にスクリーンショットは無い。
/// **実機の画を機械的に取る道はいま XCUITest しかない。**
///
/// シミュレータだけでは足りない理由もある。iPhone 17 Pro は 3x、iPad は 2x で、
/// **px と dp（ポイント）の取り違えは倍率の違う端末でこそ出る**
/// （android-for-longdo で実際に踏んだ。吹き出しがマーカーから右下へずれた）。
///
/// ## 置き場所
///
/// このファイルは `ios/` の**外**に置いてある。`expo prebuild` は `ios/` を
/// 作り直すため、中に置くと消える。ターゲットへの配線は
/// `scripts/add-ui-test-target.rb` が行う（何度流しても同じ結果になる）。
///
/// ## 何を確かめているか
///
/// マーカーが「描かれている」だけでは足りない。タップが通り、InfoBubble が
/// **マーカーの位置に**出るところまで見る。投影が壊れると、描画は正しいのに
/// 吹き出しだけがずれる（スクリーンショットを見ないと分からない壊れ方をする）。
final class MapConductorBasicUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
        // JS バンドルの取得と地図の初期化を待つ。実機は Metro が LAN 越しなので遅い。
        XCTAssertTrue(
            app.wait(for: .runningForeground, timeout: 60),
            "アプリが前面に来ない（Metro に届いていない可能性がある）"
        )
    }

    /// 要素の探し方を直すための調査用。画と要素ツリーだけを残して終わる。
    ///
    /// RN のビューが XCUIElement としてどう見えるかは端末とバージョンで変わる。
    /// 当てずっぽうで述語を書き直すより、一度これを流してツリーを見るほうが早い。
    ///   xcodebuild test ... -only-testing:MapConductorBasicUITests/MapConductorBasicUITests/testDumpAccessibilityTree
    func testDumpAccessibilityTree() throws {
        waitForMapToSettle(seconds: 25)
        dumpState(name: "01-initial")

        app.buttons["Map provider"].tap()
        waitForMapToSettle(seconds: 2)
        dumpState(name: "02-provider-open")

        // 一覧の項目はボタンか文字か分からないので両方試す。
        let longdoButton = app.buttons["LongdoMapView"]
        let longdoText = app.staticTexts["LongdoMapView"]
        if longdoButton.waitForExistence(timeout: 3) {
            longdoButton.tap()
        } else if longdoText.waitForExistence(timeout: 3) {
            longdoText.tap()
        }
        waitForMapToSettle(seconds: 12)
        dumpState(name: "03-longdo-selected")

        app.buttons["Open samples menu"].tap()
        waitForMapToSettle(seconds: 2)
        dumpState(name: "04-menu-open")
    }

    /// 画・要素ツリー・ラベル一覧をまとめて添付する。
    private func dumpState(name: String) {
        attach(name: "\(name)-screen")

        let tree = XCTAttachment(string: app.debugDescription)
        tree.name = "\(name)-tree"
        tree.lifetime = .keepAlways
        add(tree)

        let summary = """
        staticTexts: \(app.staticTexts.count) / buttons: \(app.buttons.count) \
        / otherElements: \(app.otherElements.count) / webViews: \(app.webViews.count)
        buttons: \(app.buttons.allElementsBoundByIndex.prefix(60).map(\.label))
        staticTexts: \(app.staticTexts.allElementsBoundByIndex.prefix(60).map(\.label))
        """
        let summaryAttachment = XCTAttachment(string: summary)
        summaryAttachment.name = "\(name)-summary"
        summaryAttachment.lifetime = .keepAlways
        add(summaryAttachment)
    }

    /// Longdo の 2 経路（タイル / オーバーレイ）を通しで見る。
    ///
    /// **タイル経路を先に見る。** マーカーが画面いっぱいに出るので中心を 1 回叩けば
    /// 当たり、地図を動かさずに判定できる。まばらな Store Map を先にすると、
    /// 探すための連打で地図がずれて（実機で実際にそうなった）後段が巻き添えになる。
    func testLongdoMarkersAndInfoBubbles() throws {
        selectProvider("LongdoMapView")

        // --- 1. Post Office: 24,526 件。タイル経路 ---
        openPage("Post Office")
        // タイルの生成と配信を待つ（ページ自身も 10 秒のローディング表示を出す）。
        waitForMapToSettle(seconds: 20)
        attach(name: "01-longdo-post-office")

        // ★ ここで**地図を一度も動かさずに**タップすること。
        //   ios-for-longdo は、カメライベントが来るまで当たり判定用のカメラが
        //   nil のままで、タイル上のマーカーのタップが黙って落ちていた。
        //   パンしてからタップすると通ってしまい、この退行を見逃す。
        let postOfficeBubble = tapMarkerUntilBubbleAppears(
            matching: "郵便局",
            label: "post-office"
        )
        XCTAssertTrue(
            postOfficeBubble,
            "Post Office: タイル上のマーカーをタップしても InfoBubble が出ない"
        )
        attach(name: "02-longdo-post-office-bubble")

        // --- 2. 画面回転（吹き出しを出したまま回す） ---
        XCUIDevice.shared.orientation = .landscapeLeft
        waitForMapToSettle(seconds: 6)
        attach(name: "03-longdo-post-office-landscape")
        XCTAssertTrue(
            bubbleExists(matching: "郵便局", timeout: 5),
            "回転すると InfoBubble が消える（投影がビューの大きさ変更に追従していない）"
        )
        XCUIDevice.shared.orientation = .portrait
        waitForMapToSettle(seconds: 4)

        // --- 3. Store Map: 25 件。オーバーレイ経路 ---
        openPage("Store Map")
        waitForMapToSettle(seconds: 10)
        attach(name: "04-longdo-store-map")

        let storeBubble = tapMarkerUntilBubbleAppears(
            matching: "",
            label: "store-map"
        )
        XCTAssertTrue(storeBubble, "Store Map: マーカーをタップしても InfoBubble が出ない")
        attach(name: "05-longdo-store-map-bubble")
    }

    /// Store Map（オーバーレイ経路）を 1 タップだけで確かめる調査用。
    ///
    /// 走査（複数タップ）は使えない。**外れるたびに地図がずれる**
    /// （WebView 側が連続タップを操作として受け取り、実機で 9 → 8 までズームアウトした）。
    /// タップ直後・1 秒後・3 秒後の画を残して、出ていないのか一瞬で消えているのかを見る。
    func testStoreMapSingleTap() throws {
        selectProvider("LongdoMapView")
        openPage("Store Map")
        waitForMapToSettle(seconds: 12)
        attach(name: "s01-before-tap")

        mapAnchor.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
        attach(name: "s02-right-after-tap")
        Thread.sleep(forTimeInterval: 1.0)
        attach(name: "s03-after-1s")
        Thread.sleep(forTimeInterval: 2.0)
        attach(name: "s04-after-3s")

        // 要素の総なめは、地図が動いている最中だと列挙途中で要素が消えて
        // `Failed to get matching snapshot` になる。判定だけにする。
        let found = bubbleExists(matching: "", timeout: 2)
        XCTAssertTrue(found, "Store Map: 中心のマーカーを 1 回叩いても InfoBubble が出ない")
    }

    // MARK: - 画面操作

    /// 右上のプロバイダ切り替え。
    ///
    /// **要素は accessibilityLabel でしか掴めない。** RN のこのアプリでは
    /// `Text` が要素ツリーに名前の無い Other としてしか出ない（実機でツリーを
    /// 取って確認した。`testDumpAccessibilityTree` 参照）。ラベルの出所は
    /// App.tsx の `PROVIDER_LABELS`。
    private func selectProvider(_ name: String) {
        let picker = app.buttons["Map provider"]
        XCTAssertTrue(picker.waitForExistence(timeout: 60), "プロバイダ切り替えが見つからない")
        picker.tap()

        let option = app.buttons[name]
        XCTAssertTrue(option.waitForExistence(timeout: 10), "\(name) が一覧に無い")
        option.tap()
        waitForMapToSettle()
    }

    /// 左上のハンバーガーからページを開く。ラベルの出所は App.tsx の `SAMPLE_PAGES`。
    private func openPage(_ title: String) {
        let menuButton = app.buttons["Open samples menu"]
        XCTAssertTrue(menuButton.waitForExistence(timeout: 30), "メニューボタンが見つからない")
        menuButton.tap()

        let item = app.buttons[title]
        XCTAssertTrue(item.waitForExistence(timeout: 10), "メニューに『\(title)』が無い")
        item.tap()
    }

    /// 座標タップの基準。**`app` ではなく window を使うこと。**
    ///
    /// iPad で iPhone 互換ウィンドウ（実測 375x667 論理 / 613x1092 画面）に入ると、
    /// `app.coordinate(withNormalizedOffset:)` は論理サイズで正規化した点を
    /// **画面座標として**配送してしまい、二重変換で別の場所に落ちる。
    /// 中心 (0.5,0.5) を叩いたつもりが論理 (46.8,172.6)＝オアフ島北西の海上だった
    /// （実機のログで確認）。要素のタップが効くのは、要素の frame も同じ空間で
    /// 報告されて誤差が相殺されるため。
    /// ios-sdk の既存 UI テスト（LongdoInfoBubbleUITests）も window を基準にしている。
    private var mapAnchor: XCUIElement { app.windows.firstMatch }

    // MARK: - マーカーのタップ

    /// 地図の上を何点か叩いて、InfoBubble が出るまで試す。
    ///
    /// マーカーは WKWebView の中の DOM 要素なので XCUIElement として掴めない。
    /// 座標で叩くしかなく、端末ごとに縦横比が違うので**正規化座標**を使う。
    /// 1 点で決め打ちすると iPad と iPhone のどちらかで外れる。
    @discardableResult
    private func tapMarkerUntilBubbleAppears(matching text: String, label: String) -> Bool {
        // 地図の面を格子で走査する。中心付近だけだと外れる
        // （iPad の実機では、Store Map のマーカーは中心から右下寄りに出た）。
        // 上端はヘッダー、下端は説明パネルなので dy は 0.28〜0.72 に収める。
        let xs: [CGFloat] = [0.25, 0.40, 0.50, 0.60, 0.75]
        let ys: [CGFloat] = [0.30, 0.40, 0.50, 0.60, 0.70]
        // 中心に近い順に試す（当たりやすいところから）。
        // 1 行にまとめると Swift の型推論が音を上げるので、素直に組み立てる。
        var candidates: [CGVector] = []
        for y in ys {
            for x in xs {
                candidates.append(CGVector(dx: x, dy: y))
            }
        }
        func distanceFromCenter(_ v: CGVector) -> CGFloat {
            abs(v.dx - 0.5) + abs(v.dy - 0.5)
        }
        candidates.sort { distanceFromCenter($0) < distanceFromCenter($1) }

        for (index, offset) in candidates.enumerated() {
            mapAnchor.coordinate(withNormalizedOffset: offset).tap()
            // 当たっていれば吹き出しはすぐ出る。長く待つと 25 点で数分かかる。
            if bubbleExists(matching: text, timeout: 1.5) {
                attach(name: "tap-\(label)-hit-\(index)")
                return true
            }
        }
        // 出なかったときの画も残す。原因の切り分けに要る。
        attach(name: "tap-\(label)-miss")
        return false
    }

    /// InfoBubble が出ているか。中身の View に `InfoBubble <名前>` の
    /// accessibilityLabel を付けてある（StoreMapPage / PostOfficePage）。
    private func bubbleExists(matching text: String, timeout: TimeInterval = 2) -> Bool {
        // 空文字を CONTAINS に渡すと真にならないので、名前の指定が無いときは
        // 接頭辞だけで見る。
        let predicate = text.isEmpty
            ? NSPredicate(format: "label BEGINSWITH 'InfoBubble'")
            : NSPredicate(format: "label BEGINSWITH 'InfoBubble' AND label CONTAINS[c] %@", text)
        return app.descendants(matching: .any).matching(predicate).firstMatch
            .waitForExistence(timeout: timeout)
    }

    // MARK: - 待ちとスクリーンショット

    /// 地図の描画が落ち着くのを待つ。WebView と Metro 越しなので固定待ちが要る。
    private func waitForMapToSettle(seconds: TimeInterval = 8) {
        Thread.sleep(forTimeInterval: seconds)
    }

    /// スクリーンショットを .xcresult へ添付する。
    /// `xcrun xcresulttool export attachments` で取り出せる。
    private func attach(name: String) {
        let screenshot = XCUIScreen.main.screenshot()
        let attachment = XCTAttachment(screenshot: screenshot)
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
