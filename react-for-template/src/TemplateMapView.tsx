import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
    createRandomId,
    MapCameraPosition as MapCameraPositionNS,
    MapViewState,
    type MapCameraPosition,
    type MapViewStateInterface,
} from '@mapconductor/js-sdk-core';
import { TemplateDesign, TemplateMap, TemplateMapViewHolder, type TemplateMapDesignType } from './TemplateMap';
import { TemplateMapViewController } from './TemplateMapViewController';

// ============================================================================
// G. State サブクラス（実装点 3）
// ============================================================================

/**
 * 実装点 G。**残るのは 3 つだけ。**
 *
 *  - `mapDesignType`（プロバイダ固有の型）
 *  - プロバイダ型のホルダー
 *  - `getMapViewHolder()` の絞り込み
 *
 * カメラの保持・`moveCameraTo` の 2 種・`fitBounds`・`attachController`・
 * `uiSettings`・`id` はコアの `MapViewState` が持つ。
 *
 * ## `optimisticCameraUpdate` は web だけ既定 true
 *
 * web の地図エンジンはカメライベントが非同期なので、`moveCamera` の直後に
 * `state.cameraPosition` を読んでも古い値が返らないよう、要求値を先に反映する。
 * android / iOS は push で同期的に返るので false。**ここだけ既定が違う。**
 */
export class TemplateViewState extends MapViewState<TemplateMapDesignType> {
    private _mapDesignType: TemplateMapDesignType;

    mapViewHolder: TemplateMapViewHolder | null = null;

    constructor({
        id = createRandomId(),
        mapDesignType = TemplateDesign.Standard,
        cameraPosition = MapCameraPositionNS.Default,
    }: {
        id?: string;
        mapDesignType?: TemplateMapDesignType;
        cameraPosition?: MapCameraPosition;
    } = {}) {
        super({ id, cameraPosition });
        this._mapDesignType = mapDesignType;
    }

    override get mapDesignType(): TemplateMapDesignType {
        return this._mapDesignType;
    }

    override set mapDesignType(value: TemplateMapDesignType) {
        this._mapDesignType = value;
    }
}

export function useTemplateViewState(params: {
    id?: string;
    mapDesignType?: TemplateMapDesignType;
    cameraPosition?: MapCameraPosition;
} = {}): MapViewStateInterface<TemplateMapDesignType> {
    const [state] = useState(() => new TemplateViewState(params));
    return state;
}

// ============================================================================
// React の入口
// ============================================================================

/**
 * アプリ開発者が書くのはこれ。実際のドライバーでは `useEffect` の中で
 * SDK の地図を `container` にマウントする。
 *
 * ```tsx
 * <TemplateMapView state={state}>
 *     <Marker position={point} />
 *     <Polygon state={polygonState} />
 * </TemplateMapView>
 * ```
 */
export function TemplateMapView({
    state,
    children,
}: {
    state: MapViewStateInterface<TemplateMapDesignType>;
    children?: ReactNode;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<TemplateMapViewController | null>(null);

    useEffect(() => {
        // 実際のドライバーはここで `new maplibregl.Map({ container })` する。
        const map = new TemplateMap();
        const controller = new TemplateMapViewController(map);
        controllerRef.current = controller;

        const internal = state as unknown as {
            attachController?: (c: TemplateMapViewController) => void;
            serviceRegistry: Parameters<TemplateMapViewController['declareCapabilities']>[0];
            mapViewHolder?: TemplateMapViewHolder | null;
        };
        internal.mapViewHolder = new TemplateMapViewHolder(containerRef.current, map);
        internal.attachController?.(controller);
        controller.declareCapabilities(internal.serviceRegistry);

        return () => {
            controller.destroy();
            controllerRef.current = null;
        };
    }, [state]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
            {children}
        </div>
    );
}
