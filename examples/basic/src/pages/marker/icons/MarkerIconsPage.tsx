import { useEffect, useMemo, useState } from 'react';
import {
  ColorDefaultIcon,
  ImageDefaultIcon,
  ImageIcon,
  MarkerIconSize,
  createGeoPoint,
  createMarkerState,
  type MarkerIcon,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { CircleIcon, FlagIcon, RightTailInfoBubbleIcon, RoundInfoBubbleIcon } from '@mapconductor/react-icons';
import { InfoBubble, Markers } from '@mapconductor/js-sdk-react';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 0.014, lng: 0.008, zoom: 15 };

const WEATHER_ICON_URL = svgDataUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="14" fill="#facc15"/>
    <g stroke="#f59e0b" stroke-width="5" stroke-linecap="round">
      <path d="M32 5v9"/><path d="M32 50v9"/><path d="M5 32h9"/><path d="M50 32h9"/>
      <path d="M13 13l7 7"/><path d="M44 44l7 7"/><path d="M51 13l-7 7"/><path d="M20 44l-7 7"/>
    </g>
  </svg>
`);

const HUMAN_ICON_URL = svgDataUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="14" fill="#dbeafe"/>
    <circle cx="32" cy="22" r="10" fill="#2563eb"/>
    <path d="M14 58c2.4-12.5 9-20 18-20s15.6 7.5 18 20z" fill="#1d4ed8"/>
  </svg>
`);

const LAUNCHER_ICON_URL = svgDataUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="#22c55e"/>
    <path d="M20 25h24v20a6 6 0 0 1-6 6H26a6 6 0 0 1-6-6z" fill="#ecfccb"/>
    <path d="M23 25l-5-8M41 25l5-8" stroke="#ecfccb" stroke-width="4" stroke-linecap="round"/>
    <circle cx="27" cy="34" r="2.5" fill="#16a34a"/>
    <circle cx="37" cy="34" r="2.5" fill="#16a34a"/>
  </svg>
`);

const DEFAULT_MARKER_ICON_URL = svgDataUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <path d="M32 60S13 38 13 25a19 19 0 1 1 38 0c0 13-19 35-19 35z" fill="#ef4444"/>
    <circle cx="32" cy="25" r="8" fill="#ffffff"/>
  </svg>
`);

interface MarkerDefinition {
  id: string;
  lat: number;
  lng: number;
  icon?: MarkerIcon | null;
  extra: string;
}

export function MarkerIconsPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const weatherImage = useLoadedImage(WEATHER_ICON_URL);
  const humanImage = useLoadedImage(HUMAN_ICON_URL);
  const launcherImage = useLoadedImage(LAUNCHER_ICON_URL);
  const weatherPngUrl = useRasterizedDataUrl(WEATHER_ICON_URL);
  const defaultMarkerPngUrl = useRasterizedDataUrl(DEFAULT_MARKER_ICON_URL);
  const labelImage = useLabeledMarkerImage('Label');
  const [selected, setSelected] = useState<MarkerState | null>(null);

  const markerDefinitions = useMemo<MarkerDefinition[]>(() => {
    const definitions: MarkerDefinition[] = [
      {
        id: 'default-scale-0-7',
        lat: 0.018,
        lng: 0.004,
        icon: new ColorDefaultIcon('#ff0000', { scale: 0.7, label: '0.7', debug: true }),
        extra: `DefaultIcon(
  scale = 0.7,
  label = "0.7",
  debug = true,
)`,
      },
      {
        id: 'default-scale-1-0',
        lat: 0.018,
        lng: 0.006,
        icon: new ColorDefaultIcon('#ff0000', { scale: 1, label: '1.0', debug: true }),
        extra: `DefaultIcon(
  scale = 1.0,
  label = "1.0",
  debug = true,
)`,
      },
      {
        id: 'default-scale-1-4',
        lat: 0.018,
        lng: 0.009,
        icon: new ColorDefaultIcon('#ff0000', { scale: 1.4, label: '1.4', debug: true }),
        extra: `DefaultIcon(
  scale = 1.4,
  label = "1.4",
  debug = true,
)`,
      },
      {
        id: 'default-scale-2-1',
        lat: 0.018,
        lng: 0.013,
        icon: new ColorDefaultIcon('#ff0000', { scale: 2.1, label: '2.1', debug: true }),
        extra: `DefaultIcon(
  scale = 2.1,
  label = "2.1",
  debug = true,
)`,
      },
      {
        id: 'default',
        lat: 0.014,
        lng: 0.004,
        icon: null,
        extra: 'DefaultIcon()',
      },
      {
        id: 'default-yellow',
        lat: 0.014,
        lng: 0.008,
        icon: new ColorDefaultIcon('#ffff00', { strokeColor: '#000000', strokeWidth: 2 }),
        extra: `DefaultIcon(
  fillColor = Color.Yellow,
  strokeColor = Color.Black,
  strokeWidth = 2.dp,
)`,
      },
      {
        id: 'default-labeled',
        lat: 0.014,
        lng: 0.012,
        icon: new ColorDefaultIcon('#2ef527', {
          strokeColor: '#fc225c',
          label: 'AB',
          labelTextColor: '#ffffff',
          labelStrokeColor: '#000000',
        }),
        extra: `DefaultIcon(
  fillColor = Color(red = 0x2E, green = 0xF5, blue = 0x27),
  strokeColor = Color(red = 0xFC, green = 0x22, blue = 0x5C),
  label = "AB",
  labelTextColor = Color.White,
  labelStrokeColor = Color.Black,
)`,
      },
      {
        id: 'circle-icon',
        lat: 0.006,
        lng: 0.004,
        icon: new CircleIcon('#0000ff', { strokeColor: '#ffffff', strokeWidth: 2 }),
        extra: `CircleIcon(
  fillColor = Color.Blue,
  strokeColor = Color.White,
  strokeWidth = 2.dp,
)`,
      },
      {
        id: 'flag-icon',
        lat: 0.006,
        lng: 0.007,
        icon: new FlagIcon('#008000', { strokeColor: '#808080', strokeWidth: 1 }),
        extra: `FlagIcon(
  fillColor = Color.Green,
  strokeColor = Color.Gray,
  strokeWidth = 1.dp,
)`,
      },
      {
        id: 'round-info-bubble-icon',
        lat: 0.006,
        lng: 0.012,
        icon: new RoundInfoBubbleIcon(defaultMarkerPngUrl ?? DEFAULT_MARKER_ICON_URL, '$197', {
          fillColor: '#ffffff',
          scale: 1,
          iconSize: MarkerIconSize.Small,
        }),
        extra: `RoundInfoBubbleIcon(
  label = "$197",
  fillColor = Color.White,
  scale = 1,
  iconSize = MarkerIconSize.Small,
)`,
      },
      {
        id: 'right-tail-info-bubble-icon',
        lat: 0,
        lng: 0.004,
        icon: new RightTailInfoBubbleIcon(weatherPngUrl ?? WEATHER_ICON_URL, '5時間37分', '304マイル', {
          fillColor: '#ffffff',
          labelTextColor: '#000000',
          scale: 0.8,
        }),
        extra: `RightTailInfoBubbleIcon(
  label = "5 Hours and 37 minutes",
  snippet = "304 miles.",
  fillColor = Color.White,
  labelTextColor = Color.Black,
  scale = 0.8,
)`,
      },
    ];

    if (humanImage) {
      definitions.splice(7, 0, {
        id: 'drawable-human',
        lat: 0.01,
        lng: 0.004,
        icon: new ImageDefaultIcon(humanImage),
        extra: `DrawableDefaultIcon(
  backgroundDrawable = icon,
)`,
      });
    }

    if (launcherImage) {
      definitions.splice(8, 0, {
        id: 'drawable-launcher',
        lat: 0.01,
        lng: 0.006,
        icon: new ImageDefaultIcon(launcherImage, { strokeColor: '#000000', scale: 1.5 }),
        extra: `DrawableDefaultIcon(
  backgroundDrawable = icon,
  strokeColor = Color.Black,
  scale = 1.5,
)`,
      });
    }

    if (weatherImage) {
      definitions.splice(9, 0, {
        id: 'image-weather',
        lat: 0.01,
        lng: 0.009,
        icon: new ImageIcon(weatherImage, { debug: true, anchor: { x: 0.5, y: 1 } }),
        extra: `ImageIcon(
  drawable = icon,
  debug = true,
  anchor = PointF(0.5, 1.0),
)`,
      });
    }

    if (labelImage) {
      definitions.splice(10, 0, {
        id: 'image-label',
        lat: 0.01,
        lng: 0.012,
        icon: new ImageIcon(labelImage, { anchor: { x: 0.5, y: 1 } }),
        extra: `ImageIcon(
  drawable = createMarkerWithLabelIcon(label),
  anchor = Offset(0.5, 1.0),
)`,
      });
    }

    return definitions;
  }, [defaultMarkerPngUrl, humanImage, labelImage, launcherImage, weatherImage, weatherPngUrl]);

  const markers = useMemo(
    () =>
      markerDefinitions.map(({ id, lat, lng, icon, extra }) =>
        createMarkerState({
          id,
          position: createGeoPoint({ latitude: lat, longitude: lng }),
          icon,
          extra,
          onClick: setSelected,
        })
      ),
    [markerDefinitions]
  );

  return (
    <MapViewContainer state={mapViewState} onMapClick={() => setSelected(null)}>
      <Markers states={markers} />
      {typeof selected?.extra === 'string' && (
        <InfoBubble marker={selected} bubbleColor="#ffffff">
          <pre className="marker-icon-info-bubble">{selected.extra}</pre>
        </InfoBubble>
      )}
    </MapViewContainer>
  );
}

function useLoadedImage(url: string): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const nextImage = new Image();
    nextImage.onload = () => setImage(nextImage);
    nextImage.src = url;
    return () => {
      nextImage.onload = null;
    };
  }, [url]);

  return image;
}

function useRasterizedDataUrl(url: string): string | null {
  const image = useLoadedImage(url);
  const [rasterizedUrl, setRasterizedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!image) return;
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth || image.width || 64;
    canvas.height = image.naturalHeight || image.height || 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    setRasterizedUrl(canvas.toDataURL('image/png'));
  }, [image]);

  return rasterizedUrl;
}

function useLabeledMarkerImage(label: string): HTMLCanvasElement | null {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = 96;
    nextCanvas.height = 144;
    const ctx = nextCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#2563eb';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(48, 138);
    ctx.bezierCurveTo(41, 112, 18, 91, 18, 56);
    ctx.bezierCurveTo(18, 34, 31, 20, 48, 20);
    ctx.bezierCurveTo(65, 20, 78, 34, 78, 56);
    ctx.bezierCurveTo(78, 91, 55, 112, 48, 138);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 48, 68);

    setCanvas(nextCanvas);
  }, [label]);

  return canvas;
}

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}
