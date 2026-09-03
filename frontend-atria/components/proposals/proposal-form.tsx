"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Save, Send, Trash2 } from "lucide-react";
import { ShareLinkModal } from "@/components/proposals/share-link-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  DEFAULT_COVER_IMAGE_URL,
  DEFAULT_COVER_VIDEO_URL,
  DEFAULT_SCHEDULING_URL,
  DEFAULT_STRUCTURE_CONTENT,
  LOCAL_SPACE_IMAGES,
  formatProposalCurrency,
  toDateInputValue,
} from "@/lib/proposal-utils";
import { toast } from "@/lib/toast";
import { clientsService, proposalsService } from "@/services";
import type { Client, Proposal } from "@/services/types";

export interface ProposalFormValues {
  clientId: string;
  title: string;
  validUntil: string;
  totalValue: number;
  coverVideoUrl: string;
  coverImageUrl: string;
  schedulingUrl: string;
  items: {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  projects: {
    title: string;
    description: string;
    imageUrl: string;
    projectUrl: string;
  }[];
}

interface ProposalFormProps {
  proposal?: Proposal;
}

function buildDefaults(proposal?: Proposal): ProposalFormValues {
  if (!proposal) {
    return {
      clientId: "",
      title: "",
      validUntil: "",
      totalValue: 0,
      coverVideoUrl: DEFAULT_COVER_VIDEO_URL,
      coverImageUrl: DEFAULT_COVER_IMAGE_URL,
      schedulingUrl: DEFAULT_SCHEDULING_URL,
      items: [
        {
          name: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
      projects: [],
    };
  }

  return {
    clientId: proposal.clientId,
    title: proposal.title,
    validUntil: toDateInputValue(proposal.validUntil),
    totalValue: proposal.totalValue,
    coverVideoUrl: proposal.coverVideoUrl ?? DEFAULT_COVER_VIDEO_URL,
    coverImageUrl: proposal.coverImageUrl ?? DEFAULT_COVER_IMAGE_URL,
    schedulingUrl: proposal.schedulingUrl ?? DEFAULT_SCHEDULING_URL,
    items: proposal.items.map((item) => ({
      name: item.name,
      description: item.description ?? "",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    projects: proposal.projects.map((project) => ({
      title: project.title,
      description: project.description ?? "",
      imageUrl: project.imageUrl ?? "",
      projectUrl: project.projectUrl ?? "",
    })),
  };
}

function toPayload(values: ProposalFormValues) {
  const items = values.items
    .filter((item) => item.name.trim())
    .map((item, index) => ({
      name: item.name.trim(),
      description: item.description.trim() || undefined,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      sortOrder: index,
    }));

  const computedTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return {
    clientId: values.clientId,
    title: values.title.trim(),
    validUntil: values.validUntil || undefined,
    totalValue:
      values.totalValue > 0 ? Number(values.totalValue) : computedTotal,
    structureContent: DEFAULT_STRUCTURE_CONTENT,
    structureImageUrls: LOCAL_SPACE_IMAGES.map((image) => image.src),
    coverVideoUrl: values.coverVideoUrl.trim() || undefined,
    coverImageUrl: values.coverImageUrl.trim() || undefined,
    schedulingUrl: values.schedulingUrl.trim() || undefined,
    items,
    projects: values.projects
      .filter((project) => project.title.trim())
      .map((project, index) => ({
        title: project.title.trim(),
        description: project.description.trim() || undefined,
        imageUrl: project.imageUrl.trim() || undefined,
        projectUrl: project.projectUrl.trim() || undefined,
        sortOrder: index,
      })),
  };
}

export function ProposalForm({ proposal }: ProposalFormProps) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProposalFormValues>({
    defaultValues: buildDefaults(proposal),
  });

  const itemsArray = useFieldArray({ control, name: "items" });
  const projectsArray = useFieldArray({ control, name: "projects" });

  const watchedItems = watch("items");
  const clientId = watch("clientId");

  const computedTotal = useMemo(() => {
    return (watchedItems ?? []).reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }, 0);
  }, [watchedItems]);

  useEffect(() => {
    let cancelled = false;
    setClientsLoading(true);
    clientsService
      .getClients()
      .then((data) => {
        if (!cancelled) setClients(data);
      })
      .catch(() => {
        if (!cancelled) setClients([]);
      })
      .finally(() => {
        if (!cancelled) setClientsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setValue("totalValue", Number(computedTotal.toFixed(2)));
  }, [computedTotal, setValue]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("proposalShareUrl");
    if (stored) {
      setShareUrl(stored);
      sessionStorage.removeItem("proposalShareUrl");
    }
  }, []);

  async function saveDraft(values: ProposalFormValues) {
    setSaving(true);
    try {
      const payload = toPayload(values);
      if (!payload.clientId) {
        toast.error("Selecione um cliente");
        return;
      }
      if (!payload.title) {
        toast.error("Informe o título da proposta");
        return;
      }

      if (proposal) {
        await proposalsService.updateProposal(proposal.id, {
          ...payload,
          status: "draft",
        });
        toast.success("Rascunho salvo");
        router.refresh();
      } else {
        const created = await proposalsService.createProposal({
          ...payload,
          status: "draft",
        });
        toast.success("Rascunho criado");
        router.push(`/proposals/${created.id}/edit`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a proposta",
      );
    } finally {
      setSaving(false);
    }
  }

  async function publish(values: ProposalFormValues) {
    setPublishing(true);
    try {
      const payload = toPayload(values);
      if (!payload.clientId || !payload.title) {
        toast.error("Preencha cliente e título antes de publicar");
        return;
      }
      if (!payload.items.length) {
        toast.error("Adicione ao menos um item de serviço");
        return;
      }

      let proposalId = proposal?.id;
      if (proposalId) {
        await proposalsService.updateProposal(proposalId, payload);
      } else {
        const created = await proposalsService.createProposal({
          ...payload,
          status: "draft",
        });
        proposalId = created.id;
      }

      const published = await proposalsService.publishProposal(proposalId);
      const url = proposalsService.buildPublicProposalUrl(published.id);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("proposalShareUrl", url);
      }
      setShareUrl(url);
      toast.success("Proposta publicada");
      if (!proposal || proposal.id !== published.id) {
        router.replace(`/proposals/${published.id}/edit`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível publicar a proposta",
      );
    } finally {
      setPublishing(false);
    }
  }

  return (
    <>
      <form className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--atria-primary)]">
              {proposal ? "Editar proposta" : "Nova proposta"}
            </h1>
            <p className="text-sm text-[var(--atria-primary)]/50">
              Monte a proposta comercial e publique o link público
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving || publishing}
              onClick={() => void handleSubmit(saveDraft)()}
            >
              <Save className="size-4" />
              Salvar rascunho
            </Button>
            <Button
              type="button"
              disabled={saving || publishing}
              onClick={() => void handleSubmit(publish)()}
            >
              <Send className="size-4" />
              Publicar
            </Button>
          </div>
        </div>

        <Card className="rounded-2xl border border-[var(--atria-primary)]/10 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--atria-primary)]/50">
            Dados da proposta
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>Cliente</FieldLabel>
              <SearchableSelect
                value={clientId}
                onValueChange={(value) =>
                  setValue("clientId", value, { shouldValidate: true })
                }
                loading={clientsLoading}
                placeholder="Selecione..."
                searchPlaceholder="Buscar cliente..."
                emptyLabel="Nenhum cliente encontrado"
                options={clients.map((client) => ({
                  value: client.id,
                  label: client.companyName,
                }))}
              />
              <input type="hidden" {...register("clientId", { required: true })} />
              {errors.clientId && (
                <p className="text-xs text-red-600">Cliente obrigatório</p>
              )}
            </Field>

            <Field>
              <FieldLabel>Título</FieldLabel>
              <Input
                placeholder="Proposta Comercial — Posicionamento"
                {...register("title", { required: true })}
              />
            </Field>

            <Field>
              <FieldLabel>Validade</FieldLabel>
              <Input type="date" {...register("validUntil")} />
            </Field>

            <Field>
              <FieldLabel>Valor total</FieldLabel>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register("totalValue", { valueAsNumber: true })}
              />
              <p className="text-xs text-[var(--atria-primary)]/45">
                Calculado dos itens: {formatProposalCurrency(computedTotal)}
              </p>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel>Link de agendamento</FieldLabel>
              <Input
                placeholder="https://calendly.com/..."
                {...register("schedulingUrl")}
              />
            </Field>
          </div>
        </Card>

        <Card className="rounded-2xl border border-[var(--atria-primary)]/10 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--atria-primary)]/50">
              Itens de serviço
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                itemsArray.append({
                  name: "",
                  description: "",
                  quantity: 1,
                  unitPrice: 0,
                })
              }
            >
              <Plus className="size-4" />
              Item
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {itemsArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-xl border border-[var(--atria-primary)]/10 p-3 md:grid-cols-[1fr_80px_120px_40px]"
              >
                <div className="flex flex-col gap-2 md:col-span-1">
                  <Input
                    placeholder="Nome do serviço"
                    {...register(`items.${index}.name` as const)}
                  />
                  <Input
                    placeholder="Descrição (opcional)"
                    {...register(`items.${index}.description` as const)}
                  />
                </div>
                <Input
                  type="number"
                  min={1}
                  placeholder="Qtd"
                  {...register(`items.${index}.quantity` as const, {
                    valueAsNumber: true,
                  })}
                />
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Valor"
                  {...register(`items.${index}.unitPrice` as const, {
                    valueAsNumber: true,
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={itemsArray.fields.length === 1}
                  onClick={() => itemsArray.remove(index)}
                >
                  <Trash2 className="size-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl border border-[var(--atria-primary)]/10 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--atria-primary)]/50">
              Projetos em destaque
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                projectsArray.append({
                  title: "",
                  description: "",
                  imageUrl: "",
                  projectUrl: "",
                })
              }
            >
              <Plus className="size-4" />
              Projeto
            </Button>
          </div>

          {projectsArray.fields.length === 0 ? (
            <p className="text-sm text-[var(--atria-primary)]/45">
              Adicione projetos para exibir na seção pública.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {projectsArray.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-xl border border-[var(--atria-primary)]/10 p-3"
                >
                  <div className="flex items-start gap-2">
                    <div className="grid flex-1 gap-2 md:grid-cols-2">
                      <Input
                        placeholder="Título do projeto"
                        {...register(`projects.${index}.title` as const)}
                      />
                      <Input
                        placeholder="URL da imagem"
                        {...register(`projects.${index}.imageUrl` as const)}
                      />
                      <Input
                        className="md:col-span-2"
                        placeholder="Descrição"
                        {...register(`projects.${index}.description` as const)}
                      />
                      <Input
                        className="md:col-span-2"
                        placeholder="URL do projeto (opcional)"
                        {...register(`projects.${index}.projectUrl` as const)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => projectsArray.remove(index)}
                    >
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </form>

      <ShareLinkModal
        open={Boolean(shareUrl)}
        onOpenChange={(open) => {
          if (!open) setShareUrl(null);
        }}
        publicUrl={shareUrl ?? ""}
      />
    </>
  );
}
