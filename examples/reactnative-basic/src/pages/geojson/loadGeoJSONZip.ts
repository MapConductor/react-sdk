import { Asset } from 'expo-asset';

export async function loadGeoJSONZipAsset(moduleId: number): Promise<string> {
  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();
  return asset.localUri ?? asset.uri;
}
