import type { SupportedLanguage } from './sampleRegistry';

/**
 * Per-page intro hint shown as a dialog over the map the first time a sample
 * page is opened in a session. Content is a short action instruction plus an
 * optional GIF that demonstrates the interaction (drop the file under
 * `public/intro/<page>.gif`).
 */
export interface SampleIntro {
  /** Public path to an animated GIF demonstrating the interaction, if any. */
  gif?: string;
  /** One-line action hint, per supported language. */
  instruction: Record<SupportedLanguage, string>;
}

function intro(
  page: string,
  en: string,
  ja: string,
  es: string,
): [string, SampleIntro] {
  return [page, { gif: `/intro/${page}.gif`, instruction: { en, ja, 'es-419': es } }];
}

const INTROS: Record<string, SampleIntro> = Object.fromEntries([
  intro('map',
    'Tap a store marker to open its info bubble.',
    '店舗マーカーをタップすると情報が表示されます。',
    'Toca un marcador de tienda para abrir su globo de información.'),
  intro('map-design',
    'Use the selector to switch the map design.',
    'セレクターで地図デザインを切り替えてみましょう。',
    'Usa el selector para cambiar el diseño del mapa.'),
  intro('fly-to',
    'Press the button to fly the camera to the destination.',
    'ボタンを押すとカメラが目的地へ移動します。',
    'Pulsa el botón para volar la cámara al destino.'),
  intro('tilt',
    'Adjust the tilt control to lean the map.',
    '傾きを変えると地図が傾きます。',
    'Ajusta el control de inclinación para inclinar el mapa.'),
  intro('visible-region',
    'Pan or zoom the map to update the visible region.',
    '地図を動かすと表示領域の値が更新されます。',
    'Desplaza o haz zoom para actualizar la región visible.'),
  intro('camera-sync',
    'Move one map and watch the other follow in sync.',
    '片方の地図を動かすと、もう片方が同期して追従します。',
    'Mueve un mapa y observa cómo el otro se sincroniza.'),
  intro('marker',
    'Tap a marker to open its bubble.',
    'マーカーをタップすると吹き出しが開きます。',
    'Toca un marcador para abrir su globo.'),
  intro('marker-animation',
    'Tap the marker to trigger its bounce animation.',
    'マーカーをタップするとバウンドします。',
    'Toca el marcador para activar su animación de rebote.'),
  intro('post-office',
    'Zoom in and tap a post office to see its details.',
    'ズームして郵便局をタップすると詳細が表示されます。',
    'Acércate y toca una oficina postal para ver sus detalles.'),
  intro('post-office-cluster',
    'Tap a cluster to zoom into its markers.',
    'クラスタをタップすると中のマーカーへズームします。',
    'Toca un grupo para acercarte a sus marcadores.'),
  intro('circle',
    'Drag the edge marker to resize the circle.',
    '外周のマーカーをドラッグすると半径が変わります。',
    'Arrastra el marcador del borde para cambiar el radio.'),
  intro('polyline',
    'Drag a waypoint marker to reshape the route.',
    'ウェイポイントをドラッグすると経路が変わります。',
    'Arrastra un punto de paso para remodelar la ruta.'),
  intro('polyline-click',
    'Tap the curved polyline to drop a marker at that spot.',
    '曲線のポリラインをタップすると、その位置にマーカーが追加されます。',
    'Toca la polilínea curva para colocar un marcador en ese punto.'),
  intro('polygon',
    'Drag a vertex marker to reshape the polygon.',
    '頂点のマーカーをドラッグすると形が変わります。',
    'Arrastra un vértice para remodelar el polígono.'),
  intro('polygon-click',
    'Tap inside or outside the polygon to test the point.',
    'ポリゴンの内側・外側をタップして判定を確認しましょう。',
    'Toca dentro o fuera del polígono para comprobar el punto.'),
  intro('polygon-geodesic',
    'Zoom out to see the geodesic edges curve.',
    'ズームアウトすると測地線の辺が湾曲して見えます。',
    'Aleja el zoom para ver curvarse los bordes geodésicos.'),
  intro('polygon-hole',
    'Drag a hole vertex to reshape the cut-out.',
    '穴の頂点をドラッグすると切り抜きの形が変わります。',
    'Arrastra un vértice del hueco para remodelar el recorte.'),
  intro('ground-image',
    'Drag a corner marker to move the image bounds.',
    '隅のマーカーをドラッグすると画像の範囲が変わります。',
    'Arrastra un marcador de esquina para mover los límites de la imagen.'),
  intro('raster-layer',
    'Adjust the opacity control to fade the raster tiles.',
    '透明度を変えるとラスタータイルが透けます。',
    'Ajusta la opacidad para atenuar los mosaicos ráster.'),
  intro('info-bubble-simple',
    'Tap the marker to open its bubble.',
    'マーカーをタップすると吹き出しが開きます。',
    'Toca el marcador para abrir su globo.'),
  intro('info-bubble-styled',
    'Tap a marker to open the custom-styled bubble.',
    'マーカーをタップするとカスタムデザインの吹き出しが開きます。',
    'Toca un marcador para abrir el globo personalizado.'),
  intro('info-bubble-multiple',
    'Tap several markers to open multiple bubbles at once.',
    '複数のマーカーをタップすると吹き出しが同時に開きます。',
    'Toca varios marcadores para abrir varios globos a la vez.'),
  intro('info-bubble-rich',
    'Tap the button inside the bubble to interact with it.',
    '吹き出し内のボタンをタップして操作してみましょう。',
    'Toca el botón dentro del globo para interactuar con él.'),
  intro('geojson-basic',
    'Pan and zoom to explore the GeoJSON features.',
    '地図を動かして GeoJSON の Feature を見てみましょう。',
    'Desplaza y haz zoom para explorar los elementos GeoJSON.'),
  intro('geojson-layer',
    'Tap a feature to see its properties.',
    'Feature をタップすると属性が表示されます。',
    'Toca un elemento para ver sus propiedades.'),
  intro('heatmap-layer',
    'Zoom in and out to see the density change.',
    'ズームすると密度の表示が変化します。',
    'Acerca y aleja para ver cambiar la densidad.'),
  intro('threejs-object',
    'Move the map; the 3D object stays pinned in place.',
    '地図を動かしても 3D オブジェクトは同じ地点に固定されます。',
    'Mueve el mapa; el objeto 3D permanece fijo en su lugar.'),
]);

/**
 * In-memory record of which pages have already shown their intro. Module state
 * survives SPA navigation but is re-initialized on a full page reload, so each
 * page's intro appears once per reload and never again until the user reloads.
 */
const shownPages = new Set<string>();

export function hasSeenIntro(page: string): boolean {
  return shownPages.has(page);
}

export function markIntroSeen(page: string): void {
  shownPages.add(page);
}

export function getSampleIntro(page: string | undefined): SampleIntro | null {
  return (page && INTROS[page]) || null;
}
