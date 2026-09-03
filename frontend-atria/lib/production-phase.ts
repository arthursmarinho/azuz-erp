import type { KanbanTaskStatus, ProductionPhase } from "@/services/types";

export const PRODUCTION_PHASE_DEFINITIONS: ReadonlyArray<{
  phase: ProductionPhase;
  label: string;
  color: string;
  order: number;
}> = [
  {
    phase: "roteiro",
    label: "Roteiro",
    color: "#92400E",
    order: 1,
  },
  {
    phase: "em_gravacao",
    label: "Já Gravado",
    color: "#EC4899",
    order: 2,
  },
];

export const PRODUCTION_PHASE_COLORS: Record<ProductionPhase, string> =
  Object.fromEntries(
    PRODUCTION_PHASE_DEFINITIONS.map((def) => [def.phase, def.color]),
  ) as Record<ProductionPhase, string>;

export const PRODUCTION_PHASE_LABELS: Record<ProductionPhase, string> =
  Object.fromEntries(
    PRODUCTION_PHASE_DEFINITIONS.map((def) => [def.phase, def.label]),
  ) as Record<ProductionPhase, string>;

export const PRODUCTION_PHASE_ORDER: ProductionPhase[] =
  PRODUCTION_PHASE_DEFINITIONS.map((def) => def.phase);

export const DEFAULT_PRODUCTION_PHASE: ProductionPhase = "roteiro";

export function isProductionPhase(value: unknown): value is ProductionPhase {
  return value === "roteiro" || value === "em_gravacao";
}

export function resolveProductionPhaseForStatus(
  status: KanbanTaskStatus,
  currentPhase: ProductionPhase | null | undefined,
  requestedPhase?: ProductionPhase | null,
): ProductionPhase | null {
  if (status !== "falta_gravar") {
    return null;
  }

  const phase = requestedPhase ?? currentPhase ?? DEFAULT_PRODUCTION_PHASE;
  return isProductionPhase(phase) ? phase : DEFAULT_PRODUCTION_PHASE;
}

export function resolveTaskDisplayColor(
  status: KanbanTaskStatus,
  productionPhase: ProductionPhase | null | undefined,
  statusColors: Record<KanbanTaskStatus, string>,
): string {
  if (status === "falta_gravar" && productionPhase) {
    return PRODUCTION_PHASE_COLORS[productionPhase];
  }

  return statusColors[status];
}

export function resolveTaskDisplayLabel(
  status: KanbanTaskStatus,
  productionPhase: ProductionPhase | null | undefined,
  statusLabels: Record<KanbanTaskStatus, string>,
): string {
  if (status === "falta_gravar" && productionPhase) {
    return PRODUCTION_PHASE_LABELS[productionPhase];
  }

  return statusLabels[status];
}
