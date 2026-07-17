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

export default {
  expo: {
    name: 'MapConductor Basic',
    slug: 'mapconductor-basic',
    version: '1.0.0',
    orientation: 'portrait',
    platforms: ['ios', 'android'],
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
    plugins: [withGoogleMapsApiKeys],
  },
};
