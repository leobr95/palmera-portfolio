"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import { PDFDownloadLink } from "@react-pdf/renderer";

import type { Client, Control, Service, ServiceCategory } from "@/lib/mock-data";
import { COMPANY } from "@/lib/mock-data";
import { getClients, getControls, getServices } from "@/lib/mock-api";

import { PortfolioPdf } from "@/components/pdf/PortfolioPdf";
import type { DesignVariant } from "@/components/pdf/PortfolioPdf";

// ✅ Variantes (previews)
import { PortfolioPreviewExecutive } from "@/components/previews/PortfolioPreviewExecutive";
import { PortfolioPreviewSplit } from "@/components/previews/PortfolioPreviewSplit";
import { PortfolioPreviewMinimal } from "@/components/previews/PortfolioPreviewMinimal";
import { PortfolioPreviewInfographic } from "@/components/previews/PortfolioPreviewInfographic";

const INITIAL_CLIENT_ID = "colanta";

type PreviewOptions = {
  logoSrc: string;
  accentColor: string;
  showAnticimexBadge: boolean;
  showClientMeta: boolean;
  maxRepresentativeClients: number;
};

type PreviewProps = {
  company: typeof COMPANY;
  client: Client;
  title: string;
  subtitle: string;
  services: Service[];
  controls: Control[];
  options: PreviewOptions;
};

function groupByCategory(services: Service[]) {
  return services.reduce<Partial<Record<ServiceCategory, Service[]>>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});
}

export default function BuilderPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [clientId, setClientId] = useState<string>(INITIAL_CLIENT_ID);

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedControlIds, setSelectedControlIds] = useState<string[]>([]);

  const [customTitle, setCustomTitle] = useState<string>("Portafolio de Servicios");
  const [customSubtitle, setCustomSubtitle] = useState<string>("Propuesta para");

  const [variant, setVariant] = useState<DesignVariant>("executive");

  useEffect(() => {
    Promise.all([getClients(), getServices(), getControls()]).then(([c, s, k]) => {
      setClients(c);
      setServices(s);
      setControls(k);

      const defaultClient = c.find((x) => x.id === INITIAL_CLIENT_ID) ?? c[0];
      if (!defaultClient) return;

      setClientId(defaultClient.id);
      setSelectedServiceIds(defaultClient.recommendedServiceIds);
      setSelectedControlIds(defaultClient.recommendedControlIds);
    });
  }, []);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === clientId) ?? null,
    [clients, clientId]
  );

  const servicesByCat = useMemo(() => groupByCategory(services), [services]);

  const selectedServices = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s.id)),
    [services, selectedServiceIds]
  );

  const selectedControls = useMemo(
    () => controls.filter((c) => selectedControlIds.includes(c.id)),
    [controls, selectedControlIds]
  );

  const shareUrl = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("client", selectedClient?.id ?? "");
    sp.set("services", selectedServiceIds.join(","));
    sp.set("controls", selectedControlIds.join(","));
    sp.set("title", customTitle);
    sp.set("subtitle", customSubtitle);
    sp.set("variant", variant);
    return `/p?${sp.toString()}`;
  }, [selectedClient?.id, selectedServiceIds, selectedControlIds, customTitle, customSubtitle, variant]);

  const copyLink = async () => {
    const full = `${window.location.origin}${shareUrl}`;
    await navigator.clipboard.writeText(full);
    alert("Link copiado ✅");
  };

  const handleClientChange = (nextClientId: string) => {
    setClientId(nextClientId);

    const nextClient = clients.find((c) => c.id === nextClientId);
    if (!nextClient) return;

    // ✅ Al cambiar cliente, resetea a recomendaciones del cliente (sin useEffect)
    setSelectedServiceIds(nextClient.recommendedServiceIds);
    setSelectedControlIds(nextClient.recommendedControlIds);
  };

  const previewOptions: PreviewOptions = useMemo(
    () => ({
      logoSrc: "/brand/palmera-junior.webp",
      accentColor: COMPANY.colors.palmeraGreen,
      showAnticimexBadge: true,
      showClientMeta: true,
      maxRepresentativeClients: 7,
    }),
    []
  );

  const previewMap: Record<DesignVariant, ComponentType<PreviewProps>> = {
    executive: PortfolioPreviewExecutive,
    split: PortfolioPreviewSplit,
    minimal: PortfolioPreviewMinimal,
    infographic: PortfolioPreviewInfographic,
  };

  const Preview = previewMap[variant];

  // ✅ Fuerza regeneración del PDF cuando cambie algo importante (evita “cache”)
  const pdfKey = useMemo(() => {
    return [
      variant,
      selectedClient?.id ?? "",
      selectedServiceIds.join("."),
      selectedControlIds.join("."),
      customTitle,
      customSubtitle,
    ].join("|");
  }, [variant, selectedClient?.id, selectedServiceIds, selectedControlIds, customTitle, customSubtitle]);

  if (!selectedClient) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: COMPANY.colors.muted }}>
        <p className="text-sm opacity-70" style={{ color: COMPANY.colors.ink }}>
          Cargando datos...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: COMPANY.colors.muted }}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: COMPANY.colors.ink }}>
              Builder — Portafolio por cliente
            </h1>
            <p className="text-sm opacity-80">
              Datos mock (simulan el API). Selecciona servicios/controles, elige diseño y genera PDF o link.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyLink}
              className="rounded-xl px-4 py-2 text-white"
              style={{ background: COMPANY.colors.ink }}
            >
              Copiar link
            </button>

            <PDFDownloadLink
              key={pdfKey}
              document={
                <PortfolioPdf
                  key={pdfKey}
                  company={COMPANY}
                  client={selectedClient}
                  title={customTitle}
                  subtitle={customSubtitle}
                  services={selectedServices}
                  controls={selectedControls}
                  variant={variant}
                  logoPalmeraSrc="/brand/palmera-junior.webp"
                  logoAnticimexSrc="/brand/anticimex.png"
                />
              }
              fileName={`Portafolio_${selectedClient.name}.pdf`}
              className="rounded-xl px-4 py-2 text-white"
              style={{ background: COMPANY.colors.palmeraGreen }}
            >
              {({ loading }) => (loading ? "Generando..." : "Descargar PDF")}
            </PDFDownloadLink>

            <Link
              href={shareUrl}
              className="rounded-xl px-4 py-2 border bg-white"
              style={{ borderColor: "rgba(51,45,46,.15)" }}
            >
              Abrir portafolio
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Panel configuración */}
          <div
            className="rounded-2xl bg-white p-5 shadow-md border"
            style={{ borderColor: "rgba(51,45,46,.12)" }}
          >
            <div className="grid gap-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Cliente</label>
                  <select
                    value={clientId}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    style={{ borderColor: "rgba(51,45,46,.18)" }}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.industry}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Diseño</label>
                  <select
                    value={variant}
                    onChange={(e) => setVariant(e.target.value as DesignVariant)}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    style={{ borderColor: "rgba(51,45,46,.18)" }}
                  >
                    <option value="executive">Executive</option>
                    <option value="split">Split</option>
                    <option value="minimal">Minimal</option>
                    <option value="infographic">Infographic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    style={{ borderColor: "rgba(51,45,46,.18)" }}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Subtítulo</label>
                  <input
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    style={{ borderColor: "rgba(51,45,46,.18)" }}
                  />
                </div>
              </div>

              <div className="border-t pt-4" style={{ borderColor: "rgba(51,45,46,.10)" }}>
                <p className="text-sm font-semibold">Servicios</p>

                <div className="mt-3 space-y-4">
                  {Object.entries(servicesByCat).map(([cat, list]) => (
                    <div key={cat}>
                      <p className="text-xs font-semibold opacity-70">{cat}</p>
                      <div className="mt-2 space-y-2">
                        {(list ?? []).map((s) => {
                          const checked = selectedServiceIds.includes(s.id);
                          return (
                            <label key={s.id} className="flex gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setSelectedServiceIds((prev) =>
                                    checked ? prev.filter((x) => x !== s.id) : [...prev, s.id]
                                  );
                                }}
                              />
                              <span>
                                <span className="font-medium">{s.name}</span>
                                <span className="block text-xs opacity-70">{s.summary}</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4" style={{ borderColor: "rgba(51,45,46,.10)" }}>
                <p className="text-sm font-semibold">Controles / diferenciales</p>

                <div className="mt-2 space-y-2">
                  {controls.map((c) => {
                    const checked = selectedControlIds.includes(c.id);
                    return (
                      <label key={c.id} className="flex gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedControlIds((prev) =>
                              checked ? prev.filter((x) => x !== c.id) : [...prev, c.id]
                            );
                          }}
                        />
                        <span>
                          <span className="font-medium">
                            {c.name}
                            {c.highlight ? " ★" : ""}
                          </span>
                          <span className="block text-xs opacity-70">{c.summary}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div
            className="rounded-2xl bg-white p-5 shadow-md border"
            style={{ borderColor: "rgba(51,45,46,.12)" }}
          >
            <Preview
              company={COMPANY}
              client={selectedClient}
              title={customTitle}
              subtitle={customSubtitle}
              services={selectedServices}
              controls={selectedControls}
              options={previewOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
