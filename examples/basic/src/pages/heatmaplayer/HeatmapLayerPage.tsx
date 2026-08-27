import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { createGeoPoint, createMapCameraPosition } from '@mapconductor/js-sdk-core';
import { MapLibreDesign, MapLibreMapView2D, useMapLibreViewState, type MapLibreViewState } from '@mapconductor/react-for-maplibre';
import { MapboxDesign, MapBoxMapView2D, useMapboxViewState, type MapboxViewState } from '@mapconductor/react-for-mapbox';
import { LeafletDesign, LeafletMapView, useLeafletMapViewState, type LeafletMapViewState } from '@mapconductor/react-for-leaflet';
import { OpenLayersDesign, OpenLayersMapView, useOpenLayersMapViewState, type OpenLayersMapViewState } from '@mapconductor/react-for-openlayers';
import { ArcGISDesign, ArcGISMapView2D, useArcGISViewState, type ArcGISViewState } from '@mapconductor/react-for-arcgis';
import { TomTomDesign, TomTomMapView2D, useTomTomViewState, type TomTomViewState } from '@mapconductor/react-for-tomtom';
import { MapTilerDesign, MapTilerMapView2D, useMapTilerViewState, type MapTilerViewState } from '@mapconductor/react-for-maptiler';
import { MapplsDesign, MapplsMapView2D, useMapplsViewState, type MapplsViewState } from '@mapconductor/react-for-mappls';
import { HeatmapOverlay, HeatmapPoints, HeatmapPointState } from '@mapconductor/react-heatmap';
import { ControlPanel } from '../../components/ControlPanel';
import { SingletonMapSlot, useSingletonMapState } from '../../SingletonMaps';
import { useSampleI18n } from '../../samples/i18n';

const INIT_CAMERA_POSITION = createMapCameraPosition({
  position: createGeoPoint({ latitude: 35.68049, longitude: 139.76669 }),
  zoom: 10,
});

function HeatmapLayerPageContent({
  renderMapView,
}: {
  renderMapView: (children: ReactNode) => ReactNode;
}) {
  const { t } = useSampleI18n();
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPointState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}postoffice/postoffices.json`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<[number, number, string, string][]>;
      })
      .then(data => {
        const points = data.map(([lat, lng], i) =>
          new HeatmapPointState({
            id: `po-${i}`,
            position: createGeoPoint({ latitude: lat, longitude: lng }),
          }),
        );
        setHeatmapPoints(points);
        setIsLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setIsLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>データの読み込みに失敗しました: {error}</p>
      </div>
    );
  }

  return renderMapView(
    <>
      <HeatmapOverlay>
        <HeatmapPoints states={heatmapPoints} />
      </HeatmapOverlay>

      <ControlPanel title={t(
        {
          en: 'Heatmap Layer (24,526 points)',
          ja: 'ヒートマップレイヤー（24,526件）',
          'es-419': 'Capa de mapa de calor (24,526 puntos)',
          de: 'Heatmap-Ebene (24.526 Punkte)',
          th: 'เลเยอร์ฮีตแมป (24,526 จุด)',
          hi: 'हीटमैप लेयर (24,526 बिंदु)',
        },
      )}>
        {isLoading ? (
          <p className="control-panel-note">{t(
            {
              en: 'Loading data…',
              ja: 'データを読み込んでいます…',
              'es-419': 'Cargando datos…',
              de: 'Daten werden geladen…',
              th: 'กำลังโหลดข้อมูล…',
              hi: 'डेटा लोड हो रहा है…',
            },
          )}</p>
        ) : (
          <p className="control-panel-note">
            {t(
              {
                en: 'Postal-office data is displayed as a heatmap.',
                ja: '郵便局データをヒートマップで表示しています。',
                'es-419': 'Los datos de oficinas postales se muestran como un mapa de calor.',
                de: 'Die Postfilialdaten werden als Heatmap dargestellt.',
                th: 'แสดงข้อมูลที่ทำการไปรษณีย์เป็นฮีตแมป',
                hi: 'डाकघरों का डेटा हीटमैप के रूप में दिखाया गया है।',
              },
            )}
          </p>
        )}
      </ControlPanel>
    </>,
  );
}

function GoogleHeatmapLayerPage() {
  useSingletonMapState('google-2d', INIT_CAMERA_POSITION);
  return (
    <HeatmapLayerPageContent
      renderMapView={children => <SingletonMapSlot id="google-2d">{children}</SingletonMapSlot>}
    />
  );
}

function MapLibreHeatmapLayerPage() {
  const mapViewState = useMapLibreViewState({
    mapDesignType: MapLibreDesign.MapTilerTonerEn,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return (
    <HeatmapLayerPageContent
      renderMapView={children => <MapLibreMapView2D state={mapViewState as MapLibreViewState}>{children}</MapLibreMapView2D>}
    />
  );
}

function MapboxHeatmapLayerPage() {
  const mapViewState = useMapboxViewState({
    accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? '',
    mapDesignType: MapboxDesign.Light,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return (
    <HeatmapLayerPageContent
      renderMapView={children => <MapBoxMapView2D state={mapViewState as MapboxViewState}>{children}</MapBoxMapView2D>}
    />
  );
}

function LeafletHeatmapLayerPage() {
  const mapViewState = useLeafletMapViewState({
    mapDesignType: LeafletDesign.OpenStreetMap,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return (
    <HeatmapLayerPageContent
      renderMapView={children => <LeafletMapView state={mapViewState as LeafletMapViewState}>{children}</LeafletMapView>}
    />
  );
}

function OpenLayersHeatmapLayerPage() {
  const mapViewState = useOpenLayersMapViewState({
    mapDesignType: OpenLayersDesign.OpenStreetMap,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return (
    <HeatmapLayerPageContent
      renderMapView={children => <OpenLayersMapView state={mapViewState as OpenLayersMapViewState}>{children}</OpenLayersMapView>}
    />
  );
}

function ArcGISHeatmapLayerPage() {
  const mapViewState = useArcGISViewState({
    apiKey: import.meta.env.VITE_ARCGIS_API_KEY ?? '',
    mapDesignType: ArcGISDesign.Streets,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return (
    <HeatmapLayerPageContent
      renderMapView={children => <ArcGISMapView2D state={mapViewState as ArcGISViewState}>{children}</ArcGISMapView2D>}
    />
  );
}

function TomTomHeatmapLayerPage() {
  const mapViewState = useTomTomViewState({
    apiKey: import.meta.env.VITE_TOMTOM_API_KEY ?? '',
    mapDesignType: TomTomDesign.MonoLight,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return (
    <HeatmapLayerPageContent
      renderMapView={children => <TomTomMapView2D state={mapViewState as TomTomViewState}>{children}</TomTomMapView2D>}
    />
  );
}

function MapplsHeatmapLayerPage() {
  const mapViewState = useMapplsViewState({
    apiKey: import.meta.env.VITE_MAPPLS_API_KEY ?? '',
    mapDesignType: MapplsDesign.Default,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return (
    <HeatmapLayerPageContent
      renderMapView={children => <MapplsMapView2D state={mapViewState as MapplsViewState}>{children}</MapplsMapView2D>}
    />
  );
}

function MapTilerHeatmapLayerPage() {
  const mapViewState = useMapTilerViewState({
    apiKey: import.meta.env.VITE_MAPTILER ?? '',
    mapDesignType: MapTilerDesign.StreetsLight,
    cameraPosition: INIT_CAMERA_POSITION,
  });
  return (
    <HeatmapLayerPageContent
      renderMapView={children => <MapTilerMapView2D state={mapViewState as MapTilerViewState}>{children}</MapTilerMapView2D>}
    />
  );
}

export function HeatmapLayerPage() {
  const location = useLocation();
  if (location.pathname.startsWith('/google-maps')) return <GoogleHeatmapLayerPage />;
  if (location.pathname.startsWith('/maptiler')) return <MapTilerHeatmapLayerPage />;
  if (location.pathname.startsWith('/tomtom')) return <TomTomHeatmapLayerPage />;
  if (location.pathname.startsWith('/mappls')) return <MapplsHeatmapLayerPage />;
  if (location.pathname.startsWith('/mapbox')) return <MapboxHeatmapLayerPage />;
  if (location.pathname.startsWith('/leaflet')) return <LeafletHeatmapLayerPage />;
  if (location.pathname.startsWith('/openlayers')) return <OpenLayersHeatmapLayerPage />;
  if (location.pathname.startsWith('/arcgis')) return <ArcGISHeatmapLayerPage />;
  return <MapLibreHeatmapLayerPage />;
}
