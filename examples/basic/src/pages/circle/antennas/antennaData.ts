export interface Antenna { latitude: number; longitude: number; radius: number; registration: number; carrier: number }
export function horizonMeters(height: number): number {
  const r = 6378137;
  return r * (Math.acos(r / (r + height)) + Math.acos(r / (r + 1.5)));
}
export function decodeAntennas(buffer: ArrayBuffer): Antenna[] {
  const v = new DataView(buffer);
  if (v.byteLength < 8 || v.getUint32(0, false) !== 0x4d434345) throw new Error('Invalid antenna file');
  const count = v.getUint32(4, true);
  if (v.byteLength !== 8 + count * 16) throw new Error('Truncated antenna file');
  return Array.from({ length: count }, (_, i) => {
    const p = 8 + i * 16;
    const a = { latitude: v.getInt32(p, true) / 100000, longitude: v.getInt32(p + 4, true) / 100000, radius: v.getFloat32(p + 8, true), registration: i, carrier: Math.floor(v.getUint32(p + 12, true) / 1000) };
    if (!Number.isFinite(a.latitude) || Math.abs(a.latitude) > 90 || !Number.isFinite(a.longitude) || Math.abs(a.longitude) > 180 || !(a.radius > 0 && a.radius <= 100000) || a.carrier > 3) throw new Error('Invalid antenna record');
    return a;
  });
}
