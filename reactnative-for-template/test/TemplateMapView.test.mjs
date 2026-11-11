import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createGeoPoint, createMapCameraPosition } from '@mapconductor/js-sdk-core';
import { TemplateDesign } from '@mapconductor/react-for-template';
import { buildPackage } from './helpers/buildPackage.mjs';

// TemplateMapView は共有の NativeMapViewHost に「どのネイティブビューか」「デザインをどう文字列化するか」を
// 渡すだけの層。React を描画せず関数として呼び、返ってきた要素の props で受け渡しを確かめる。
// 雛形はデザインを id 1 本の文字列で渡し、分解はネイティブ側の責任とする。
const { mod, cleanup } = await buildPackage('mapview-tests');
after(cleanup);
const { TemplateMapView, TemplateViewState, TemplateViewController, NativeMapViewHost, ReactNativeBridgeMapViewController } = mod;

test('the shared native host is rendered with the TemplateMapView native view', () => {
  const element = TemplateMapView({ state: new TemplateViewState() });
  assert.equal(element.type, NativeMapViewHost);
  // Android の REACT_CLASS / iOS の RCT_EXPORT_MODULE と揃っていないと
  // 「View config not found」で落ちる名前。
  assert.deepEqual(element.props.nativeComponent, { nativeViewName: 'TemplateMapView' });
  // このプロバイダはネイティブ固有の prop（API キー等）を渡さない。
  assert.equal(element.props.nativeProps, undefined);
});

test('the design value sent to native follows the state design', () => {
  const state = new TemplateViewState();
  assert.equal(TemplateMapView({ state }).props.mapDesignValue, 'standard');
  state.mapDesignType = TemplateDesign.Satellite;
  assert.equal(TemplateMapView({ state }).props.mapDesignValue, 'satellite');
});

test('app props pass through to the host untouched', () => {
  const state = new TemplateViewState();
  const onMapClick = () => {};
  const props = TemplateMapView({ state, onMapClick, children: 'child' }).props;
  assert.equal(props.state, state);
  assert.equal(props.onMapClick, onMapClick);
  assert.equal(props.children, 'child');
});

test('createController builds a TemplateViewController bound to the native ref and initial camera', () => {
  const view = { nodeHandle: 7 };
  const camera = createMapCameraPosition({ position: createGeoPoint({ latitude: 35.68, longitude: 139.76 }), zoom: 12 });
  const controller = TemplateMapView({ state: new TemplateViewState() }).props.createController({ current: view }, camera);
  assert.ok(controller instanceof TemplateViewController);
  assert.ok(controller instanceof ReactNativeBridgeMapViewController);
  assert.equal(controller.getCameraPosition(), camera);
  assert.equal(controller.holder.mapView, view);
  controller.destroy();
});

test('the id is sent, not the composite getValue() string', () => {
  const design = TemplateDesign.Standard;
  const value = TemplateMapView({ state: new TemplateViewState({ mapDesignType: design }) }).props.mapDesignValue;
  assert.equal(value, design.id);
  assert.notEqual(value, design.getValue());
});
