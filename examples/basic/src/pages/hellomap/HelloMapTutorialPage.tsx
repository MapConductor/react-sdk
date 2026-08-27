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
            {
              en: 'The simplest possible map app, built with MapConductor + MapLibre. ',
              ja: 'MapConductor + MapLibre で作る、いちばん簡単な地図アプリ。下の地図の',
              'es-419': 'La aplicación de mapa más sencilla posible, creada con MapConductor + MapLibre. ',
              de: 'Die einfachstmögliche Karten-App, gebaut mit MapConductor + MapLibre. ',
              th: 'แอปแผนที่ที่ง่ายที่สุดเท่าที่จะเป็นไปได้ สร้างด้วย MapConductor + MapLibre ',
              hi: 'MapConductor + MapLibre से बनी सबसे सरल मैप ऐप। नीचे के मैप पर ',
            },
          )}
          <strong>
            {t(
              {
                en: 'Click the marker',
                ja: 'マーカーをクリック',
                'es-419': 'Haz clic en el marcador',
                de: 'Klicken Sie auf den Marker',
                th: 'คลิกที่มาร์กเกอร์',
                hi: 'मार्कर पर क्लिक करें',
              },
            )}
          </strong>
          {t(
            {
              en: ' on the map below and a “Hello, MapConductor” bubble pops up.',
              ja: 'すると「Hello, MapConductor」の吹き出しが出ます。',
              'es-419': ' del mapa de abajo y aparecerá un globo “Hello, MapConductor”.',
              de: ' in der Karte unten, und eine „Hello, MapConductor“-Sprechblase erscheint.',
              th: 'บนแผนที่ด้านล่าง แล้วบับเบิล “Hello, MapConductor” จะปรากฏขึ้น',
              hi: ' — और “Hello, MapConductor” का बबल दिखाई देगा।',
            },
          )}
        </p>
      </header>

      {mounted ? <HelloMapDemo /> : <div className="hello-map-frame" />}

      <p className="hello-map-lead">
        {t(
          {
            en: 'You can build this map in the 5 steps below. It uses MapLibre, which needs no API key, so you can copy-paste and it just works.',
            ja: 'この地図は、次の 5 ステップで作れます。API キー不要の MapLibre を使うので、コピペで動きます。',
            'es-419': 'Puedes crear este mapa en los 5 pasos siguientes. Usa MapLibre, que no requiere clave de API, así que puedes copiar y pegar y funciona.',
            de: 'Diese Karte bauen Sie in den 5 Schritten unten. Sie nutzt MapLibre, das keinen API-Schlüssel braucht — Sie können also kopieren, einfügen, fertig.',
            th: 'คุณสร้างแผนที่นี้ได้ใน 5 ขั้นตอนด้านล่าง ตัวอย่างนี้ใช้ MapLibre ซึ่งไม่ต้องใช้คีย์ API จึงคัดลอกไปวางแล้วใช้ได้เลย',
            hi: 'यह मैप नीचे के 5 चरणों में बन जाता है। इसमें MapLibre इस्तेमाल हुआ है, जिसे API कुंजी नहीं चाहिए — कॉपी-पेस्ट करके सीधे चला सकते हैं।',
          },
        )}
      </p>

      <section>
        <h2>
          {t(
            {
              en: 'Step 1: Create a React project',
              ja: 'ステップ 1: React プロジェクトを作る',
              'es-419': 'Paso 1: Crea un proyecto React',
              de: 'Schritt 1: Ein React-Projekt anlegen',
              th: 'ขั้นที่ 1: สร้างโปรเจกต์ React',
              hi: 'चरण 1: React प्रोजेक्ट बनाएँ',
            },
          )}
        </h2>
        <p>
          {t(
            {
              en: 'Create a React + TypeScript project with Vite.',
              ja: 'Vite で React + TypeScript のプロジェクトを作成します。',
              'es-419': 'Crea un proyecto React + TypeScript con Vite.',
              de: 'Legen Sie mit Vite ein React-+-TypeScript-Projekt an.',
              th: 'สร้างโปรเจกต์ React + TypeScript ด้วย Vite',
              hi: 'Vite से React + TypeScript का प्रोजेक्ट बनाएँ।',
            },
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
            {
              en: 'Step 2: Install MapConductor (MapLibre)',
              ja: 'ステップ 2: MapConductor（MapLibre）をインストール',
              'es-419': 'Paso 2: Instala MapConductor (MapLibre)',
              de: 'Schritt 2: MapConductor (MapLibre) installieren',
              th: 'ขั้นที่ 2: ติดตั้ง MapConductor (MapLibre)',
              hi: 'चरण 2: MapConductor (MapLibre) इंस्टॉल करें',
            },
          )}
        </h2>
        <p>
          {t(
            {
              en: 'Install the package needed to show a map. We use MapLibre here, but you can use other map modules too.',
              ja: '地図表示に必要なパッケージを入れます。ここでは MapLibre を使いますが、他の地図モジュールを使うこともできます。',
              'es-419': 'Instala el paquete necesario para mostrar un mapa. Aquí usamos MapLibre, pero también puedes usar otros módulos de mapas.',
              de: 'Installieren Sie das Paket, das zum Anzeigen einer Karte nötig ist. Hier nutzen wir MapLibre, andere Kartenmodule gehen genauso.',
              th: 'ติดตั้งแพ็กเกจที่ต้องใช้ในการแสดงแผนที่ ที่นี่ใช้ MapLibre แต่จะใช้โมดูลแผนที่เจ้าอื่นก็ได้',
              hi: 'मैप दिखाने के लिए ज़रूरी पैकेज इंस्टॉल करें। यहाँ MapLibre लिया है, पर दूसरे मैप मॉड्यूल भी चल जाते हैं।',
            },
          )}
        </p>
        <Code lang="bash">{`npm install @mapconductor/react-for-maplibre`}</Code>
        <ul className="hello-map-notes">
          <li>
            <code>@mapconductor/react-for-maplibre</code>
            {' — '}
            {t(
              {
                en: 'components / hooks for MapLibre',
                ja: 'MapLibre 用のコンポーネント/フック',
                'es-419': 'componentes / hooks para MapLibre',
                de: 'Komponenten / Hooks für MapLibre',
                th: 'คอมโพเนนต์ / ฮุกสำหรับ MapLibre',
                hi: 'MapLibre के कंपोनेंट / हुक',
              },
            )}
          </li>
          <li>
            <code>@mapconductor/js-sdk-react</code>
            {' / '}
            <code>@mapconductor/js-sdk-core</code>
            {t(
              {
                en: ' are installed automatically as dependencies.',
                ja: ' は依存関係として自動的にインストールされます。',
                'es-419': ' se instalan automáticamente como dependencias.',
                de: ' werden automatisch als Abhängigkeiten mitinstalliert.',
                th: ' จะถูกติดตั้งอัตโนมัติในฐานะ dependency',
                hi: ' निर्भरता के रूप में अपने आप इंस्टॉल हो जाते हैं।',
              },
            )}
          </li>
        </ul>
      </section>

      <section>
        <h2>
          {t(
            {
              en: 'Step 3: Show the map',
              ja: 'ステップ 3: 地図を表示する',
              'es-419': 'Paso 3: Muestra el mapa',
              de: 'Schritt 3: Die Karte anzeigen',
              th: 'ขั้นที่ 3: แสดงแผนที่',
              hi: 'चरण 3: मैप दिखाएँ',
            },
          )}
        </h2>
        <p>
          {t(
            {
              en: 'Create the map state with ',
              ja: '',
              'es-419': 'Crea el estado del mapa con ',
              de: 'Erzeugen Sie den Kartenzustand mit ',
              th: 'สร้างสถานะแผนที่ด้วย ',
              hi: '',
            },
          )}
          <code>useMapLibreViewState</code>
          {t(
            {
              en: ' and render it with ',
              ja: ' で地図の状態を作り、',
              'es-419': ' y renderízalo con ',
              de: ' und rendern Sie ihn mit ',
              th: ' แล้วเรนเดอร์ด้วย ',
              hi: ' से मैप स्टेट बनाएँ और ',
            },
          )}
          <code>&lt;MapLibreMapView&gt;</code>
          {t(
            {
              en: '. Don’t forget the style CSS import. Give the outer element a height to make it full-screen.',
              ja: ' で描画します。スタイル用の CSS import を忘れずに。外側の要素に高さを与えると全画面になります。',
              'es-419': '. No olvides el import del CSS de estilos. Da una altura al elemento externo para que ocupe toda la pantalla.',
              de: '. Vergessen Sie den CSS-Import für die Styles nicht. Geben Sie dem äußeren Element eine Höhe, damit die Karte den ganzen Bildschirm füllt.',
              th: ' อย่าลืม import CSS ของสไตล์ และกำหนดความสูงให้อิลิเมนต์ด้านนอกเพื่อให้เต็มจอ',
              hi: ' से उसे रेंडर करें। स्टाइल की CSS import करना न भूलें। बाहरी एलिमेंट को ऊँचाई दें, तभी मैप पूरी स्क्रीन लेगा।',
            },
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
          {t(
            {
              en: 'Step 4: Place a marker',
              ja: 'ステップ 4: マーカーを置く',
              'es-419': 'Paso 4: Coloca un marcador',
              de: 'Schritt 4: Einen Marker setzen',
              th: 'ขั้นที่ 4: วางมาร์กเกอร์',
              hi: 'चरण 4: मार्कर रखें',
            },
          )}
        </h2>
        <p>
          {t(
            {
              en: 'Create the marker state with ',
              ja: '',
              'es-419': 'Crea el estado del marcador con ',
              de: 'Erzeugen Sie den Marker-Zustand mit ',
              th: 'สร้างสถานะมาร์กเกอร์ด้วย ',
              hi: '',
            },
          )}
          <code>createMarkerState</code>
          {t(
            {
              en: ' and register it with ',
              ja: ' でマーカーの状態を作り、',
              'es-419': ' y regístralo con ',
              de: ' und registrieren Sie ihn mit ',
              th: ' แล้วลงทะเบียนด้วย ',
              hi: ' से मार्कर स्टेट बनाएँ और ',
            },
          )}
          <code>&lt;Marker&gt;</code>
          {t(
            {
              en: '. Write overlays as ',
              ja: ' で登録します。オーバーレイは地図コンポーネントの',
              'es-419': '. Escribe las superposiciones como ',
              de: '. Overlays schreiben Sie als ',
              th: ' โดยเขียนโอเวอร์เลย์เป็น',
              hi: ' से उसे रजिस्टर करें। ओवरले मैप कंपोनेंट के ',
            },
          )}
          <strong>{t(
            {
              en: 'child elements',
              ja: '子要素',
              'es-419': 'elementos hijos',
              de: 'Kindelemente',
              th: 'อิลิเมนต์ลูก',
              hi: 'चाइल्ड एलिमेंट',
            },
          )}</strong>
          {t(
            {
              en: ' of the map component.',
              ja: 'として書きます。',
              'es-419': ' del componente del mapa.',
              de: ' der Kartenkomponente.',
              th: 'ของคอมโพเนนต์แผนที่',
              hi: ' के रूप में लिखे जाते हैं।',
            },
          )}
        </p>
        <Code>{`import { useMemo } from 'react';
import { createMarkerState } from '@mapconductor/js-sdk-core';
import { Marker } from '@mapconductor/js-sdk-react';

// ${t(
  {
    en: '...inside App...',
    ja: '...App の中...',
    'es-419': '...dentro de App...',
    de: '...innerhalb von App...',
    th: '...ภายใน App...',
    hi: '...App के अंदर...',
  },
)}
const marker = useMemo(
  () => createMarkerState({ id: 'hello', position: TOKYO }),
  [],
);

// ${t(
  {
    en: '...inside return...',
    ja: '...return の中...',
    'es-419': '...dentro de return...',
    de: '...innerhalb von return...',
    th: '...ภายใน return...',
    hi: '...return के अंदर...',
  },
)}
<MapLibreMapView state={mapViewState}>
  <Marker state={marker} />
</MapLibreMapView>`}</Code>
      </section>

      <section>
        <h2>
          {t(
            {
              en: 'Step 5: Show an InfoBubble on click',
              ja: 'ステップ 5: クリックで InfoBubble を表示する',
              'es-419': 'Paso 5: Muestra un InfoBubble al hacer clic',
              de: 'Schritt 5: Beim Klick eine InfoBubble zeigen',
              th: 'ขั้นที่ 5: แสดง InfoBubble เมื่อคลิก',
              hi: 'चरण 5: क्लिक पर InfoBubble दिखाएँ',
            },
          )}
        </h2>
        <p>
          {t(
            {
              en: 'Track the selected state with ',
              ja: '選択中かどうかを ',
              'es-419': 'Guarda el estado de selección con ',
              de: 'Verfolgen Sie den Auswahlzustand mit ',
              th: 'เก็บสถานะที่เลือกไว้ด้วย ',
              hi: 'चुने जाने की स्थिति ',
            },
          )}
          <code>useState</code>
          {t(
            {
              en: ', set it to true in the marker’s onClick, and render ',
              ja: ' で持ち、マーカーの onClick で true にします。選択中のときだけ ',
              'es-419': ', ponlo en true en el onClick del marcador y renderiza ',
              de: ', setzen Sie ihn im onClick des Markers auf true und rendern Sie ',
              th: ' แล้วตั้งเป็น true ใน onClick ของมาร์กเกอร์ จากนั้นเรนเดอร์ ',
              hi: ' में रखें, मार्कर के onClick में उसे true करें, और ',
            },
          )}
          <code>&lt;InfoBubble&gt;</code>
          {t(
            {
              en: ' only while selected. This is the finished app.',
              ja: ' を描画します。これが完成形です。',
              'es-419': ' solo mientras está seleccionado. Este es el resultado final.',
              de: ' nur, solange etwas ausgewählt ist. Das ist die fertige App.',
              th: ' เฉพาะตอนที่เลือกอยู่ นี่คือแอปที่เสร็จสมบูรณ์',
              hi: ' को सिर्फ़ चुने रहने तक रेंडर करें। यही पूरी ऐप है।',
            },
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
        <h2>{t(
          {
            en: 'Key points',
            ja: 'ポイント',
            'es-419': 'Puntos clave',
            de: 'Kernpunkte',
            th: 'จุดสำคัญ',
            hi: 'मुख्य बातें',
          },
        )}</h2>
        <ul className="hello-map-notes">
          <li>
            {t(
              {
                en: 'Coordinates, cameras and markers are created with ',
                ja: '座標・カメラ・マーカーは ',
                'es-419': 'Las coordenadas, cámaras y marcadores se crean con funciones de ',
                de: 'Koordinaten, Kameras und Marker entstehen mit den Funktionen aus ',
                th: 'พิกัด กล้อง และมาร์กเกอร์สร้างด้วยฟังก์ชันจาก ',
                hi: 'निर्देशांक, कैमरा और मार्कर ',
              },
            )}
            <code>js-sdk-core</code>
            {t(
              {
                en: ' functions (',
                ja: ' の関数で作る（',
                'es-419': ' (',
                de: ' (',
                th: ' (',
                hi: ' के फ़ंक्शन से बनते हैं (',
              },
            )}
            <strong>{t(
              {
                en: 'provider-independent',
                ja: 'プロバイダー非依存',
                'es-419': 'independiente del proveedor',
                de: 'anbieterunabhängig',
                th: 'ไม่ผูกกับผู้ให้บริการ',
                hi: 'प्रोवाइडर से स्वतंत्र',
              },
            )}</strong>
            {t({ en: ').', ja: '）', 'es-419': ').', de: ').', th: ')', hi: ')।' })}
          </li>
          <li>
            {t(
              {
                en: 'The map component and hooks come from ',
                ja: '地図コンポーネントとフックは ',
                'es-419': 'El componente del mapa y los hooks vienen de ',
                de: 'Die Kartenkomponente und die Hooks kommen aus ',
                th: 'คอมโพเนนต์แผนที่และฮุกมาจาก ',
                hi: 'मैप कंपोनेंट और हुक ',
              },
            )}
            <code>react-for-maplibre</code>
            {t({ en: ' (', ja: ' から来る（', 'es-419': ' (', de: ' (', th: ' (', hi: ' से आते हैं (' })}
            <strong>{t(
              {
                en: 'provider-specific',
                ja: 'プロバイダー固有',
                'es-419': 'específico del proveedor',
                de: 'anbieterspezifisch',
                th: 'เฉพาะผู้ให้บริการ',
                hi: 'प्रोवाइडर-विशिष्ट',
              },
            )}</strong>
            {t({ en: ').', ja: '）', 'es-419': ').', de: ').', th: ')', hi: ')।' })}
          </li>
          <li>
            {t(
              {
                en: 'Write overlays as ',
                ja: 'オーバーレイは地図コンポーネントの',
                'es-419': 'Escribe las superposiciones como ',
                de: 'Overlays schreiben Sie als ',
                th: 'เขียนโอเวอร์เลย์เป็น',
                hi: 'ओवरले मैप कंपोनेंट के ',
              },
            )}
            <strong>{t(
              {
                en: 'child elements',
                ja: '子要素',
                'es-419': 'elementos hijos',
                de: 'Kindelemente',
                th: 'อิลิเมนต์ลูก',
                hi: 'चाइल्ड एलिमेंट',
              },
            )}</strong>
            {t(
              {
                en: ' of the map component.',
                ja: 'として書く',
                'es-419': ' del componente del mapa.',
                de: ' der Kartenkomponente.',
                th: 'ของคอมโพเนนต์แผนที่',
                hi: ' के रूप में लिखे जाते हैं।',
              },
            )}
          </li>
          <li>
            {t(
              {
                en: 'Control show / hide with React ',
                ja: '表示・非表示は React の ',
                'es-419': 'Controla mostrar / ocultar con ',
                de: 'Ein- und Ausblenden steuern Sie mit React ',
                th: 'ควบคุมการแสดง / ซ่อนด้วย React ',
                hi: 'दिखाना / छिपाना React ',
              },
            )}
            <code>useState</code>
            {t(
              {
                en: '.',
                ja: ' で制御する',
                'es-419': ' de React.',
                de: '.',
                th: '',
                hi: ' से नियंत्रित करें।',
              },
            )}
          </li>
          <li>
            {t(
              {
                en: 'Use the sidebar on the left to jump to other samples such as circles, polygons and clustering.',
                ja: '左のサイドバーから、円・ポリゴン・クラスタリングなどの他サンプルへ移動できます。',
                'es-419': 'Usa la barra lateral de la izquierda para ir a otros ejemplos como círculos, polígonos y agrupación.',
                de: 'Über die Seitenleiste links springen Sie zu weiteren Beispielen wie Kreisen, Polygonen und Clustering.',
                th: 'ใช้แถบด้านซ้ายเพื่อข้ามไปยังตัวอย่างอื่น เช่น วงกลม โพลีกอน และการจัดกลุ่ม',
                hi: 'बाईं साइडबार से वृत्त, पॉलीगॉन और क्लस्टरिंग जैसे दूसरे सैंपल पर जा सकते हैं।',
              },
            )}
          </li>
        </ul>
      </section>
    </article>
  );
}
