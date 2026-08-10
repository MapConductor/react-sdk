import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
    createGeoPoint,
    MapDriverConformance,
    MutableMapServiceRegistry,
} from '../../js-sdk-core/dist/index.mjs';
import { TemplateMap, TemplateMapViewHolder } from '../dist/index.mjs';
import { TemplateViewController } from '../dist/index.mjs';

/**
 * 新しいドライバーを書いたら、**まずこのファイルをコピーして**
 * `Template` を自分の SDK 名に置き換える。
 *
 * ## これが緑でもブラウザ確認は省略できない
 *
 * マーカーの描画は canvas と実際のビューの大きさに依存する。タップとドラッグは
 * ブラウザで見るしかない。特にドラッグは**ポインタが下りている間**を見ること
 * （離すとマーカーは最終位置へスナップするので、壊れていても前後比較では
 * 正しく見える）。
 */

/**
 * **これが最重要。**
 *
 * `registerOverlayController` の呼び忘れも `SlottedOverlayController` の実装漏れも、
 * 症状は同じ「黙って何も起きない」。TypeScript は構造的型付けなので `implements` を
 * 書かなくても型は通り、コンパイルでは止まらない。
 */
test('every overlay kind is reachable from the Capable facade and the cascade', () => {
    const controller = new TemplateViewController(new TemplateMap());
    MapDriverConformance.checkOverlaySlots(controller.overlayControllers);
});

test('zoom converter round-trips, is monotonic and clamps', () => {
    const controller = new TemplateViewController(new TemplateMap());
    MapDriverConformance.checkZoomConverter(controller.zoomConverter);
});

test('cascade order is canonical', () => {
    MapDriverConformance.checkCascadeOrder();
});

/**
 * `unsupported` の宣言に理由が付いているか。
 * 理由が無いと、機能が止まった理由がアプリ開発者に伝わらない。
 */
test('capability declarations carry a reason', () => {
    const registry = new MutableMapServiceRegistry();
    new TemplateViewController(new TemplateMap()).declareCapabilities(registry);
    MapDriverConformance.checkCapabilityDeclarations(registry);
});

/**
 * 投影の往復。ここがずれていると、InfoBubble が地図の動きに追従しない・
 * タイル方式マーカーがタップできない、という形で出る。
 */
test('projection round-trips', () => {
    const map = new TemplateMap();
    map.center = createGeoPoint({ latitude: 35.681, longitude: 139.767 });
    map.zoom = 12;
    const holder = new TemplateMapViewHolder(null, map);

    MapDriverConformance.checkProjectionRoundTrip(
        (position) => holder.toScreenOffset(position),
        (offset) => holder.fromScreenOffsetSync(offset),
        [
            createGeoPoint({ latitude: 35.681, longitude: 139.767 }),
            createGeoPoint({ latitude: 0, longitude: 0 }),
            createGeoPoint({ latitude: 35.7, longitude: 139.8 }),
            createGeoPoint({ latitude: -33.86, longitude: 151.2 }),
        ],
    );
});

/**
 * カメラの往復。統一ズーム → SDK の生ズーム → 統一ズーム。
 * ここがずれると、当たり判定の許容量が実際の縮尺と食い違う。
 */
test('camera round-trips and carries a visible region', async () => {
    const controller = new TemplateViewController(new TemplateMap());
    await controller.moveCamera({
        position: createGeoPoint({ latitude: 35.681, longitude: 139.767 }),
        center: createGeoPoint({ latitude: 35.681, longitude: 139.767 }),
        zoom: 14.5,
        bearing: 30,
        tilt: 45,
    });

    const read = controller.readNativeCamera();
    assert.ok(Math.abs(read.center.latitude - 35.681) < 1e-9);
    assert.ok(Math.abs(read.zoom - 14.5) < 1e-9);
    assert.equal(read.bearing, 30);
    assert.equal(read.tilt, 45);
    assert.ok(read.visibleRegion, 'visibleRegion が nil ならホルダーの投影が動いていない');
});
