import type { SamplePageDoc } from '../types';
const doc: SamplePageDoc = {
  "camera": {
    "latitude": 39,
    "longitude": -98,
    "zoom": 4
  },
  "code": "<MapViewContainer state={mapViewState} circleTilingOptions={CircleTilingOptions.Default}>\n  <Circles states={states} />\n</MapViewContainer>",
  "state": "const [states, setStates] = useState<ReturnType<typeof createCircleState>[]>([]);\nuseEffect(() => {\n  if (typeof window === 'undefined') return;\n  const abort = new AbortController();\n  fetch('/antennas/us-antennas.bin', { signal: abort.signal })\n    .then(response => { if (!response.ok) throw new Error('FCC data download failed'); return response.arrayBuffer(); })\n    .then(buffer => setStates(decodeAntennas(buffer).map(a => createCircleState({\n      center: createGeoPoint(a), radiusMeters: horizonMeters(a.height), geodesic: true,\n      id: `asr-${a.registration}`, fillColor: 'rgba(37,99,235,0.035)', strokeWidth: 0.5,\n    }))))\n    .catch(error => { if (!abort.signal.aborted) console.error(error); });\n  return () => abort.abort();\n}, []);",
  "helpers": "interface Antenna { latitude: number; longitude: number; height: number; registration: number }\nfunction horizonMeters(height: number): number {\n  const r = 6378137;\n  return r * (Math.acos(r / (r + height)) + Math.acos(r / (r + 1.5)));\n}\nfunction decodeAntennas(buffer: ArrayBuffer): Antenna[] {\n  const v = new DataView(buffer);\n  if (v.byteLength < 8 || v.getUint32(0, false) !== 0x4d434341) throw new Error('Invalid antenna file');\n  const count = v.getUint32(4, true);\n  if (v.byteLength !== 8 + count * 16) throw new Error('Truncated antenna file');\n  return Array.from({ length: count }, (_, i) => {\n    const p = 8 + i * 16;\n    const a = { latitude: v.getFloat32(p, true), longitude: v.getFloat32(p + 4, true), height: v.getFloat32(p + 8, true), registration: v.getUint32(p + 12, true) };\n    if (!Number.isFinite(a.latitude) || Math.abs(a.latitude) > 90 || !Number.isFinite(a.longitude) || Math.abs(a.longitude) > 180 || !(a.height > 0 && a.height <= 1000)) throw new Error('Invalid antenna record');\n    return a;\n  });\n}\n",
  "explanation": {
    "en": [
      "Draw 141,979 FCC antenna structures using one Circles component. The binary file is bundled with this example at /antennas/us-antennas.bin.",
      "The radius is a spherical geometric horizon derived from structure height and a 1.5 m receiver, not actual radio coverage. geodesic=true keeps the radius a surface distance.",
      "FCC ASR includes non-cellular structures. Terrain, radiation patterns and refraction are omitted; source and reproducible packing instructions are in tools/antennas."
    ],
    "ja": [
      "FCC のアンテナ構造物141,979件を Circles で一括登録します。データは example の /antennas/us-antennas.bin に同梱しています。",
      "高さと受信点1.5 mから球面上の見通し距離を計算し、geodesic=true で描きます。実際の電波カバー範囲ではありません。",
      "携帯基地局以外も含み、地形・指向性・屈折は考慮しません。出典と再生成手順は tools/antennas にあります。"
    ],
    "es-419": [
      "Draw 141,979 FCC antenna structures using one Circles component. The binary file is bundled with this example at /antennas/us-antennas.bin.",
      "The radius is a spherical geometric horizon derived from structure height and a 1.5 m receiver, not actual radio coverage. geodesic=true keeps the radius a surface distance.",
      "FCC ASR includes non-cellular structures. Terrain, radiation patterns and refraction are omitted; source and reproducible packing instructions are in tools/antennas."
    ],
    "de": [
      "Draw 141,979 FCC antenna structures using one Circles component. The binary file is bundled with this example at /antennas/us-antennas.bin.",
      "The radius is a spherical geometric horizon derived from structure height and a 1.5 m receiver, not actual radio coverage. geodesic=true keeps the radius a surface distance.",
      "FCC ASR includes non-cellular structures. Terrain, radiation patterns and refraction are omitted; source and reproducible packing instructions are in tools/antennas."
    ],
    "th": [
      "Draw 141,979 FCC antenna structures using one Circles component. The binary file is bundled with this example at /antennas/us-antennas.bin.",
      "The radius is a spherical geometric horizon derived from structure height and a 1.5 m receiver, not actual radio coverage. geodesic=true keeps the radius a surface distance.",
      "FCC ASR includes non-cellular structures. Terrain, radiation patterns and refraction are omitted; source and reproducible packing instructions are in tools/antennas."
    ],
    "hi": [
      "Draw 141,979 FCC antenna structures using one Circles component. The binary file is bundled with this example at /antennas/us-antennas.bin.",
      "The radius is a spherical geometric horizon derived from structure height and a 1.5 m receiver, not actual radio coverage. geodesic=true keeps the radius a surface distance.",
      "FCC ASR includes non-cellular structures. Terrain, radiation patterns and refraction are omitted; source and reproducible packing instructions are in tools/antennas."
    ]
  }
};
export default doc;
