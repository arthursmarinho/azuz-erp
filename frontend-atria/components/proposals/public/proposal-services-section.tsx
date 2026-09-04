"use client";

import {
  FileText,
  Image,
  LayoutTemplate,
  Lightbulb,
  Palette,
  Share2,
  TrendingUp,
  Video,
} from "lucide-react";
import {
  PROPOSAL_GOLD,
  PROPOSAL_SERVICES,
  PROPOSAL_TEAL,
} from "@/lib/proposal-utils";

const SERVICE_ICONS = {
  "share-2": Share2,
  palette: Palette,
  "trending-up": TrendingUp,
  "layout-template": LayoutTemplate,
  lightbulb: Lightbulb,
  image: Image,
  video: Video,
  "file-text": FileText,
} as const;

export function ProposalServicesSection() {
  return (
    <section
      className="px-4 py-16 sm:px-6 sm:py-24"
      style={{ backgroundColor: PROPOSAL_TEAL }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p
            className="text-xs tracking-[0.3em] uppercase"
            style={{ color: PROPOSAL_GOLD }}
          >
            CWBranding
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-proposal-serif)] text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Nossos Serviços
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-white/75 sm:text-lg">
            Transformamos sua visão em resultados concretos por meio da união
            entre estratégia, design e presença digital.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROPOSAL_SERVICES.map((service) => {
            const Icon = SERVICE_ICONS[service.icon];

            return (
              <article
                key={service.id}
                className="group flex flex-col border border-white/10 bg-white/5 p-6 transition hover:border-white/25 hover:bg-white/10"
              >
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${PROPOSAL_GOLD}22` }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: PROPOSAL_GOLD }}
                    strokeWidth={1.75}
                  />
                </div>
                <h3
                  className="text-lg font-semibold tracking-tight"
                  style={{ color: PROPOSAL_GOLD }}
                >
                  {service.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/70">
                  {service.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
