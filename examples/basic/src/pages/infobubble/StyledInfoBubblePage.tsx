import { useEffect, useMemo, useState } from 'react';
import { DefaultMarkerIcon, createGeoPoint, createMarkerState } from '@mapconductor/js-sdk-core';
import { InfoBubble, Marker } from '@mapconductor/js-sdk-react';
import { ControlPanel, SliderControl } from '../../components/ControlPanel';
import { MapViewContainer } from '../../MapViewContainer';
import { useSampleI18n } from '../../samples/i18n';

// android の StyledInfoBubblePage.kt / ios の StyledInfoBubblePage.swift と同一仕様:
// マーカー 1 個と常時表示の InfoBubble を置き、パネルの 8 色スウォッチ 4 行
// （バブル塗り / バブル枠線 / 文字 / マーカー）と 2 本のスライダー
// （枠線幅・マーカースケール 0.5〜2.0、0.25 刻み）でスタイルを組み替える。
const INIT_CAMERA = { lat: 35.6812, lng: 139.7671, zoom: 14 };
const POSITION = createGeoPoint({ latitude: 35.6812, longitude: 139.7671 });

// 4 行で共有する 8 色。白と黒を含めておくと塗り＝白 / 文字＝黒の既定も同じ列で選べる。
const PALETTE = [
  '#ffffff', '#111827', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#3b82f6', '#a855f7',
] as const;

function SwatchRow({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: string;
  onSelect: (color: string) => void;
}) {
  return (
    <div className="swatch-row">
      <span className="swatch-row-label">{label}</span>
      <div className="swatch-row-colors">
        {PALETTE.map(color => (
          <button
            key={color}
            type="button"
            className={`color-swatch${selected === color ? ' selected' : ''}`}
            style={{ background: color }}
            aria-label={`${label} ${color}`}
            data-testid={`swatch-${label}-${color}`}
            onClick={() => onSelect(color)}
          />
        ))}
      </div>
    </div>
  );
}

export function StyledInfoBubblePage() {
  const { t } = useSampleI18n();
  const [fillColor, setFillColor] = useState<string>('#ffffff');
  const [strokeColor, setStrokeColor] = useState<string>('#111827');
  const [fontColor, setFontColor] = useState<string>('#111827');
  const [markerColor, setMarkerColor] = useState<string>('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState(2.0);
  const [markerScale, setMarkerScale] = useState(1.0);

  const marker = useMemo(
    () => createMarkerState({
      id: 'styled-bubble-marker',
      position: POSITION,
      icon: new DefaultMarkerIcon({ fillColor: '#ef4444' }),
    }),
    [],
  );

  useEffect(() => {
    marker.icon = new DefaultMarkerIcon({ fillColor: markerColor, scale: markerScale });
  }, [marker, markerColor, markerScale]);

  // InfoBubble はスタイルとマーカーアイコンを登録時に焼き込むので、
  // 変更のたびに key で再マウントして最新の見た目・配置に揃える。
  const bubbleKey = `${fillColor}|${strokeColor}|${fontColor}|${strokeWidth}|${markerScale}`;

  return (
    <MapViewContainer initialCamera={INIT_CAMERA}>
      <Marker state={marker} />
      <InfoBubble
        key={bubbleKey}
        marker={marker}
        bubbleColor={fillColor}
        borderColor={strokeColor}
        borderWidth={strokeWidth}
        cornerRadius={6}
        contentPadding={10}
      >
        <div style={{ color: fontColor, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {t(
            {
              en: 'Custom Styled Bubble',
              ja: 'カスタムスタイル吹き出し',
              'es-419': 'Globo con estilo personalizado',
              de: 'Eigens gestaltete Sprechblase',
              th: 'บับเบิลที่จัดสไตล์เอง',
              hi: 'अपनी स्टाइल वाला बबल',
            },
          )}
        </div>
      </InfoBubble>
      <ControlPanel title={t(
        {
          en: 'Styled Bubble',
          ja: 'スタイル付き吹き出し',
          'es-419': 'Globo con estilo',
          de: 'Gestaltete Sprechblase',
          th: 'บับเบิลแบบมีสไตล์',
          hi: 'स्टाइल वाला बबल',
        },
      )}>
        <SwatchRow label={t({ en: 'Fill', ja: '塗り', 'es-419': 'Relleno', de: 'Füllung', th: 'สีเติม', hi: 'भराव' })} selected={fillColor} onSelect={setFillColor} />
        <SwatchRow label={t({ en: 'Stroke', ja: '枠線', 'es-419': 'Trazo', de: 'Kontur', th: 'เส้นขอบ', hi: 'रेखा' })} selected={strokeColor} onSelect={setStrokeColor} />
        <SwatchRow label={t({ en: 'Font', ja: '文字', 'es-419': 'Fuente', de: 'Schrift', th: 'ตัวอักษร', hi: 'फ़ॉन्ट' })} selected={fontColor} onSelect={setFontColor} />
        <SwatchRow label={t({ en: 'Marker', ja: 'マーカー', 'es-419': 'Marcador', de: 'Marker', th: 'มาร์กเกอร์', hi: 'मार्कर' })} selected={markerColor} onSelect={setMarkerColor} />
        <SliderControl
          label={t(
            {
              en: 'Stroke Width',
              ja: '枠線幅',
              'es-419': 'Grosor del trazo',
              de: 'Linienbreite',
              th: 'ความหนาเส้น',
              hi: 'रेखा की मोटाई',
            },
          )}
          value={strokeWidth}
          min={0.5}
          max={2.0}
          step={0.25}
          format={value => value.toFixed(2)}
          onChange={setStrokeWidth}
        />
        <SliderControl
          label={t(
            {
              en: 'Marker Scale',
              ja: 'マーカースケール',
              'es-419': 'Escala del marcador',
              de: 'Marker-Skalierung',
              th: 'ขนาดมาร์กเกอร์',
              hi: 'मार्कर स्केल',
            },
          )}
          value={markerScale}
          min={0.5}
          max={2.0}
          step={0.25}
          format={value => value.toFixed(2)}
          onChange={setMarkerScale}
        />
      </ControlPanel>
    </MapViewContainer>
  );
}
