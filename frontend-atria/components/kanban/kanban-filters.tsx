"use client";

import { SearchableSelect } from "@/components/ui/searchable-select";
import { PRIORITY_LABELS } from "@/lib/kanban-utils";
import type { Client, KanbanPriority, TeamMember } from "@/services/types";

export interface KanbanFiltersState {
  priority: "" | KanbanPriority;
  assigneeId: string;
  clientId: string;
}

interface KanbanFiltersProps {
  filters: KanbanFiltersState;
  onChange: (filters: KanbanFiltersState) => void;
  members: TeamMember[];
  clients: Client[];
}

const PRIORITY_OPTIONS = (
  Object.entries(PRIORITY_LABELS) as Array<[KanbanPriority, string]>
).map(([value, label]) => ({ value, label }));

export function KanbanFilters({
  filters,
  onChange,
  members,
  clients,
}: KanbanFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-[var(--atria-primary)]/10 bg-white p-4 sm:grid-cols-3">
      <div>
        <p className="mb-1.5 text-xs font-medium text-[var(--atria-primary)]/50">
          Prioridade
        </p>
        <SearchableSelect
          value={filters.priority}
          onValueChange={(value) =>
            onChange({
              ...filters,
              priority: value as KanbanFiltersState["priority"],
            })
          }
          allowEmpty
          emptyOptionLabel="Todas"
          options={PRIORITY_OPTIONS}
          placeholder="Todas"
        />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-[var(--atria-primary)]/50">
          Responsável
        </p>
        <SearchableSelect
          value={filters.assigneeId}
          onValueChange={(value) =>
            onChange({ ...filters, assigneeId: value })
          }
          allowEmpty
          emptyOptionLabel="Todos"
          options={members.map((member) => ({
            value: member.id,
            label: member.name,
          }))}
          placeholder="Todos"
        />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-[var(--atria-primary)]/50">
          Cliente
        </p>
        <SearchableSelect
          value={filters.clientId}
          onValueChange={(value) => onChange({ ...filters, clientId: value })}
          allowEmpty
          emptyOptionLabel="Todos"
          options={clients.map((client) => ({
            value: client.id,
            label: client.companyName,
          }))}
          placeholder="Todos"
        />
      </div>
    </div>
  );
}
