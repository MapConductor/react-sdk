import { MapplsDesign } from '@mapconductor/react-for-mappls';
import type { MapDesignOption } from './types';

// Mappls のスタイルはアカウント紐付き。ここでは全アカウント共通の 2 つだけ出す
export const MAPPLS_DESIGNS: MapDesignOption[] = [
  { label: 'Default', design: MapplsDesign.Default },
  { label: 'StandardDay', design: MapplsDesign.StandardDay },
];
