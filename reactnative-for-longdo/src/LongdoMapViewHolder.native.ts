import { ReactNativeMapViewHolder } from '@mapconductor/js-sdk-react/internal';
import type { LongdoMapViewRef } from './LongdoTypeAlias.native';

/**
 * RN のホルダーは全プロバイダで同一（投影はネイティブ側が行う）なので
 * {@link ReactNativeMapViewHolder} に集約してある。ここは ref 型を与えるだけ。
 */
export class LongdoMapViewHolder extends ReactNativeMapViewHolder<LongdoMapViewRef> {}
