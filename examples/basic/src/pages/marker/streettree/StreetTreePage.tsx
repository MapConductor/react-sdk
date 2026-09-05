import { useCallback, useState } from 'react';
import {
  MarkerTilingOptions,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { Markers } from '@mapconductor/js-sdk-react';
import { MapLibreDesign } from '@mapconductor/react-for-maplibre';
import { MapViewContainer } from '../../../MapViewContainer';
import { ControlPanel } from '../../../components/ControlPanel';
import { useSampleI18n } from '../../../samples/i18n';
import { StreetTreeInfoBubble } from './StreetTreeInfoBubble';
import { browserStreetTreeDataSource } from './streetTreeData';
import { useStreetTreeMarkers } from './useStreetTreeMarkers';

const INIT_CAMERA = { lat: 35.6812, lng: 139.7671, zoom: 11 };

const MARKER_TILING_OPTIONS: MarkerTilingOptions = {
  ...MarkerTilingOptions.Default,
  // Trees are planted a few metres apart along a road, so below street level
  // most of them sit on top of one another. Thinning them to one per icon
  // width halves the tile bytes and shows the same map.
  declutterPx: 14,
  iconScaleCallback: (_state, zoom) =>
    zoom > 15 ? 1.4 : zoom > 13 ? 1.0 : zoom > 11 ? 0.7 : 0.5,
};

export function StreetTreePage() {
  const { t } = useSampleI18n();
  const [selected, setSelected] = useState<MarkerState | null>(null);
  const selectMarker = useCallback((marker: MarkerState) => setSelected(marker), []);
  const { error, markerStates, trees, species, isLoading } =
    useStreetTreeMarkers(browserStreetTreeDataSource, selectMarker);

  /**
   * Swaps in a basemap stripped down to what a tree map needs: land, water,
   * the major roads and the place names, with the finer streets appearing from
   * zoom 13. The default style draws 51 transportation line layers, and at this
   * density they compete with the trees for every pixel.
   *
   * MapLibre only, by construction: the design type is provider-specific, and
   * this one carries a style URL. On any other provider the page runs on
   * whatever that provider's default is.
   */
  const applyTreeStyle = useCallback(
    (state: MapViewStateInterface<MapDesignTypeInterface<unknown>>) => {
      const maplibre = state as unknown as { mapDesignType?: unknown };
      if (!('mapDesignType' in maplibre)) return;
      const design = state.mapDesignType as { styleJsonURL?: string } | undefined;
      if (design && !('styleJsonURL' in design)) return;
      maplibre.mapDesignType = new MapLibreDesign(
        'street-tree',
        `${import.meta.env.BASE_URL}streettree/street-tree-style.json`,
      );
    },
    [],
  );

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>データの読み込みに失敗しました: {error}</p>
      </div>
    );
  }

  return (
    <MapViewContainer
      initialCamera={INIT_CAMERA}
      markerTilingOptions={MARKER_TILING_OPTIONS}
      onMapClick={() => setSelected(null)}
      onStateReady={applyTreeStyle}
    >
      <Markers states={markerStates} />
      {selected && <StreetTreeInfoBubble marker={selected} />}
      <ControlPanel
        title={t({
          en: 'Street Trees (144,183 markers)',
          ja: '街路樹（144,183件）',
          'es-419': 'Árboles urbanos (144,183 marcadores)',
          de: 'Straßenbäume (144.183 Marker)',
          th: 'ต้นไม้ริมถนน (144,183 มาร์กเกอร์)',
          hi: 'सड़क के पेड़ (144,183 मार्कर)',
        })}
      >
        <p className="control-panel-note">
          {isLoading
            ? t({
              en: 'Loading…',
              ja: '読み込み中…',
              'es-419': 'Cargando…',
              de: 'Wird geladen…',
              th: 'กำลังโหลด…',
              hi: 'लोड हो रहा है…',
            })
            : t({
              en: `${trees?.length ?? 0} trees, ${species?.length ?? 0} species, one colour each. Tap a tree for its record.`,
              ja: `${trees?.length ?? 0} 本・${species?.length ?? 0} 種、樹種ごとに色分け。タップで詳細が出ます。`,
              'es-419': `${trees?.length ?? 0} árboles, ${species?.length ?? 0} especies, un color cada una. Toca un árbol para ver su registro.`,
              de: `${trees?.length ?? 0} Bäume, ${species?.length ?? 0} Arten, je eine Farbe. Für Details antippen.`,
              th: `${trees?.length ?? 0} ต้น ${species?.length ?? 0} ชนิด สีละชนิด แตะเพื่อดูรายละเอียด`,
              hi: `${trees?.length ?? 0} पेड़, ${species?.length ?? 0} प्रजातियाँ, हर एक का एक रंग। विवरण के लिए टैप करें।`,
            })}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
