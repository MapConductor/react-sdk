import { withAndroidManifest, withInfoPlist, type ConfigPlugin } from 'expo/config-plugins';

const withGoogleMapsApiKeys: ConfigPlugin = (config) => {
  config = withAndroidManifest(config, (mod) => {
    const apiKey = (config.android?.config as { googleMapsApiKey?: string } | undefined)?.googleMapsApiKey;
    if (!apiKey) return mod;

    const application = mod.modResults.manifest.application![0];
    application['meta-data'] ??= [];
    const metadata = application['meta-data'];
    const entry = metadata.find((item) => item.$?.['android:name'] === 'com.google.android.geo.API_KEY');
    if (entry) {
      entry.$!['android:value'] = apiKey;
    } else {
      metadata.push({
        $: {
          'android:name': 'com.google.android.geo.API_KEY',
          'android:value': apiKey,
          'tools:replace': 'android:value',
        },
      });
    }
    return mod;
  });

  return withInfoPlist(config, (mod) => {
    const apiKey = (config.ios?.config as { googleMapsApiKey?: string } | undefined)?.googleMapsApiKey;
    if (apiKey) mod.modResults.GMSApiKey = apiKey;
    return mod;
  });
};

/**
 * Longdo Map API3 のキーを AndroidManifest と Info.plist へ入れる。
 * ネイティブ側（`LongdoInitSDK`）が Android は `longdo.map.key`、
 * iOS は `LONGDO_API_KEY` を読む。
 *
 * **どちらもプレースホルダしか書かない。** prebuild が生成する
 * AndroidManifest.xml / Info.plist は git 管理下なので、鍵を直に入れると漏れる。
 * 実値は android が gradle の manifestPlaceholders、iOS が xcodebuild のビルド設定
 * （`LONGDO_API_KEY=...`）から来る。どちらも .env.local（git 管理外）が出所。
 */
const withLongdoApiKey: ConfigPlugin = (config) => {
  config = withInfoPlist(config, (mod) => {
    // Xcode は Info.plist の値に含まれる $(...) をビルド設定で展開する。
    // 展開されなかった場合は `LongdoInitSDK.resolveApiKey` が "$(" を見て弾く
    // （プレースホルダのまま API キーとして使われるのを防ぐため）。
    mod.modResults.LONGDO_API_KEY = '$(LONGDO_API_KEY)';
    return mod;
  });

  return withAndroidManifest(config, (mod) => {
    // 値そのものではなく manifest プレースホルダを入れる。prebuild で生成される
    // AndroidManifest.xml は git 管理下なので、鍵を直接書くと漏れる。
    // 実際の値は app/build.gradle が manifestPlaceholders で埋める。
    const apiKey = '${LONGDO_API_KEY}';

    const application = mod.modResults.manifest.application![0];
    application['meta-data'] ??= [];
    const metadata = application['meta-data'];
    const entry = metadata.find((item) => item.$?.['android:name'] === 'longdo.map.key');
    if (entry) {
      entry.$!['android:value'] = apiKey;
    } else {
      metadata.push({
        $: {
          'android:name': 'longdo.map.key',
          'android:value': apiKey,
          'tools:replace': 'android:value',
        },
      });
    }
    return mod;
  });
};

export default {
  expo: {
    name: 'MapConductor Basic',
    slug: 'mapconductor-basic',
    version: '1.0.0',
    // 横向きにも対応する。地図は縦横比が変わるので、回転はプロバイダごとの
    // リサイズ経路を通す数少ないサンプルでもある。
    orientation: 'default',
    platforms: ['ios', 'android'],
    // Include the marker images in standalone/native builds.  Metro's `require`
    // references are still used by the page, while expo-asset copies these
    // files into the application bundle at build time so native map providers
    // can resolve their local URI on iOS and Android.
    assetBundlePatterns: ['assets/**/*'],
    android: {
      package: 'com.mapconductor.basic',
      config: {
        googleMapsApiKey: process.env.ANDROID_GOOGLE_MAPS_API_KEY,
      },
    },
    ios: {
      bundleIdentifier: 'com.mapconductor.basic',
      config: {
        googleMapsApiKey: process.env.IOS_GOOGLE_MAPS_API_KEY,
      },
    },
    plugins: [
      withGoogleMapsApiKeys,
      withLongdoApiKey,
      // Link marker images as native resources. iOS resolves their asset-catalog
      // names through bundle:// URIs; Android can keep using expo-asset file URIs.
      ['expo-asset', { assets: ['./assets/images'] }],
    ],
  },
};
