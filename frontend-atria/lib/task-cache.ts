import type { QueryClient } from "@tanstack/react-query";
import {
  DEFAULT_TASK_STATUS,
  DEFAULT_TASK_STATUS_COLOR,
  DEFAULT_TASK_STATUS_LABEL,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/kanban-utils";
import {
  DEFAULT_PRODUCTION_PHASE,
  resolveTaskDisplayColor,
  resolveTaskDisplayLabel,
} from "@/lib/production-phase";
import { calendarKeys, creationKeys, taskKeys } from "@/lib/query-keys";
import type {
  CalendarEvent,
  KanbanTask,
  KanbanTaskStatus,
  ProductionPhase,
} from "@/services/types";

export function getTasksCache(
  queryClient: QueryClient,
  companyId: string,
): KanbanTask[] | undefined {
  return queryClient.getQueryData<KanbanTask[]>(taskKeys.all(companyId));
}

export function setTasksCache(
  queryClient: QueryClient,
  companyId: string,
  tasks: KanbanTask[],
) {
  queryClient.setQueryData(taskKeys.all(companyId), tasks);
}

export function upsertTaskInCache(
  queryClient: QueryClient,
  companyId: string,
  task: KanbanTask,
) {
  queryClient.setQueryData<KanbanTask[]>(taskKeys.all(companyId), (old) => {
    if (!old) return [task];
    const without = old.filter((entry) => entry.id !== task.id);
    return [...without, task];
  });
}

export function patchTaskInCache(
  queryClient: QueryClient,
  companyId: string,
  taskId: string,
  patch: Partial<KanbanTask>,
) {
  queryClient.setQueryData<KanbanTask[]>(taskKeys.all(companyId), (old) => {
    if (!old) return old;
    return old.map((task) =>
      task.id === taskId ? { ...task, ...patch } : task,
    );
  });
}

export function applyTaskStatusInCache(
  queryClient: QueryClient,
  companyId: string,
  taskId: string,
  status: KanbanTaskStatus,
  columnId?: string,
  productionPhase?: ProductionPhase | null,
) {
  const resolvedPhase =
    status === "falta_gravar"
      ? (productionPhase ?? DEFAULT_PRODUCTION_PHASE)
      : null;
  const statusColor = resolveTaskDisplayColor(
    status,
    resolvedPhase,
    STATUS_COLORS,
  );
  const statusLabel = resolveTaskDisplayLabel(
    status,
    resolvedPhase,
    STATUS_LABELS,
  );

  patchTaskInCache(queryClient, companyId, taskId, {
    status,
    productionPhase: resolvedPhase,
    statusColor,
    statusLabel,
    ...(columnId ? { columnId } : {}),
  });

  applyTaskStatusToCalendarCaches(
    queryClient,
    companyId,
    taskId,
    status,
    resolvedPhase,
  );
  applyTaskStatusToCreationCaches(
    queryClient,
    companyId,
    taskId,
    status,
    resolvedPhase,
  );
}

function applyTaskStatusToCreationCaches(
  queryClient: QueryClient,
  companyId: string,
  taskId: string,
  status: KanbanTaskStatus,
  productionPhase: ProductionPhase | null,
) {
  const statusColor = resolveTaskDisplayColor(
    status,
    productionPhase,
    STATUS_COLORS,
  );
  const statusLabel = resolveTaskDisplayLabel(
    status,
    productionPhase,
    STATUS_LABELS,
  );
  const queries = queryClient.getQueriesData<{
    items: Array<{
      kanbanTaskId: string | null;
      taskStatus: KanbanTaskStatus | null;
      taskStatusColor: string | null;
      taskStatusLabel: string | null;
    }>;
  }>({
    queryKey: creationKeys.all(companyId),
  });

  for (const [queryKey, pipeline] of queries) {
    if (!pipeline?.items) continue;
    queryClient.setQueryData(queryKey, {
      ...pipeline,
      items: pipeline.items.map((item) =>
        item.kanbanTaskId === taskId
          ? {
              ...item,
              taskStatus: status,
              taskStatusColor: statusColor,
              taskStatusLabel: statusLabel,
            }
          : item,
      ),
    });
  }
}

function applyTaskStatusToCalendarCaches(
  queryClient: QueryClient,
  companyId: string,
  taskId: string,
  status: KanbanTaskStatus,
  productionPhase: ProductionPhase | null,
) {
  const statusColor = resolveTaskDisplayColor(
    status,
    productionPhase,
    STATUS_COLORS,
  );
  const queries = queryClient.getQueriesData<CalendarEvent[]>({
    queryKey: calendarKeys.all(companyId),
  });

  for (const [queryKey, events] of queries) {
    if (!events) continue;
    queryClient.setQueryData<CalendarEvent[]>(
      queryKey,
      events.map((evt) =>
        evt.kanbanTaskId === taskId
          ? {
              ...evt,
              taskStatus: status,
              productionPhase,
              taskStatusColor: statusColor,
              color: statusColor,
            }
          : evt,
      ),
    );
  }
}

export function reorderTaskInCache(
  queryClient: QueryClient,
  companyId: string,
  taskId: string,
  columnId: string,
  order: number,
  status: KanbanTaskStatus,
  productionPhase?: ProductionPhase | null,
) {
  const resolvedPhase =
    status === "falta_gravar"
      ? (productionPhase ?? DEFAULT_PRODUCTION_PHASE)
      : null;
  const statusColor = resolveTaskDisplayColor(
    status,
    resolvedPhase,
    STATUS_COLORS,
  );
  const statusLabel = resolveTaskDisplayLabel(
    status,
    resolvedPhase,
    STATUS_LABELS,
  );

  queryClient.setQueryData<KanbanTask[]>(taskKeys.all(companyId), (old) => {
    if (!old) return old;

    const currentTask = old.find((task) => task.id === taskId);
    if (!currentTask) return old;

    const without = old.filter((task) => task.id !== taskId);
    const targetColumnTasks = without
      .filter((task) => task.columnId === columnId)
      .sort((a, b) => a.order - b.order);

    const inserted: KanbanTask = {
      ...currentTask,
      columnId,
      order,
      status,
      productionPhase: resolvedPhase,
      statusColor,
      statusLabel,
    };

    const reordered = [
      ...targetColumnTasks.slice(0, order),
      inserted,
      ...targetColumnTasks.slice(order),
    ].map((task, index) => ({ ...task, order: index }));

    const otherTasks = without.filter((task) => task.columnId !== columnId);
    return [...otherTasks, ...reordered];
  });

  applyTaskStatusToCalendarCaches(
    queryClient,
    companyId,
    taskId,
    status,
    resolvedPhase,
  );
}

export function buildOptimisticTask(
  data: {
    title: string;
    description?: string | null;
    referenceUrl?: string | null;
    columnId: string;
    status?: KanbanTaskStatus;
    productionPhase?: ProductionPhase;
    priority?: KanbanTask["priority"];
    dueDate?: string | null;
    deliveryDate?: string | null;
    publicationDate?: string | null;
    clientId?: string | null;
  },
  previous: KanbanTask[] | undefined,
  optimisticId: string,
): KanbanTask {
  const status = data.status ?? DEFAULT_TASK_STATUS;
  const productionPhase =
    status === "falta_gravar"
      ? (data.productionPhase ?? DEFAULT_PRODUCTION_PHASE)
      : null;
  const statusColor = resolveTaskDisplayColor(
    status,
    productionPhase,
    STATUS_COLORS,
  );
  const statusLabel = resolveTaskDisplayLabel(
    status,
    productionPhase,
    STATUS_LABELS,
  );
  const column = data.columnId
    ? previous?.find((task) => task.columnId === data.columnId)?.column
    : undefined;

  return {
    id: optimisticId,
    title: data.title,
    description: data.description ?? null,
    referenceUrl: data.referenceUrl ?? null,
    columnId: data.columnId,
    column: column ?? {
      id: data.columnId,
      title: DEFAULT_TASK_STATUS_LABEL,
      order: 0,
      color: DEFAULT_TASK_STATUS_COLOR,
      type: "custom",
      statusKey: status,
    },
    clientId: data.clientId ?? null,
    client: null,
    contentPostId: null,
    calendarEventId: null,
    internalReviewStatus: "not_required",
    internalReviewNote: null,
    isBypassingInternalReview: false,
    status,
    productionPhase,
    statusColor,
    statusLabel,
    priority: data.priority ?? "medium",
    order: previous?.filter((t) => t.columnId === data.columnId).length ?? 0,
    dueDate: data.deliveryDate ?? data.dueDate ?? null,
    deliveryDate: data.deliveryDate ?? data.dueDate ?? null,
    publicationDate: data.publicationDate ?? null,
    slaResponseDueAt: null,
    slaResolutionDueAt: null,
    firstResponseAt: null,
    resolvedAt: null,
    slaStatus: "not_tracked",
    assignees: [],
    assets: [],
    createdBy: { id: "", name: "", email: "", avatarUrl: null },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function invalidateTasksCache(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: taskKeys.root }),
    queryClient.invalidateQueries({ queryKey: calendarKeys.root }),
    queryClient.invalidateQueries({ queryKey: creationKeys.root }),
  ]);
}
