// 状態とデザインのカタログは web 版（react-for-template）と共有する。
// **本物のプロバイダは `@mapconductor/react-for-<sdk>/state` から取ること。**
// ルートの barrel は web の描画コンポーネント（maplibre-gl 等）を巻き込み、
// Metro/Hermes がモジュール読み込み時に落ちる。雛形の地図は純 TS なのでルートで足りる。
export {
  TemplateViewState,
  useTemplateViewState,
  type TemplateMapDesignType,
} from '@mapconductor/react-for-template';
export * from './TemplateTypeAlias.native';
export * from './TemplateViewControllerInterface.native';
export * from './TemplateViewController.native';
export * from './TemplateMapViewHolder.native';
export * from './TemplateViewNativeComponent';
export * from './TemplateView.native';
export type { TemplateMapViewProps } from './TemplateViewProps.native';
export * from './marker/TemplateMarkerController.native';
