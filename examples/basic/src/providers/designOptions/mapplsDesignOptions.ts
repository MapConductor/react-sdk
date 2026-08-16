import { MapplsDesign } from '@mapconductor/react-for-mappls';
import type { MapDesignOption } from './types';

// Mappls の使えるタイルは契約で決まる。Default / StandardDay は全アカウント共通。
// MapplsDesign.StandardNight / GreyDay は追加料金の有料オプションで、このリポジトリの
// サンプルは追加料金を払っていないため候補に出さない（SDK が style not found で弾く）。
// ライブラリ側では公開しているので、契約済みのアプリはそのまま指定できる。
export const MAPPLS_DESIGNS: MapDesignOption[] = [
  { label: 'Default', design: MapplsDesign.Default },
  { label: 'StandardDay', design: MapplsDesign.StandardDay },
];
