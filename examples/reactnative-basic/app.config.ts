import { withAndroidManifest, withInfoPlist, type ConfigPlugin } from 'expo/config-plugins';

const withGoogleMapsApiKeys: ConfigPlugin = (config) => {
  config = withAndroidManifest(config, (mod) => {
    // **実キーを書かない。** manifest は git 管理下なので、他キー
    // （longdo.map.key / MAPTILER_API_KEY / MAPBOX_ACCESS_TOKEN）と同じく
    // gradle の manifestPlaceholders を参照するプレースホルダだけを置く。
    // 実値は .env.local（git 管理外）から `android/app/build.gradle` が読む。
    const apiKey = '${ANDROID_GOOGLE_MAPS_API_KEY}';

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
    // **実キーを書かない。** Info.plist は git 管理下なので、他キー
    // （MapTilerAPIKey / MBXAccessToken / LONGDO_API_KEY）と同じく
    // xcodebuild のビルド設定を参照するプレースホルダだけを置く。
    // 実値は .env.local（git 管理外）から環境変数として渡り、Xcode の
    // 「Process Info.plist」で展開される。
    mod.modResults.GMSApiKey = '$(IOS_GOOGLE_MAPS_API_KEY)';
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

/**
 * MapTiler のキーを AndroidManifest と Info.plist へ入れる。
 * ネイティブ側が Android は `MAPTILER_API_KEY` の meta-data（`MapTilerInitSDK`）、
 * iOS は Info.plist の `MapTilerAPIKey`（`MapTilerMapHost.resolveApiKey`）を読む。
 *
 * Longdo と同じく**プレースホルダしか書かない**。実値は android が gradle の
 * manifestPlaceholders、iOS が xcodebuild のビルド設定（`MAPTILER_API_KEY=...`）から来る。
 * 出所はどちらも .env.local（git 管理外）。
 *
 * なお **このリポジトリで `expo prebuild` は実行しない**（git 管理下の ios/ を雛形で
 * 上書きしてしまう）。ここは ios/ と android/ を直接編集した内容と食い違わせないための控え。
 */
const withMapTilerApiKey: ConfigPlugin = (config) => {
  config = withInfoPlist(config, (mod) => {
    mod.modResults.MapTilerAPIKey = '$(MAPTILER_API_KEY)';
    return mod;
  });

  return withAndroidManifest(config, (mod) => {
    const apiKey = '${MAPTILER_API_KEY}';

    const application = mod.modResults.manifest.application![0];
    application['meta-data'] ??= [];
    const metadata = application['meta-data'];
    const entry = metadata.find((item) => item.$?.['android:name'] === 'MAPTILER_API_KEY');
    if (entry) {
      entry.$!['android:value'] = apiKey;
    } else {
      metadata.push({
        $: {
          'android:name': 'MAPTILER_API_KEY',
          'android:value': apiKey,
          'tools:replace': 'android:value',
        },
      });
    }
    return mod;
  });
};

/**
 * Mapbox の公開アクセストークンを AndroidManifest と Info.plist へ入れる。
 * android は `MapboxInitSDK` が `MAPBOX_ACCESS_TOKEN` の meta-data を読み、
 * **未設定なら例外を投げて落ちる**。iOS は `MBXAccessToken`。
 *
 * Longdo / MapTiler と同じくプレースホルダしか書かない。実値の出所は
 * .env.local（git 管理外）。
 */
const withMapboxAccessToken: ConfigPlugin = (config) => {
  config = withInfoPlist(config, (mod) => {
    mod.modResults.MBXAccessToken = '$(MAPBOX_ACCESS_TOKEN)';
    return mod;
  });

  return withAndroidManifest(config, (mod) => {
    const token = '${MAPBOX_ACCESS_TOKEN}';

    const application = mod.modResults.manifest.application![0];
    application['meta-data'] ??= [];
    const metadata = application['meta-data'];
    const entry = metadata.find((item) => item.$?.['android:name'] === 'MAPBOX_ACCESS_TOKEN');
    if (entry) {
      entry.$!['android:value'] = token;
    } else {
      metadata.push({
        $: {
          'android:name': 'MAPBOX_ACCESS_TOKEN',
          'android:value': token,
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
      withMapTilerApiKey,
      withMapboxAccessToken,
      // Link marker images as native resources. iOS resolves their asset-catalog
      // names through bundle:// URIs; Android can keep using expo-asset file URIs.
      ['expo-asset', { assets: ['./assets/images'] }],
    ],
  },
};
