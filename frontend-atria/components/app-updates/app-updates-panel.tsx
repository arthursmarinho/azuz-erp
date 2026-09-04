"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";
import { AppUpdateForm } from "@/components/app-updates/app-update-form";
import { AppUpdateListItem } from "@/components/app-updates/app-update-list-item";
import {
  useAppUpdates,
  useAppUpdatesAccess,
} from "@/hooks/use-app-updates";
import type { AppUpdate } from "@/services/types";

export function AppUpdatesPanel() {
  const router = useRouter();
  const { data: access, isLoading: loadingAccess } = useAppUpdatesAccess();
  const canManage = access?.canManage ?? false;
  const canView = access?.canView ?? false;
  const { data: updates = [], isLoading: loadingUpdates, refetch } =
    useAppUpdates(canView || canManage);
  const [editing, setEditing] = useState<AppUpdate | null>(null);

  useEffect(() => {
    if (loadingAccess) return;
    if (!canView && !canManage) {
      router.replace("/kanban");
    }
  }, [canManage, canView, loadingAccess, router]);

  if (loadingAccess) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--atria-primary)]/15 bg-white/60 px-6 py-10 text-center text-sm text-[var(--atria-primary)]/50">
        Carregando...
      </div>
    );
  }

  if (!canView && !canManage) {
    return null;
  }

  function handleSubmitted() {
    setEditing(null);
    void refetch();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl border border-[var(--atria-primary)]/10 bg-[var(--atria-accent)]/20 p-3 text-[var(--atria-primary)]">
          <Megaphone className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--atria-primary)]">
            Atualizações do App
          </h1>
          <p className="text-sm text-[var(--atria-primary)]/50">
            {canManage
              ? "Publique novidades e escolha quais perfis podem visualizar."
              : "Acompanhe as últimas mudanças e novidades do sistema."}
          </p>
        </div>
      </div>

      {canManage ? (
        <AppUpdateForm
          editing={editing}
          onSubmitted={handleSubmitted}
          onCancelEdit={() => setEditing(null)}
        />
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--atria-primary)]">
            {canManage ? "Todas as atualizações" : "Últimas atualizações"}
          </h2>
          {!loadingUpdates && updates.length > 0 ? (
            <span className="rounded-full bg-[var(--atria-accent)]/30 px-2.5 py-1 text-xs font-semibold text-[var(--atria-primary)]">
              {updates.length}
            </span>
          ) : null}
        </div>

        {loadingUpdates ? (
          <div className="rounded-2xl border border-dashed border-[var(--atria-primary)]/15 bg-white/60 px-6 py-10 text-center text-sm text-[var(--atria-primary)]/50">
            Carregando...
          </div>
        ) : updates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--atria-primary)]/15 bg-white/60 px-6 py-10 text-center text-sm text-[var(--atria-primary)]/50">
            {canManage
              ? "Nenhuma atualização publicada ainda."
              : "Nenhuma atualização disponível para o seu perfil."}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {updates.map((update) => (
              <AppUpdateListItem
                key={update.id}
                update={update}
                canManage={canManage}
                onEdit={setEditing}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
