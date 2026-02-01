"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { COMPANY, CLIENTS, SERVICES, CONTROLS } from "@/lib/mock-data";
import { buildGenericClient, GENERIC_CLIENT_ID } from "@/lib/portfolio-client";
import type { DesignVariant } from "@/components/pdf/PortfolioPdf";
import type { Client, ServiceCategory, Service, RepresentativeClient } from "@/lib/mock-data";

import { PortfolioPreviewExecutive } from "@/components/previews/PortfolioPreviewExecutive";
import { PortfolioPreviewSplit } from "@/components/previews/PortfolioPreviewSplit";
import { PortfolioPreviewMinimal } from "@/components/previews/PortfolioPreviewMinimal";
import { PortfolioPreviewInfographic } from "@/components/previews/PortfolioPreviewInfographic";
import { PortfolioPreviewBrochure } from "@/components/previews/PortfolioPreviewBrochure";

import { PortfolioOrderEditor } from "@/components/portfolio/PortfolioOrderEditor";

const ALLOWED: DesignVariant[] = ["brochure", "brochure_alt", "infographic"];
const DEFAULT_CAT_ORDER: ServiceCategory[] = ["Plagas", "Higiene", "Especializados"];
const DEFAULT_TITLE = "Portafolio de Servicios";
const DEFAULT_TITLE_GENERIC = "Portafolio General de Servicios";
const DEFAULT_SUBTITLE = "Propuesta para";
const DEFAULT_SUBTITLE_GENERIC = "Soluciones integrales para organizaciones";

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function shallowEqualArray(a: readonly string[], b: readonly string[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function shallowEqualRecordOfArrays(a: Record<string, string[]>, b: Record<string, string[]>) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const k of aKeys) {
    if (!(k in b)) return false;
    if (!shallowEqualArray(a[k] ?? [], b[k] ?? [])) return false;
  }
  return true;
}

function isDefined<T>(v: T | undefined | null): v is T {
  return v !== undefined && v !== null;
}

function buildServiceOrder(catOrder: ServiceCategory[], list: Service[]) {
  const map: Record<string, string[]> = {};
  for (const cat of catOrder) map[cat] = [];
  for (const s of list) {
    map[s.category] ??= [];
    map[s.category].push(s.id);
  }
  return map;
}

export default function PortfolioPublicClient() {
  const sp = useSearchParams();

  // ✅ strings como fuente de verdad (evita ref changes de searchParams)
  const editParam = sp.get("edit") ?? "";
  const variantParam = sp.get("variant") ?? "brochure";
  const titleParam = sp.get("title") ?? "Portafolio de Servicios";
  const subtitleParam = sp.get("subtitle") ?? "Propuesta para";
  const clientParam = sp.get("client") ?? (CLIENTS[0]?.id ?? "colanta");
  const servicesParam = sp.get("services") ?? "";
  const controlsParam = sp.get("controls") ?? "";
  const printParam = sp.get("print") ?? "";

  const shouldAutoPrint = printParam === "1";
  const isEdit = editParam === "1" && !shouldAutoPrint;

  const variant = useMemo<DesignVariant>(() => {
    const v = variantParam as DesignVariant;
    return ALLOWED.includes(v) ? v : "brochure";
  }, [variantParam]);

  const genericClient = useMemo<Client>(() => buildGenericClient(SERVICES, CONTROLS), []);

  const client = useMemo(() => {
    if (clientParam === GENERIC_CLIENT_ID) return genericClient;
    return CLIENTS.find((c) => c.id === clientParam) ?? CLIENTS[0];
  }, [clientParam, genericClient]);

  const title = useMemo(() => {
    if (client.id === GENERIC_CLIENT_ID && titleParam === DEFAULT_TITLE) {
      return DEFAULT_TITLE_GENERIC;
    }
    return titleParam;
  }, [client.id, titleParam]);

  const subtitle = useMemo(() => {
    if (client.id === GENERIC_CLIENT_ID && subtitleParam === DEFAULT_SUBTITLE) {
      return DEFAULT_SUBTITLE_GENERIC;
    }
    return subtitleParam;
  }, [client.id, subtitleParam]);

  // ✅ ids memoizados (dependen de strings)
  const serviceIds = useMemo(() => {
    return servicesParam
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }, [servicesParam]);

  const controlIds = useMemo(() => {
    return controlsParam
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }, [controlsParam]);

  const finalServiceIds = useMemo(() => {
    return serviceIds.length ? serviceIds : client.recommendedServiceIds;
  }, [serviceIds, client.recommendedServiceIds]);

  const finalControlIds = useMemo(() => {
    return controlIds.length ? controlIds : client.recommendedControlIds;
  }, [controlIds, client.recommendedControlIds]);

  // ✅ selectedServices/Controls memoizados y estables
  const selectedServices = useMemo<Service[]>(() => {
    const set = new Set(finalServiceIds);
    return SERVICES.filter((s) => set.has(s.id));
  }, [finalServiceIds]);

  const selectedControls = useMemo(() => {
    const set = new Set(finalControlIds);
    return CONTROLS.filter((c) => set.has(c.id));
  }, [finalControlIds]);

  // ====== Categorías presentes (memo)
  const presentCats = useMemo<ServiceCategory[]>(() => {
    const cats = uniq(selectedServices.map((s) => s.category));
    return [
      ...DEFAULT_CAT_ORDER.filter((c) => cats.includes(c)),
      ...cats.filter((c) => !DEFAULT_CAT_ORDER.includes(c)),
    ];
  }, [selectedServices]);

  const [categoryOrder, setCategoryOrder] = useState<ServiceCategory[]>(() => presentCats);
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});
  const [serviceOrderByCategory, setServiceOrderByCategory] = useState<Record<string, string[]>>({});

  const servicesByCategory = useMemo<Record<string, Service[]>>(() => {
    const map: Record<string, Service[]> = {};
    for (const cat of presentCats) map[cat] = [];
    for (const s of selectedServices) {
      map[s.category] ??= [];
      map[s.category].push(s);
    }
    return map;
  }, [presentCats, selectedServices]);

  // ✅ Memo: datos de company estables (fix exhaustive-deps)
  const companyCerts = useMemo(() => COMPANY.certifications ?? [], []);
  const companyCoverage = useMemo(() => COMPANY.coverage ?? [], []);
  const companyRepClients = useMemo(
    () => (COMPANY.representativeClients ?? []) as RepresentativeClient[],
    []
  );

  const [certOrder, setCertOrder] = useState<string[]>(() => companyCerts.map((c) => c.id));
  const [coverageOrder, setCoverageOrder] = useState<string[]>(() => companyCoverage);
  const [repClientOrder, setRepClientOrder] = useState<string[]>(() => companyRepClients.map((c) => c.id));
  const [previewAnimNonce, setPreviewAnimNonce] = useState(0);
  const didInitPreviewAnim = useRef(false);

  // ✅ Reset de órdenes SOLO cuando cambian realmente los servicios/cats
  useEffect(() => {
    // categoryOrder
    setCategoryOrder((prev) => {
      const next = presentCats;
      const prevStr = prev.map(String);
      const nextStr = next.map(String);
      return shallowEqualArray(prevStr, nextStr) ? prev : next;
    });

    // serviceOrderByCategory
    const nextOrder = buildServiceOrder(presentCats, selectedServices);
    setServiceOrderByCategory((prev) => {
      return shallowEqualRecordOfArrays(prev, nextOrder) ? prev : nextOrder;
    });

    // si quieres resetear colapsados cuando cambien cats, lo puedes hacer aquí
    // setCollapsedCats({});

  }, [presentCats, selectedServices]);

  // ====== Derivados ordenados (para Preview)
  const orderedServices = useMemo(() => {
    const byId = new Map(selectedServices.map((s) => [s.id, s]));
    const result: Service[] = [];

    for (const cat of categoryOrder) {
      const ids = serviceOrderByCategory[cat] ?? [];
      const fallback = (servicesByCategory[cat] ?? []).map((s) => s.id);
      const useIds = ids.length ? ids : fallback;

      for (const id of useIds) {
        const s = byId.get(id);
        if (s) result.push(s);
      }
    }
    return result;
  }, [selectedServices, categoryOrder, serviceOrderByCategory, servicesByCategory]);
  const orderedServiceIdsKey = useMemo(() => orderedServices.map((s) => s.id).join("|"), [orderedServices]);

  useEffect(() => {
    if (!didInitPreviewAnim.current) {
      didInitPreviewAnim.current = true;
      return;
    }
    const rafId = window.requestAnimationFrame(() => {
      setPreviewAnimNonce((prev) => prev + 1);
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [orderedServiceIdsKey]);

  const orderedCompany = useMemo(() => {
    const certById = new Map(companyCerts.map((c) => [c.id, c]));
    const repById = new Map(companyRepClients.map((c) => [c.id, c]));

    return {
      ...COMPANY,
      certifications: certOrder.map((id) => certById.get(id)).filter(isDefined),
      coverage: coverageOrder.filter(Boolean),
      representativeClients: repClientOrder.map((id) => repById.get(id)).filter(isDefined),
    };
  }, [certOrder, coverageOrder, repClientOrder, companyCerts, companyRepClients]);

  const options = useMemo(
    () => ({
      logoSrc: "/brand/palmera-junior.webp",
      accentColor: variant === "brochure_alt" ? "#3bd5ff" : COMPANY.colors.palmeraGreen,
      showAnticimexBadge: true,
      showClientMeta: client.id !== GENERIC_CLIENT_ID,
      maxRepresentativeClients: 7,
      serviceCategoryOrder: categoryOrder,
      brochureTheme: variant === "brochure_alt" ? ("aqua" as const) : ("green" as const),
    }),
    [categoryOrder, client.id, variant]
  );

  const Preview = useMemo(() => {
    switch (variant) {
      case "infographic":
        return PortfolioPreviewInfographic;
      case "brochure":
        return PortfolioPreviewBrochure;
      case "brochure_alt":
        return PortfolioPreviewBrochure;
      case "split":
        return PortfolioPreviewSplit;
      case "minimal":
        return PortfolioPreviewMinimal;
      case "executive":
      default:
        return PortfolioPreviewExecutive;
    }
  }, [variant]);

  useEffect(() => {
    if (!shouldAutoPrint) return;
    const timer = window.setTimeout(() => {
      window.print();
    }, 420);
    return () => window.clearTimeout(timer);
  }, [shouldAutoPrint]);

  if (!client) return null;

  return (
    <div className="min-h-screen portfolio-public-root" style={{ background: COMPANY.colors.muted }}>
      <div className="mx-auto max-w-6xl px-4 py-8 portfolio-public-shell">
        {isEdit ? (
          <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: "rgba(51,45,46,.12)" }}>
            <p className="text-sm font-semibold">Editor de contenido</p>
            <p className="mt-1 text-xs opacity-70">
              Organiza el orden de servicios, clientes, certificaciones y cobertura para esta versión del portafolio.
            </p>
          </div>
        ) : null}

        {isEdit ? (
          <PortfolioOrderEditor
            categories={presentCats}
            categoryOrder={categoryOrder}
            setCategoryOrder={setCategoryOrder}
            servicesByCategory={servicesByCategory}
            serviceOrderByCategory={serviceOrderByCategory}
            setServiceOrderByCategory={setServiceOrderByCategory}
            collapsedCats={collapsedCats}
            setCollapsedCats={setCollapsedCats}
            certs={companyCerts.map((c) => ({ id: c.id, name: c.name }))}
            certOrder={certOrder}
            setCertOrder={setCertOrder}
            coverage={companyCoverage}
            coverageOrder={coverageOrder}
            setCoverageOrder={setCoverageOrder}
            repClients={companyRepClients}
            repClientOrder={repClientOrder}
            setRepClientOrder={setRepClientOrder}
          />
        ) : null}

        <div
          className="rounded-2xl bg-white p-5 shadow-md border portfolio-public-card"
          style={{ borderColor: "rgba(51,45,46,.12)" }}
        >
          <div
            className={[
              previewAnimNonce
                ? previewAnimNonce % 2 === 0
                  ? "preview-reorder-a"
                  : "preview-reorder-b"
                : "",
            ].join(" ")}
          >
            <Preview
              key={variant}
              company={orderedCompany}
              client={client}
              title={title}
              subtitle={subtitle}
              services={orderedServices}
              controls={selectedControls}
              options={options}
            />
          </div>
        </div>

        {!isEdit ? (
          <div className="mt-3 text-xs opacity-70 portfolio-public-tip">
            Tip: agrega <span className="font-semibold">?edit=1</span> a la URL para ordenar por drag & drop.
          </div>
        ) : null}
      </div>

      <style jsx global>{`
        @media print {
          .portfolio-public-root {
            background: #fff !important;
            min-height: auto !important;
          }
          .portfolio-public-shell {
            max-width: none !important;
            padding: 0 !important;
          }
          .portfolio-public-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .portfolio-public-tip {
            display: none !important;
          }
        }
      `}</style>
      <style jsx>{`
        .preview-reorder-a,
        .preview-reorder-b {
          animation: previewReorderPulse 340ms cubic-bezier(0.22, 0.72, 0.2, 1);
        }

        @keyframes previewReorderPulse {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          40% {
            transform: translateY(-3px) scale(0.996);
            opacity: 0.9;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
