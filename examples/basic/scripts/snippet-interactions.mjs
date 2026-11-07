import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const core = require('@mapconductor/js-sdk-core');
const vectorStyle = await import('@mapconductor/js-vectorstyle');
const extensionModules = Object.fromEntries(['geojson', 'kml', 'heatmap'].map(name => {
  const source = `@mapconductor/react-${name}`;
  return [source, { ...require(source), GeoJSONLayer: 'GeoJSONLayer', KMLLayer: 'KMLLayer',
    HeatmapOverlay: 'HeatmapOverlay', HeatmapPoints: 'HeatmapPoints' }];
}));

/** Execute the displayed App with real SDK state objects and a small hook host.
 * Maps remain element descriptors: these checks exercise example event handlers,
 * not provider rendering (which needs a browser and, for some providers, keys).
 */
function mount(code) {
  const slots = [];
  let cursor = 0;
  let effects = [];
  const same = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  const hooks = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(initial) { return hooks.useMemo(() => ({ current: initial }), []); },
    useMemo(create, deps) {
      const index = cursor++;
      if (!slots[index] || !same(slots[index].deps, deps)) slots[index] = { deps, value: create() };
      return slots[index].value;
    },
    useEffect(run, deps) {
      const index = cursor++;
      if (!slots[index] || !same(slots[index], deps)) { slots[index] = deps; effects.push(run); }
    },
  };
  const jsx = (type, props, key) => ({ type, props: props ?? {}, key });
  const design = { id: 'normal' };
  const provider = new Proxy({}, { get: (_, key) => {
    if (String(key).startsWith('use')) return params => hooks.useMemo(() => ({
      ...params, calls: [],
      moveCameraTo(camera, duration) { this.cameraPosition = camera; this.calls.push({ camera, duration }); },
      fitBounds(bounds, padding) { this.calls.push({ bounds, padding }); },
    }), []);
    if (String(key).includes('Design')) return { Normal: design, OsmBrightJa: design, OpenStreetMap: design };
    return key;
  } });
  const componentNames = new Proxy({}, { get: (_, key) => key });
  const output = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  // Image encoding is verified in Chrome; the hook host only needs a canvas stub.
  const document = { createElement(tag) {
    assert.equal(tag, 'canvas');
    return { getContext: () => ({ fillRect() {}, fillText() {} }),
      toDataURL: format => { assert.equal(format, 'image/png'); return 'data:image/png;base64,test'; } };
  } };
  new Function('require', 'exports', 'document', output)(source => {
    if (source === 'react') return hooks;
    if (source === 'react/jsx-runtime') return { jsx, jsxs: jsx };
    if (source.endsWith('.css')) return {};
    if (source === '@mapconductor/js-sdk-core') return core;
    if (source === '@mapconductor/js-vectorstyle') return vectorStyle;
    if (source === '@mapconductor/js-sdk-react') return componentNames;
    if (extensionModules[source]) return extensionModules[source];
    if (source.startsWith('@mapconductor/react-for-')) return provider;
    if (source === '@mapconductor/react-vectortile' || source === '@mapconductor/react-marker-clustering') return componentNames;
    return require(source);
  }, exports, document);
  const render = () => {
    cursor = 0; effects = [];
    const tree = exports.default();
    effects.forEach(run => run());
    return tree;
  };
  return { render };
}

function elements(tree, type) {
  if (Array.isArray(tree)) return tree.flatMap(child => elements(child, type));
  if (!tree || typeof tree !== 'object') return [];
  return [...(tree.type === type ? [tree] : []), ...elements(tree.props?.children, type)];
}

export function checkInteractions(getDocumentation, pages) {
  const sample = page => mount(getDocumentation(page, 'maplibre', 'ja').code);
  // Every App can prepare its own data without a surrounding example application.
  for (const page of pages) assert.ok(sample(page.id).render(), page.id);

  for (const [page, shape, field] of [['polyline', 'Polyline', 'points'], ['polygon', 'Polygon', 'points'], ['polygon-hole', 'Polygon', 'holes']]) {
    const app = sample(page);
    let tree = app.render();
    const marker = elements(tree, 'Markers')[0].props.states[0];
    const moved = core.createGeoPoint({ latitude: 35.675, longitude: 139.775 });
    marker.position = moved;
    marker.onDrag(marker);
    tree = app.render();
    const geometry = elements(tree, shape)[0].props.state[field];
    assert.equal(field === 'holes' ? geometry[0][0] : geometry[0], moved, `${page} updates geometry`);
    assert.equal(elements(tree, 'Markers')[0].props.states[0], marker, `${page} retains the dragged marker`);
  }

  const multiple = sample('info-bubble-multiple');
  const selected = elements(multiple.render(), 'Markers')[0].props.states[0];
  selected.onClick(selected); selected.onClick(selected);
  assert.equal(elements(multiple.render(), 'InfoBubble').length, 1, 'clicking twice does not duplicate a bubble');

  const circle = sample('circle');
  const edge = elements(circle.render(), 'Marker').find(item => item.props.draggable);
  edge.props.onDrag(core.createMarkerState({ position: core.Spherical.computeOffset({
    origin: edge.props.position, distance: 1000, heading: 90,
  }) }));
  assert.ok(elements(circle.render(), 'Circle')[0].props.state.radiusMeters > 1500, 'circle resizes');

  for (const [page, type] of [['geojson-basic', 'GeoJSONLayer'], ['geojson-layer', 'GeoJSONLayer'], ['kml-layer', 'KMLLayer']]) {
    assert.ok(elements(sample(page).render(), type)[0].props.features.length, `${page} has actual features`);
  }

  const raster = sample('raster-layer');
  let tree = raster.render();
  const layer = elements(tree, 'RasterLayer')[0].props.state;
  elements(tree, 'input')[0].props.onChange({ target: { value: '0.4' } });
  tree = raster.render();
  assert.equal(elements(tree, 'RasterLayer')[0].props.state, layer);
  assert.equal(layer.opacity, 0.4, 'opacity updates the existing raster state');

  const tilt = sample('tilt');
  tree = tilt.render();
  const map = elements(tree, 'MapLibreMapView2D')[0].props.state;
  assert.equal(map.calls.length, 0, 'rendering does not move the camera');
  elements(tree, 'input')[0].props.onChange({ target: { value: '40' } });
  assert.equal(map.calls[0].camera.tilt, 40);
  tilt.render();
  assert.equal(map.calls.length, 1, 'rerendering does not repeat camera movement');

  const sync = sample('camera-sync');
  tree = sync.render();
  const left = elements(tree, 'MapLibreMapView2D')[0];
  const right = elements(tree, 'LeafletMapView')[0];
  const panes = elements(tree, 'div').filter(item => item.props.onWheel);
  panes[0].props.onWheel();
  left.props.onCameraMove(left.props.state.cameraPosition);
  right.props.onCameraMove(right.props.state.cameraPosition);
  assert.equal(right.props.state.calls.length, 1);
  assert.equal(left.props.state.calls.length, 0, 'mirrored camera events do not echo');
  panes[1].props.onFocusCapture();
  right.props.onCameraMove(right.props.state.cameraPosition);
  assert.equal(left.props.state.calls.length, 1, 'either map can become the source');

  const ground = sample('ground-image');
  tree = ground.render();
  const image = elements(tree, 'GroundImage')[0].props.state;
  assert.match(image.imageUrl, /^data:image\/png;/, 'ground image uses a raster image that MapLibre can decode');
  const corners = elements(tree, 'Markers')[0].props.states;
  corners[0].position = core.createGeoPoint({ latitude: -26.485, longitude: 31.299 });
  corners[0].onDrag(corners[0]);
  corners[1].position = core.createGeoPoint({ latitude: -26.473, longitude: 31.313 });
  corners[1].onDrag(corners[1]);
  assert.equal(image.bounds.southWest, corners[0].position);
  assert.equal(image.bounds.northEast, corners[1].position);
  console.log('Checked snippet data and interaction handlers.');
}
