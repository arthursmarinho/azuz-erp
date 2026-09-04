"use client";

import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  RECORDING_FILTER_OPTIONS,
  type RecordingFilter,
} from "@/lib/production-phase";
import type { Client, TeamMember } from "@/services/types";

export interface KanbanFiltersState {
  assigneeId: string;
  clientId: string;
  recordingFilter: RecordingFilter;
}

interface KanbanFiltersProps {
  filters: KanbanFiltersState;
  onChange: (filters: KanbanFiltersState) => void;
  members: TeamMember[];
  clients: Client[];
}

export function KanbanFilters({
  filters,
  onChange,
  members,
  clients,
}: KanbanFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-[var(--atria-primary)]/10 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <div>
        <p className="mb-1.5 text-xs font-medium text-[var(--atria-primary)]/50">
          Gravação
        </p>
        <SearchableSelect
          value={filters.recordingFilter}
          onValueChange={(value) =>
            onChange({
              ...filters,
              recordingFilter: value as RecordingFilter,
            })
          }
          allowEmpty
          emptyOptionLabel="Todos"
          options={RECORDING_FILTER_OPTIONS.filter((option) => option.value !== "").map(
            (option) => ({
              value: option.value,
              label: option.label,
            }),
          )}
          placeholder="Todos"
        />
      </div>
    </div>
  );
}
