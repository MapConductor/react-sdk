import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightMermaid from '@pasqal-io/starlight-client-mermaid';
import remarkEmbedSource from './src/plugins/remark-embed-source.mjs';

export default defineConfig({
  site: 'https://mapconductor.com',
  markdown: {
    remarkPlugins: [remarkEmbedSource],
  },
  integrations: [
    starlight({
      title: 'MapConductor React SDK',
      description: 'One React API for multiple map SDKs on Web and React Native.',
      favicon: '/favicon.svg',
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        ja: { label: '日本語', lang: 'ja' },
      },
      customCss: ['./src/styles/custom.css'],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/MapConductor/react-sdk',
        },
      ],
      sidebar: [
        {
          label: 'Getting started',
          translations: { ja: 'はじめに' },
          items: [
            { slug: 'introduction' },
            { slug: 'getting-started' },
            { slug: 'architecture' },
          ],
        },
        {
          label: 'Platforms',
          translations: { ja: 'プラットフォーム' },
          items: [
            { slug: 'platforms/web' },
            { slug: 'platforms/react-native' },
          ],
        },
        {
          label: 'Guides',
          translations: { ja: 'ガイド' },
          items: [
            { slug: 'guides/overlays' },
            { slug: 'guides/events-and-camera' },
            { slug: 'guides/camera-sync' },
            { slug: 'guides/large-marker-sets' },
            { slug: 'guides/extensions' },
          ],
        },
        {
          label: 'Reference',
          translations: { ja: 'リファレンス' },
          items: [
            { slug: 'reference/packages' },
            { slug: 'reference/providers' },
            {
              label: 'Provider setup',
              translations: { ja: '各プロバイダの設定' },
              items: [
                { slug: 'reference/providers/google-maps' },
                { slug: 'reference/providers/maplibre' },
                { slug: 'reference/providers/mapbox' },
                { slug: 'reference/providers/leaflet' },
                { slug: 'reference/providers/openlayers' },
                { slug: 'reference/providers/arcgis' },
                { slug: 'reference/providers/cesium' },
              ],
            },
            { slug: 'reference/core-api' },
          ],
        },
        {
          label: 'Components',
          translations: { ja: 'コンポーネント' },
          items: [
            { slug: 'components/mapview' },
            { slug: 'components/marker' },
            { slug: 'components/circle' },
            { slug: 'components/polyline' },
            { slug: 'components/polygon' },
            { slug: 'components/groundimage' },
            { slug: 'components/rasterlayer' },
            { slug: 'components/infobubble' },
          ],
        },
        {
          label: 'States',
          translations: { ja: 'ステート' },
          items: [
            { slug: 'states/marker-state' },
            { slug: 'states/circle-state' },
            { slug: 'states/polyline-state' },
            { slug: 'states/polygon-state' },
            { slug: 'states/groundimage-state' },
            { slug: 'states/rasterlayer-state' },
          ],
        },
        {
          label: 'Core',
          translations: { ja: 'コア' },
          items: [
            { slug: 'core/geopoint' },
            { slug: 'core/georectbounds' },
            { slug: 'core/mapcameraposition' },
            { slug: 'core/marker-icons' },
            { slug: 'core/spherical-utilities' },
            { slug: 'core/zoom-levels' },
            { slug: 'core/mapviewholder' },
            { slug: 'core/service-registry' },
          ],
        },
      ],
      plugins: [starlightMermaid()],
    }),
  ],
});
