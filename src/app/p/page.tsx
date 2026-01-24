"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { COMPANY, CLIENTS, SERVICES, CONTROLS } from "@/lib/mock-data";
import type { DesignVariant } from "@/components/pdf/PortfolioPdf";

import { PortfolioPreviewExecutive } from "@/components/previews/PortfolioPreviewExecutive";
import { PortfolioPreviewSplit } from "@/components/previews/PortfolioPreviewSplit";
import { PortfolioPreviewMinimal } from "@/components/previews/PortfolioPreviewMinimal";
import { PortfolioPreviewInfographic } from "@/components/previews/PortfolioPreviewInfographic";

const ALLOWED: DesignVariant[] = ["executive", "split", "minimal", "infographic"];

export default function PortfolioPublicPage() {
  const sp = useSearchParams();

  const variant = useMemo<DesignVariant>(() => {
    const v = (sp.get("variant") ?? "executive") as DesignVariant;
    return ALLOWED.includes(v) ? v : "executive";
  }, [sp]);

  const title = sp.get("title") ?? "Portafolio de Servicios";
  const subtitle = sp.get("subtitle") ?? "Propuesta para";

  const clientId = sp.get("client") ?? CLIENTS[0]?.id ?? "colanta";
  const client = CLIENTS.find((c) => c.id === clientId) ?? CLIENTS[0];

  const serviceIds = (sp.get("services") ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const controlIds = (sp.get("controls") ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const finalServiceIds = serviceIds.length ? serviceIds : client.recommendedServiceIds;
  const finalControlIds = controlIds.length ? controlIds : client.recommendedControlIds;

  const selectedServices = SERVICES.filter((s) => finalServiceIds.includes(s.id));
  const selectedControls = CONTROLS.filter((c) => finalControlIds.includes(c.id));

  const options = {
    logoSrc: "/brand/palmera-junior.webp",
    accentColor: COMPANY.colors.palmeraGreen,
    showAnticimexBadge: true,
    showClientMeta: true,
    maxRepresentativeClients: 7,
  };

  const Preview = (() => {
    switch (variant) {
      case "infographic":
        return PortfolioPreviewInfographic;
      case "split":
        return PortfolioPreviewSplit;
      case "minimal":
        return PortfolioPreviewMinimal;
      case "executive":
      default:
        return PortfolioPreviewExecutive;
    }
  })();

  if (!client) return null;

  return (
    <div className="min-h-screen" style={{ background: COMPANY.colors.muted }}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl bg-white p-5 shadow-md border"
             style={{ borderColor: "rgba(51,45,46,.12)" }}>
          <Preview
            company={COMPANY}
            client={client}
            title={title}
            subtitle={subtitle}
            services={selectedServices}
            controls={selectedControls}
            options={options}
          />
        </div>
      </div>
    </div>
  );
}
