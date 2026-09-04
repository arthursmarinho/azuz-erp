import type { KanbanTaskContentType, ProductionPhase } from "@/services/types";

export const DEFAULT_TASK_CONTENT_TYPE: KanbanTaskContentType =
  "video_with_script";

export const TASK_CONTENT_TYPE_OPTIONS: ReadonlyArray<{
  value: KanbanTaskContentType;
  label: string;
  description?: string;
}> = [
  {
    value: "video_with_script",
    label: "Vídeo",
  },
  { value: "static", label: "Estático" },
  { value: "carousel", label: "Carrossel" },
  { value: "stories_no_script", label: "Stories" },
];

export const TASK_CONTENT_TYPE_LABELS: Record<KanbanTaskContentType, string> =
  Object.fromEntries(
    TASK_CONTENT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<KanbanTaskContentType, string>;

export function contentTypeRequiresScript(
  contentType: KanbanTaskContentType | null | undefined,
) {
  return contentType == null || contentType === "video_with_script";
}

export function defaultProductionPhaseForContentType(
  contentType: KanbanTaskContentType | null | undefined,
): ProductionPhase {
  return contentTypeRequiresScript(contentType) ? "roteiro" : "em_gravacao";
}

export function getTaskContentTypeLabel(
  contentType: KanbanTaskContentType | null | undefined,
) {
  if (!contentType) return TASK_CONTENT_TYPE_LABELS[DEFAULT_TASK_CONTENT_TYPE];
  return TASK_CONTENT_TYPE_LABELS[contentType] ?? contentType;
}
