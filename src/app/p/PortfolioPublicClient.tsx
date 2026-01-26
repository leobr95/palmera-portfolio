"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { COMPANY, CLIENTS, SERVICES, CONTROLS } from "@/lib/mock-data";
import type { DesignVariant } from "@/components/pdf/PortfolioPdf";
import type { ServiceCategory, Service, RepresentativeClient } from "@/lib/mock-data";

import { PortfolioPreviewExecutive } from "@/components/previews/PortfolioPreviewExecutive";
import { PortfolioPreviewSplit } from "@/components/previews/PortfolioPreviewSplit";
import { PortfolioPreviewMinimal } from "@/components/previews/PortfolioPreviewMinimal";
import { PortfolioPreviewInfographic } from "@/components/previews/PortfolioPreviewInfographic";

import { PortfolioOrderEditor } from "@/components/portfolio/PortfolioOrderEditor";

const ALLOWED: DesignVariant[] = ["executive", "split", "minimal", "infographic"];
const DEFAULT_CAT_ORDER: ServiceCategory[] = ["Plagas", "Higiene", "Especializados"];

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
  const variantParam = sp.get("variant") ?? "executive";
  const titleParam = sp.get("title") ?? "Portafolio de Servicios";
  const subtitleParam = sp.get("subtitle") ?? "Propuesta para";
  const clientParam = sp.get("client") ?? (CLIENTS[0]?.id ?? "colanta");
  const servicesParam = sp.get("services") ?? "";
  const controlsParam = sp.get("controls") ?? "";

  const isEdit = editParam === "1";

  const variant = useMemo<DesignVariant>(() => {
    const v = variantParam as DesignVariant;
    return ALLOWED.includes(v) ? v : "executive";
  }, [variantParam]);

  const title = titleParam;
  const subtitle = subtitleParam;

  const client = useMemo(() => {
    return CLIENTS.find((c) => c.id === clientParam) ?? CLIENTS[0];
  }, [clientParam]);

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

  // deps estables (strings) para reset sin loops
  const presentCatsKey = useMemo(() => presentCats.join("|"), [presentCats]);
  const selectedServicesKey = useMemo(() => selectedServices.map((s) => s.id).join("|"), [selectedServices]);

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

  }, [presentCatsKey, selectedServicesKey]); // ✅ deps estables

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
      accentColor: COMPANY.colors.palmeraGreen,
      showAnticimexBadge: true,
      showClientMeta: true,
      maxRepresentativeClients: 7,
      serviceCategoryOrder: categoryOrder,
    }),
    [categoryOrder]
  );

  const Preview = useMemo(() => {
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
  }, [variant]);

  if (!client) return null;

  return (
    <div className="min-h-screen" style={{ background: COMPANY.colors.muted }}>
      <div className="mx-auto max-w-6xl px-4 py-8">
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

        <div className="rounded-2xl bg-white p-5 shadow-md border" style={{ borderColor: "rgba(51,45,46,.12)" }}>
          <Preview
            company={orderedCompany}
            client={client}
            title={title}
            subtitle={subtitle}
            services={orderedServices}
            controls={selectedControls}
            options={options}
          />
        </div>

        {!isEdit ? (
          <div className="mt-3 text-xs opacity-70">
            Tip: agrega <span className="font-semibold">?edit=1</span> a la URL para ordenar por drag & drop.
          </div>
        ) : null}
      </div>
    </div>
  );
}
