import { useEffect, useMemo, useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import {
  MapLibreDesign,
  MapLibreMapView,
  useMapLibreViewState,
} from '@mapconductor/react-for-maplibre';
import '@mapconductor/react-for-maplibre/style.css';
import {
  createGeoPoint,
  createMapCameraPosition,
  createMarkerState,
} from '@mapconductor/js-sdk-core';
import { InfoBubble, Marker } from '@mapconductor/js-sdk-react';
import { useSampleI18n } from '../../samples/i18n';

// 東京駅。再描画で作り直さないようコンポーネントの外で 1 度だけ作る。
const TOKYO = createGeoPoint({ latitude: 35.6812, longitude: 139.7671 });
const INITIAL_CAMERA = createMapCameraPosition({ position: TOKYO, zoom: 14 });

/** 動く Hello Map 本体：地図＋マーカー＋クリックで InfoBubble。 */
function HelloMapDemo() {
  const mapViewState = useMapLibreViewState({
    mapDesignType: MapLibreDesign.OsmBright,
    cameraPosition: INITIAL_CAMERA,
  });

  const [selected, setSelected] = useState(false);

  const marker = useMemo(
    () =>
      createMarkerState({
        id: 'hello',
        position: TOKYO,
        onClick: () => setSelected(true),
      }),
    [],
  );

  return (
    <div className="hello-map-frame">
      <MapLibreMapView state={mapViewState} onMapClick={() => setSelected(false)}>
        <Marker state={marker} />
        {selected && (
          <InfoBubble marker={marker}>
            <div className="hello-map-bubble">Hello, MapConductor</div>
          </InfoBubble>
        )}
      </MapLibreMapView>
    </div>
  );
}

/** Syntax-highlighted code block, matching the other sample pages. */
function Code({ children, lang = 'tsx' }: { children: string; lang?: string }) {
  return (
    <Highlight theme={themes.nightOwl} code={children} language={lang}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={`${className} hello-map-code`} style={style}>
          <code>
            {tokens.map((line, lineIndex) => (
              <span key={lineIndex} {...getLineProps({ line })} className="hello-map-code-line">
                {line.map((token, tokenIndex) => (
                  <span key={tokenIndex} {...getTokenProps({ token })} />
                ))}
                {'\n'}
              </span>
            ))}
          </code>
        </pre>
      )}
    </Highlight>
  );
}

export function HelloMapTutorialPage() {
  const { t } = useSampleI18n();

  // Mount the live map only on the client (avoids calling MapLibre hooks during
  // SSR / the pre-hydration crawlable render).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <article className="hello-map-tutorial">
      <header className="hello-map-hero">
        <h1>MapConductor Getting Started</h1>
        <p>
          {t(
            'The simplest possible map app, built with MapConductor + MapLibre. ',
            'MapConductor + MapLibre で作る、いちばん簡単な地図アプリ。下の地図の',
            'La aplicación de mapa más sencilla posible, creada con MapConductor + MapLibre. ',
          )}
          <strong>
            {t('Click the marker', 'マーカーをクリック', 'Haz clic en el marcador')}
          </strong>
          {t(
            ' on the map below and a “Hello, MapConductor” bubble pops up.',
            'すると「Hello, MapConductor」の吹き出しが出ます。',
            ' del mapa de abajo y aparecerá un globo “Hello, MapConductor”.',
          )}
        </p>
      </header>

      {mounted ? <HelloMapDemo /> : <div className="hello-map-frame" />}

      <p className="hello-map-lead">
        {t(
          'You can build this map in the 5 steps below. It uses MapLibre, which needs no API key, so you can copy-paste and it just works.',
          'この地図は、次の 5 ステップで作れます。API キー不要の MapLibre を使うので、コピペで動きます。',
          'Puedes crear este mapa en los 5 pasos siguientes. Usa MapLibre, que no requiere clave de API, así que puedes copiar y pegar y funciona.',
        )}
      </p>

      <section>
        <h2>
          {t(
            'Step 1: Create a React project',
            'ステップ 1: React プロジェクトを作る',
            'Paso 1: Crea un proyecto React',
          )}
        </h2>
        <p>
          {t(
            'Create a React + TypeScript project with Vite.',
            'Vite で React + TypeScript のプロジェクトを作成します。',
            'Crea un proyecto React + TypeScript con Vite.',
          )}
        </p>
        <Code lang="bash">{`npm create vite@latest hello-map -- --template react-ts
cd hello-map
npm install
npm run dev`}</Code>
      </section>

      <section>
        <h2>
          {t(
            'Step 2: Install MapConductor (MapLibre)',
            'ステップ 2: MapConductor（MapLibre）をインストール',
            'Paso 2: Instala MapConductor (MapLibre)',
          )}
        </h2>
        <p>
          {t(
            'Install the package needed to show a map. We use MapLibre here, but you can use other map modules too.',
            '地図表示に必要なパッケージを入れます。ここでは MapLibre を使いますが、他の地図モジュールを使うこともできます。',
            'Instala el paquete necesario para mostrar un mapa. Aquí usamos MapLibre, pero también puedes usar otros módulos de mapas.',
          )}
        </p>
        <Code lang="bash">{`npm install @mapconductor/react-for-maplibre`}</Code>
        <ul className="hello-map-notes">
          <li>
            <code>@mapconductor/react-for-maplibre</code>
            {' — '}
            {t(
              'components / hooks for MapLibre',
              'MapLibre 用のコンポーネント/フック',
              'componentes / hooks para MapLibre',
            )}
          </li>
          <li>
            <code>@mapconductor/js-sdk-react</code>
            {' / '}
            <code>@mapconductor/js-sdk-core</code>
            {t(
              ' are installed automatically as dependencies.',
              ' は依存関係として自動的にインストールされます。',
              ' se instalan automáticamente como dependencias.',
            )}
          </li>
        </ul>
      </section>

      <section>
        <h2>
          {t('Step 3: Show the map', 'ステップ 3: 地図を表示する', 'Paso 3: Muestra el mapa')}
        </h2>
        <p>
          {t(
            'Create the map state with ',
            '',
            'Crea el estado del mapa con ',
          )}
          <code>useMapLibreViewState</code>
          {t(
            ' and render it with ',
            ' で地図の状態を作り、',
            ' y renderízalo con ',
          )}
          <code>&lt;MapLibreMapView&gt;</code>
          {t(
            '. Don’t forget the style CSS import. Give the outer element a height to make it full-screen.',
            ' で描画します。スタイル用の CSS import を忘れずに。外側の要素に高さを与えると全画面になります。',
            '. No olvides el import del CSS de estilos. Da una altura al elemento externo para que ocupe toda la pantalla.',
          )}
        </p>
        <Code>{`import {
  MapLibreDesign,
  MapLibreMapView,
  useMapLibreViewState,
} from '@mapconductor/react-for-maplibre';
import '@mapconductor/react-for-maplibre/style.css';
import { createGeoPoint, createMapCameraPosition } from '@mapconductor/js-sdk-core';

const TOKYO = createGeoPoint({ latitude: 35.6812, longitude: 139.7671 });
const INITIAL_CAMERA = createMapCameraPosition({ position: TOKYO, zoom: 14 });

export default function App() {
  const mapViewState = useMapLibreViewState({
    mapDesignType: MapLibreDesign.OsmBright,
    cameraPosition: INITIAL_CAMERA,
  });

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <MapLibreMapView state={mapViewState} />
    </div>
  );
}`}</Code>
      </section>

      <section>
        <h2>
          {t('Step 4: Place a marker', 'ステップ 4: マーカーを置く', 'Paso 4: Coloca un marcador')}
        </h2>
        <p>
          {t(
            'Create the marker state with ',
            '',
            'Crea el estado del marcador con ',
          )}
          <code>createMarkerState</code>
          {t(
            ' and register it with ',
            ' でマーカーの状態を作り、',
            ' y regístralo con ',
          )}
          <code>&lt;Marker&gt;</code>
          {t('. Write overlays as ', ' で登録します。オーバーレイは地図コンポーネントの', '. Escribe las superposiciones como ')}
          <strong>{t('child elements', '子要素', 'elementos hijos')}</strong>
          {t(' of the map component.', 'として書きます。', ' del componente del mapa.')}
        </p>
        <Code>{`import { useMemo } from 'react';
import { createMarkerState } from '@mapconductor/js-sdk-core';
import { Marker } from '@mapconductor/js-sdk-react';

// ${t('...inside App...', '...App の中...', '...dentro de App...')}
const marker = useMemo(
  () => createMarkerState({ id: 'hello', position: TOKYO }),
  [],
);

// ${t('...inside return...', '...return の中...', '...dentro de return...')}
<MapLibreMapView state={mapViewState}>
  <Marker state={marker} />
</MapLibreMapView>`}</Code>
      </section>

      <section>
        <h2>
          {t(
            'Step 5: Show an InfoBubble on click',
            'ステップ 5: クリックで InfoBubble を表示する',
            'Paso 5: Muestra un InfoBubble al hacer clic',
          )}
        </h2>
        <p>
          {t('Track the selected state with ', '選択中かどうかを ', 'Guarda el estado de selección con ')}
          <code>useState</code>
          {t(
            ', set it to true in the marker’s onClick, and render ',
            ' で持ち、マーカーの onClick で true にします。選択中のときだけ ',
            ', ponlo en true en el onClick del marcador y renderiza ',
          )}
          <code>&lt;InfoBubble&gt;</code>
          {t(
            ' only while selected. This is the finished app.',
            ' を描画します。これが完成形です。',
            ' solo mientras está seleccionado. Este es el resultado final.',
          )}
        </p>
        <Code>{`import { useMemo, useState } from 'react';
import {
  MapLibreDesign,
  MapLibreMapView,
  useMapLibreViewState,
} from '@mapconductor/react-for-maplibre';
import '@mapconductor/react-for-maplibre/style.css';
import {
  createGeoPoint,
  createMapCameraPosition,
  createMarkerState,
} from '@mapconductor/js-sdk-core';
import { InfoBubble, Marker } from '@mapconductor/js-sdk-react';

const TOKYO = createGeoPoint({ latitude: 35.6812, longitude: 139.7671 });
const INITIAL_CAMERA = createMapCameraPosition({ position: TOKYO, zoom: 14 });

export default function App() {
  const mapViewState = useMapLibreViewState({
    mapDesignType: MapLibreDesign.OsmBright,
    cameraPosition: INITIAL_CAMERA,
  });

  const [selected, setSelected] = useState(false);

  const marker = useMemo(
    () => createMarkerState({
      id: 'hello',
      position: TOKYO,
      onClick: () => setSelected(true),
    }),
    [],
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <MapLibreMapView state={mapViewState} onMapClick={() => setSelected(false)}>
        <Marker state={marker} />
        {selected && (
          <InfoBubble marker={marker}>
            <div style={{ padding: '8px 12px', fontWeight: 600 }}>
              Hello, MapConductor
            </div>
          </InfoBubble>
        )}
      </MapLibreMapView>
    </div>
  );
}`}</Code>
      </section>

      <section>
        <h2>{t('Key points', 'ポイント', 'Puntos clave')}</h2>
        <ul className="hello-map-notes">
          <li>
            {t(
              'Coordinates, cameras and markers are created with ',
              '座標・カメラ・マーカーは ',
              'Las coordenadas, cámaras y marcadores se crean con funciones de ',
            )}
            <code>js-sdk-core</code>
            {t(' functions (', ' の関数で作る（', ' (')}
            <strong>{t('provider-independent', 'プロバイダー非依存', 'independiente del proveedor')}</strong>
            {t(').', '）', ').')}
          </li>
          <li>
            {t(
              'The map component and hooks come from ',
              '地図コンポーネントとフックは ',
              'El componente del mapa y los hooks vienen de ',
            )}
            <code>react-for-maplibre</code>
            {t(' (', ' から来る（', ' (')}
            <strong>{t('provider-specific', 'プロバイダー固有', 'específico del proveedor')}</strong>
            {t(').', '）', ').')}
          </li>
          <li>
            {t('Write overlays as ', 'オーバーレイは地図コンポーネントの', 'Escribe las superposiciones como ')}
            <strong>{t('child elements', '子要素', 'elementos hijos')}</strong>
            {t(' of the map component.', 'として書く', ' del componente del mapa.')}
          </li>
          <li>
            {t('Control show / hide with React ', '表示・非表示は React の ', 'Controla mostrar / ocultar con ')}
            <code>useState</code>
            {t('.', ' で制御する', ' de React.')}
          </li>
          <li>
            {t(
              'Use the sidebar on the left to jump to other samples such as circles, polygons and clustering.',
              '左のサイドバーから、円・ポリゴン・クラスタリングなどの他サンプルへ移動できます。',
              'Usa la barra lateral de la izquierda para ir a otros ejemplos como círculos, polígonos y agrupación.',
            )}
          </li>
        </ul>
      </section>
    </article>
  );
}
