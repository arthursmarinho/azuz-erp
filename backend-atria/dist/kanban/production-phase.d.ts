import { KanbanTaskStatus, ProductionPhase } from '@prisma/client';
export declare const PRODUCTION_PHASE_DEFINITIONS: ReadonlyArray<{
    phase: ProductionPhase;
    label: string;
    color: string;
    order: number;
}>;
export declare const PRODUCTION_PHASE_COLORS: Record<ProductionPhase, string>;
export declare const PRODUCTION_PHASE_LABELS: Record<ProductionPhase, string>;
export declare const DEFAULT_PRODUCTION_PHASE: "ROTEIRO";
export type ProductionPhaseApi = 'roteiro' | 'em_gravacao';
export declare function phaseToApi(phase: ProductionPhase): ProductionPhaseApi;
export declare function phaseFromApi(value: ProductionPhaseApi): ProductionPhase;
export declare function isProductionPhase(value: unknown): value is ProductionPhase;
export declare function resolveProductionPhaseForStatus(status: KanbanTaskStatus, currentPhase: ProductionPhase | null | undefined, requestedPhase?: ProductionPhase | null): ProductionPhase | null;
export declare function resolveTaskDisplayColor(status: KanbanTaskStatus, productionPhase: ProductionPhase | null | undefined, statusColors: Record<KanbanTaskStatus, string>): string;
export declare function resolveTaskDisplayLabel(status: KanbanTaskStatus, productionPhase: ProductionPhase | null | undefined, statusLabels: Record<KanbanTaskStatus, string>): string;
