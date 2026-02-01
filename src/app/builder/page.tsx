"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PDFDownloadLink } from "@react-pdf/renderer";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type {
  Client,
  Control,
  Service,
  ServiceCategory,
  ServiceIcon,
} from "@/lib/mock-data";
import { COMPANY } from "@/lib/mock-data";
import { getClients, getControls, getServices } from "@/lib/mock-api";
import { buildGenericClient, GENERIC_CLIENT_ID } from "@/lib/portfolio-client";

import { PortfolioPdf } from "@/components/pdf/PortfolioPdf";
import type { DesignVariant } from "@/components/pdf/PortfolioPdf";

import { PortfolioPreviewExecutive } from "@/components/previews/PortfolioPreviewExecutive";
import { PortfolioPreviewSplit } from "@/components/previews/PortfolioPreviewSplit";
import { PortfolioPreviewMinimal } from "@/components/previews/PortfolioPreviewMinimal";
import { PortfolioPreviewInfographic } from "@/components/previews/PortfolioPreviewInfographic";
import { PortfolioPreviewBrochure } from "@/components/previews/PortfolioPreviewBrochure";

const INITIAL_CLIENT_ID = "colanta";
const DEFAULT_TITLE = "Portafolio de Servicios";
const DEFAULT_TITLE_GENERIC = "Portafolio General de Servicios";
const DEFAULT_SUBTITLE = "Propuesta para";
const DEFAULT_SUBTITLE_GENERIC = "Soluciones integrales para organizaciones";

// (opcional) para un orden base bonito cuando se inicializa por primera vez
const DEFAULT_CAT_ORDER: ServiceCategory[] = ["Plagas", "Higiene", "Especializados"];

type PreviewOptions = {
  logoSrc: string;
  accentColor: string;
  showAnticimexBadge: boolean;
  showClientMeta: boolean;
  maxRepresentativeClients: number;
  serviceCategoryOrder?: ServiceCategory[];
  brochureTheme?: "green" | "aqua";
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

type ServiceOrderState = {
  categoryOrder: ServiceCategory[];
  serviceOrderByCategory: Record<string, string[]>; // cat -> serviceIds
  collapsedCats: Record<string, boolean>;
};

type EditorPrimaryTab = "services" | "controls";
type ServiceEditorTab = "select" | "order";
type ControlEditorTab = "select" | "order";

function groupByCategory(services: Service[]) {
  return services.reduce<Partial<Record<ServiceCategory, Service[]>>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});
}

function arrayMove<T>(arr: T[], from: number, to: number) {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function Grip() {
  return (
    <span className="select-none text-lg leading-none opacity-60" title="Arrastrar">
      ≡
    </span>
  );
}

function ServiceListIcon({ icon }: { icon: ServiceIcon }) {
  const bugIcons: ServiceIcon[] = ["rat", "cockroach", "fly", "mosquito", "ant", "flea", "tick", "termite", "bat", "snake"];
  const useBug = bugIcons.includes(icon);

  return (
    <span
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border"
      style={{ borderColor: "rgba(0,0,0,.08)", background: "rgba(46,232,142,.14)" }}
      title={icon}
    >
      <svg
        viewBox="0 0 24 24"
        width={18}
        height={18}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "#0f5d3a" }}
      >
        {icon === "spray" && (
          <>
            <path d="M4 14h10a2 2 0 0 1 2 2v4H4z" />
            <path d="M8 14V9h4v5" />
            <path d="M12 9h8" />
          </>
        )}
        {useBug && (
          <>
            <circle cx="12" cy="8" r="2" />
            <ellipse cx="12" cy="14" rx="4" ry="5" />
            <path d="M8 12H5" />
            <path d="M19 12h-3" />
          </>
        )}
        {icon === "bird" && (
          <>
            <path d="M4 13c2.5 3 6 5 10 5 4 0 6-2.5 6-4.2 0-1.2-.8-2.2-2-2.2h-3L11 8 8 9l-1 2H4.8A2.8 2.8 0 0 0 2 13.8V18" />
            <path d="M14 8h3" />
          </>
        )}
        {icon === "grain" && (
          <>
            <path d="M12 5v14" />
            <path d="M12 8c-2 0-3.5-1.5-3.5-3.5C10.5 4.5 12 6 12 8z" />
            <path d="M12 12c2 0 3.5-1.5 3.5-3.5C13.5 8.5 12 10 12 12z" />
          </>
        )}
        {icon === "shield" && (
          <>
            <path d="M12 3l7 3v5c0 4.5-2.8 8.3-7 10-4.2-1.7-7-5.5-7-10V6z" />
            <path d="m9 12 2 2 4-4" />
          </>
        )}
        {icon === "water" && (
          <>
            <path d="M12 3c4 5 6 7.6 6 10.1A6 6 0 0 1 6 13.1C6 10.6 8 8 12 3z" />
            <path d="M9 15c.8.8 2 1.3 3 1.3 1.2 0 2.2-.4 3-1.3" />
          </>
        )}
        {icon === "wrench" && (
          <path d="M21 7.5a4.5 4.5 0 0 1-6 4.2L8 18.8a2 2 0 1 1-2.8-2.8L12.3 9A4.5 4.5 0 1 1 21 7.5z" />
        )}
      </svg>
    </span>
  );
}

/** ✅ Item (servicio/control) sortable */
function SortableRow({
  id,
  title,
  subtitle,
  leading,
}: {
  id: string;
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    position: "relative",
    zIndex: isDragging ? 30 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex w-full min-w-0 flex-col gap-2 rounded-xl border bg-white p-3 sm:flex-row sm:items-center sm:gap-3"
    >
      {leading ? <div className="shrink-0">{leading}</div> : null}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium break-words sm:truncate">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 text-xs opacity-70 break-words sm:truncate">{subtitle}</p>
        ) : null}
      </div>

      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="shrink-0 self-end sm:self-auto cursor-grab rounded-lg px-2 py-1 hover:bg-black/5 active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        <Grip />
      </div>
    </div>
  );
}

/** ✅ Header sortable (categoría) + colapsar */
function SortableCategoryHeader({
  dndId,
  label,
  count,
  collapsed,
  onToggle,
}: {
  dndId: string; // ej: "cat:Plagas"
  label: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dndId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    position: "relative",
    zIndex: isDragging ? 40 : 2,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2"
    >
      <button
        type="button"
        onClick={onToggle}
        className="min-w-0 flex-1 text-left"
        title={collapsed ? "Expandir" : "Colapsar"}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-sm font-semibold truncate">{label}</span>
          <span className="text-xs opacity-60 shrink-0">({count})</span>
          <span className="text-xs opacity-60 shrink-0">{collapsed ? "▸" : "▾"}</span>
        </div>
      </button>

      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab rounded-lg px-2 py-1 hover:bg-black/5 active:cursor-grabbing"
        style={{ touchAction: "none" }}
        title="Arrastrar categoría"
      >
        <Grip />
      </div>
    </div>
  );
}

function buildServiceOrderStateFromIds(
  ids: string[],
  services: Service[]
): Pick<ServiceOrderState, "categoryOrder" | "serviceOrderByCategory"> {
  const byId = new Map(services.map((s) => [s.id, s]));
  const serviceOrderByCategory: Record<string, string[]> = {};
  const seenCats: ServiceCategory[] = [];

  for (const id of ids) {
    const s = byId.get(id);
    if (!s) continue;
    if (!serviceOrderByCategory[s.category]) serviceOrderByCategory[s.category] = [];
    serviceOrderByCategory[s.category].push(s.id);
    if (!seenCats.includes(s.category)) seenCats.push(s.category);
  }

  // base order bonito + el resto
  const cats = uniq(seenCats);
  const categoryOrder: ServiceCategory[] = [
    ...DEFAULT_CAT_ORDER.filter((c) => cats.includes(c)),
    ...cats.filter((c) => !DEFAULT_CAT_ORDER.includes(c)),
  ];

  return { categoryOrder, serviceOrderByCategory };
}

export default function BuilderPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [controls, setControls] = useState<Control[]>([]);

  const [clientId, setClientId] = useState<string>(INITIAL_CLIENT_ID);

  // ✅ orden de controles (plano)
  const [selectedControlIds, setSelectedControlIds] = useState<string[]>([]);

  // ✅ orden de servicios (por categoría)
  const [svcOrder, setSvcOrder] = useState<ServiceOrderState>({
    categoryOrder: [],
    serviceOrderByCategory: {},
    collapsedCats: {},
  });

  const [customTitle, setCustomTitle] = useState<string>("Portafolio de Servicios");
  const [customSubtitle, setCustomSubtitle] = useState<string>("Propuesta para");
  const [variant, setVariant] = useState<DesignVariant>("brochure");
  const [editorPrimaryTab, setEditorPrimaryTab] = useState<EditorPrimaryTab>("services");
  const [serviceEditorTab, setServiceEditorTab] = useState<ServiceEditorTab>("select");
  const [controlEditorTab, setControlEditorTab] = useState<ControlEditorTab>("select");
  const [previewAnimNonce, setPreviewAnimNonce] = useState(0);
  const didInitPreviewAnim = useRef(false);

  // ✅ Sensores DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    Promise.all([getClients(), getServices(), getControls()]).then(([c, s, k]) => {
      setClients(c);
      setServices(s);
      setControls(k);

      const defaultClient = c.find((x) => x.id === INITIAL_CLIENT_ID) ?? c[0];
      if (!defaultClient) return;

      setClientId(defaultClient.id);

      // ✅ init servicios por categoría
      const initSvc = buildServiceOrderStateFromIds(defaultClient.recommendedServiceIds, s);
      setSvcOrder((prev) => ({
        ...prev,
        categoryOrder: initSvc.categoryOrder,
        serviceOrderByCategory: initSvc.serviceOrderByCategory,
        collapsedCats: {}, // o conserva: prev.collapsedCats
      }));

      // ✅ init controles plano
      setSelectedControlIds(defaultClient.recommendedControlIds);
    });
  }, []);

  const servicesByCat = useMemo(() => groupByCategory(services), [services]);

  const serviceById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);
  const controlById = useMemo(() => new Map(controls.map((c) => [c.id, c])), [controls]);
  const genericClient = useMemo(() => buildGenericClient(services, controls), [services, controls]);

  const selectedClient = useMemo(() => {
    if (clientId === GENERIC_CLIENT_ID) return genericClient;
    return clients.find((c) => c.id === clientId) ?? null;
  }, [clients, clientId, genericClient]);

  // ✅ ids planos (orden final) => URL/PDF/Preview
  const selectedServiceIds = useMemo(() => {
    return svcOrder.categoryOrder.flatMap((cat) => svcOrder.serviceOrderByCategory[cat] ?? []);
  }, [svcOrder.categoryOrder, svcOrder.serviceOrderByCategory]);
  const selectedServiceOrderKey = useMemo(() => selectedServiceIds.join("|"), [selectedServiceIds]);

  const selectedServiceIdSet = useMemo(() => new Set(selectedServiceIds), [selectedServiceIds]);

  useEffect(() => {
    if (!didInitPreviewAnim.current) {
      didInitPreviewAnim.current = true;
      return;
    }
    const rafId = window.requestAnimationFrame(() => {
      setPreviewAnimNonce((prev) => prev + 1);
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [selectedServiceOrderKey]);

  // ✅ services ordenados (flatten por categoría)
  const selectedServices = useMemo(() => {
    return selectedServiceIds.map((id) => serviceById.get(id)).filter(Boolean) as Service[];
  }, [selectedServiceIds, serviceById]);

  // ✅ controls ordenados (plano)
  const selectedControls = useMemo(() => {
    return selectedControlIds.map((id) => controlById.get(id)).filter(Boolean) as Control[];
  }, [selectedControlIds, controlById]);

  const shareUrl = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("client", selectedClient?.id ?? "");
    sp.set("services", selectedServiceIds.join(",")); // ✅ ordenado por categorías
    sp.set("controls", selectedControlIds.join(",")); // ✅ ordenado
    sp.set("title", customTitle);
    sp.set("subtitle", customSubtitle);
    sp.set("variant", variant);
    return `/p?${sp.toString()}`;
  }, [
    selectedClient?.id,
    selectedServiceIds,
    selectedControlIds,
    customTitle,
    customSubtitle,
    variant,
  ]);

  const copyLink = async () => {
    const full = `${window.location.origin}${shareUrl}`;
    await navigator.clipboard.writeText(full);
    alert("Link copiado ✅");
  };

  const openBrowserPdf = () => {
    const separator = shareUrl.includes("?") ? "&" : "?";
    const full = `${window.location.origin}${shareUrl}${separator}print=1`;
    window.open(full, "_blank", "noopener,noreferrer");
  };

  const handleClientChange = (nextClientId: string) => {
    setClientId(nextClientId);
    const nextIsGenericClient = nextClientId === GENERIC_CLIENT_ID;

    if (nextIsGenericClient) {
      if (customTitle === DEFAULT_TITLE) setCustomTitle(DEFAULT_TITLE_GENERIC);
      if (customSubtitle === DEFAULT_SUBTITLE) setCustomSubtitle(DEFAULT_SUBTITLE_GENERIC);
    } else {
      if (customTitle === DEFAULT_TITLE_GENERIC) setCustomTitle(DEFAULT_TITLE);
      if (customSubtitle === DEFAULT_SUBTITLE_GENERIC) setCustomSubtitle(DEFAULT_SUBTITLE);
    }

    if (nextClientId === GENERIC_CLIENT_ID) {
      const initSvc = buildServiceOrderStateFromIds(genericClient.recommendedServiceIds, services);
      setSvcOrder((prev) => ({
        ...prev,
        categoryOrder: initSvc.categoryOrder,
        serviceOrderByCategory: initSvc.serviceOrderByCategory,
        collapsedCats: {},
      }));
      setSelectedControlIds(genericClient.recommendedControlIds);
      return;
    }

    const nextClient = clients.find((c) => c.id === nextClientId);
    if (!nextClient) return;

    // ✅ reset servicios por categoría
    const initSvc = buildServiceOrderStateFromIds(nextClient.recommendedServiceIds, services);
    setSvcOrder((prev) => ({
      ...prev,
      categoryOrder: initSvc.categoryOrder,
      serviceOrderByCategory: initSvc.serviceOrderByCategory,
      collapsedCats: {},
    }));

    // ✅ reset controles
    setSelectedControlIds(nextClient.recommendedControlIds);
  };

  const previewOptions: PreviewOptions = useMemo(
    () => ({
      logoSrc: "/brand/palmera-junior.webp",
      accentColor: variant === "brochure_alt" ? "#3bd5ff" : COMPANY.colors.palmeraGreen,
      showAnticimexBadge: true,
      showClientMeta: selectedClient?.id !== GENERIC_CLIENT_ID,
      maxRepresentativeClients: 7,
      serviceCategoryOrder: svcOrder.categoryOrder,
      brochureTheme: variant === "brochure_alt" ? "aqua" : "green",
    }),
    [selectedClient?.id, svcOrder.categoryOrder, variant]
  );

  const previewMap: Record<DesignVariant, React.ComponentType<PreviewProps>> = {
    executive: PortfolioPreviewExecutive,
    split: PortfolioPreviewSplit,
    minimal: PortfolioPreviewMinimal,
    infographic: PortfolioPreviewInfographic,
    brochure: PortfolioPreviewBrochure,
    brochure_alt: PortfolioPreviewBrochure,
  };

  const Preview = previewMap[variant];

  const pdfKey = useMemo(() => {
    return [
      variant,
      selectedClient?.id ?? "",
      selectedServiceIds.join("."),
      selectedControlIds.join("."),
      customTitle,
      customSubtitle,
    ].join("|");
  }, [
    variant,
    selectedClient?.id,
    selectedServiceIds,
    selectedControlIds,
    customTitle,
    customSubtitle,
  ]);

  // ===== DnD categorías
  function onDragCategories(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const ids = svcOrder.categoryOrder.map((c) => `cat:${c}`);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;

    setSvcOrder((prev) => ({
      ...prev,
      categoryOrder: arrayMove(prev.categoryOrder, from, to),
    }));
  }

  // ===== DnD servicios dentro de categoría
  function onDragServices(cat: ServiceCategory, e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    setSvcOrder((prev) => {
      const curr = prev.serviceOrderByCategory[cat] ?? [];
      const from = curr.indexOf(String(active.id));
      const to = curr.indexOf(String(over.id));
      if (from < 0 || to < 0) return prev;

      return {
        ...prev,
        serviceOrderByCategory: {
          ...prev.serviceOrderByCategory,
          [cat]: arrayMove(curr, from, to),
        },
      };
    });
  }

  // ===== DnD controles (plano)
  function onDragSelectedControls(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    setSelectedControlIds((prev) => {
      const from = prev.indexOf(String(active.id));
      const to = prev.indexOf(String(over.id));
      if (from < 0 || to < 0) return prev;
      return arrayMove(prev, from, to);
    });
  }

  function toggleServiceSelection(s: Service) {
    setSvcOrder((prev) => {
      const cat = s.category;
      const curr = prev.serviceOrderByCategory[cat] ?? [];
      const isSelected = curr.includes(s.id);

      if (isSelected) {
        const nextIds = curr.filter((x) => x !== s.id);
        const nextMap = { ...prev.serviceOrderByCategory, [cat]: nextIds };

        // si quedó vacía la categoría, la quitamos
        if (nextIds.length === 0) {
          const nextOrder = prev.categoryOrder.filter((c) => c !== cat);
          delete nextMap[cat];
          const nextCollapsed = { ...prev.collapsedCats };
          delete nextCollapsed[cat];

          return {
            ...prev,
            categoryOrder: nextOrder,
            serviceOrderByCategory: nextMap,
            collapsedCats: nextCollapsed,
          };
        }

        return { ...prev, serviceOrderByCategory: nextMap };
      }

      // agregar
      const nextOrder = prev.categoryOrder.includes(cat)
        ? prev.categoryOrder
        : [...prev.categoryOrder, cat];

      return {
        ...prev,
        categoryOrder: nextOrder,
        serviceOrderByCategory: {
          ...prev.serviceOrderByCategory,
          [cat]: [...curr, s.id],
        },
      };
    });
  }

  function toggleCatCollapse(cat: ServiceCategory) {
    setSvcOrder((prev) => ({
      ...prev,
      collapsedCats: {
        ...prev.collapsedCats,
        [cat]: !prev.collapsedCats[cat],
      },
    }));
  }

  if (!selectedClient) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: COMPANY.colors.muted }}>
        <p className="text-sm opacity-70" style={{ color: COMPANY.colors.ink }}>
          Cargando datos...
        </p>
      </div>
    );
  }

  const shellBackground =
    "radial-gradient(1200px 700px at 10% 8%, rgba(46,232,142,.18), transparent 60%), radial-gradient(1000px 760px at 92% 12%, rgba(24,182,93,.18), transparent 58%), linear-gradient(180deg, #041f14, #062a1b)";
  const panelBackground = "linear-gradient(180deg, rgba(255,255,255,.96), rgba(238,251,244,.96))";
  const panelBorder = "rgba(46,232,142,.26)";

  return (
    <div className="min-h-screen w-full" style={{ background: shellBackground }}>
      {/* FULL width */}
      <div className="w-full px-4 py-8 2xl:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold" style={{ color: "#eaf6ff" }}>
              Constructor de Portafolios
            </h1>
            <p className="text-sm" style={{ color: "rgba(234,246,255,.84)" }}>
              Selecciona cliente, ordena servicios por categoría y genera link o PDF.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyLink}
              className="rounded-xl border px-4 py-2 text-white"
              style={{
                background: "linear-gradient(135deg, #0b402a, #062f1f)",
                borderColor: "rgba(255,255,255,.14)",
              }}
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
                  services={selectedServices} // ✅ ya ordenado (categorías + servicios)
                  controls={selectedControls} // ✅ ordenado
                  variant={variant}
                  logoPalmeraSrc="/brand/palmera-junior.webp"
                  logoAnticimexSrc="/brand/anticimex.png"
                />
              }
              fileName={`Portafolio_${selectedClient.name}.pdf`}
              className="rounded-xl border px-4 py-2 text-white"
              style={{
                background: "linear-gradient(135deg, #2ee88e, #18b65d)",
                borderColor: "rgba(255,255,255,.16)",
              }}
            >
              {({ loading }) => (loading ? "Generando..." : "Descargar PDF")}
            </PDFDownloadLink>

            <button
              onClick={openBrowserPdf}
              className="rounded-xl border px-4 py-2 text-white"
              style={{
                background: "linear-gradient(135deg, #0d5a3a, #0a422b)",
                borderColor: "rgba(255,255,255,.16)",
              }}
            >
              PDF navegador
            </button>

            <Link
              href={shareUrl}
              className="rounded-xl border px-4 py-2 text-white"
              style={{
                background: "rgba(255,255,255,.08)",
                borderColor: "rgba(255,255,255,.18)",
              }}
            >
              Abrir portafolio
            </Link>
          </div>
        </div>

        {/* 2 columnas */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:h-[calc(100dvh-220px)] lg:grid-cols-[minmax(420px,560px)_minmax(0,1fr)]">
          {/* Builder */}
          <div
            className="min-w-0 rounded-2xl border p-5 shadow-md backdrop-blur-sm overflow-x-hidden lg:h-full lg:overflow-y-auto"
            style={{ borderColor: panelBorder, background: panelBackground }}
          >
            <div className="grid gap-5 min-w-0">
              <div className="min-w-0">
                <p className="text-sm font-semibold">1) Cliente y diseño</p>
                <p className="text-xs opacity-70">Selecciona el tipo de portafolio y el estilo visual.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 min-w-0">
                <div className="min-w-0">
                  <label className="text-sm font-medium">Cliente</label>
                  <select
                    value={clientId}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    style={{ borderColor: "rgba(51,45,46,.18)" }}
                  >
                    <option value={GENERIC_CLIENT_ID}>Sin cliente específico — Portafolio general</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.industry}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="text-sm font-medium">Diseño</label>
                  <select
                    value={variant}
                    onChange={(e) => setVariant(e.target.value as DesignVariant)}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    style={{ borderColor: "rgba(51,45,46,.18)" }}
                  >
                    <option value="brochure">Brochure Verde</option>
                    <option value="brochure_alt">Brochure Aqua</option>
                    <option value="infographic">Infográfico</option>
                  </select>
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold">2) Textos de portada</p>
                <p className="text-xs opacity-70">Define el título y subtítulo que verá el cliente.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 min-w-0">
                <div className="min-w-0">
                  <label className="text-sm font-medium">Título</label>
                  <input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    style={{ borderColor: "rgba(51,45,46,.18)" }}
                  />
                </div>

                <div className="min-w-0">
                  <label className="text-sm font-medium">Subtítulo</label>
                  <input
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    style={{ borderColor: "rgba(51,45,46,.18)" }}
                  />
                </div>
              </div>

              {/* ✅ Editor por pestañas: primero servicios / luego controles */}
              <div className="border-t pt-4 min-w-0" style={{ borderColor: "rgba(51,45,46,.10)" }}>
                <div className="mb-3 min-w-0">
                  <p className="text-sm font-semibold">3) Selección y orden de contenido</p>
                  <p className="text-xs opacity-70">Edita qué servicios y controles aparecen y en qué orden.</p>
                </div>
                <div className="inline-flex rounded-xl border p-1" style={{ borderColor: "rgba(51,45,46,.15)" }}>
                  <button
                    type="button"
                    onClick={() => setEditorPrimaryTab("services")}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium"
                    style={{
                      background: editorPrimaryTab === "services" ? "rgba(46,232,142,.18)" : "transparent",
                    }}
                  >
                    Servicios
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorPrimaryTab("controls")}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium"
                    style={{
                      background: editorPrimaryTab === "controls" ? "rgba(46,232,142,.18)" : "transparent",
                    }}
                  >
                    Controles
                  </button>
                </div>

                {editorPrimaryTab === "services" ? (
                  <div className="mt-4">
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">Servicios</p>
                        <p className="text-xs opacity-70">Selecciona servicios y luego ordénalos por prioridad.</p>
                      </div>
                      <span className="text-xs opacity-70">{selectedServiceIds.length}</span>
                    </div>

                    <div className="mt-3 inline-flex rounded-xl border p-1" style={{ borderColor: "rgba(51,45,46,.15)" }}>
                      <button
                        type="button"
                        onClick={() => setServiceEditorTab("select")}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium"
                        style={{
                          background: serviceEditorTab === "select" ? "rgba(46,232,142,.18)" : "transparent",
                        }}
                      >
                        Seleccionar
                      </button>
                      <button
                        type="button"
                        onClick={() => setServiceEditorTab("order")}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium"
                        style={{
                          background: serviceEditorTab === "order" ? "rgba(46,232,142,.18)" : "transparent",
                        }}
                      >
                        Ordenar
                      </button>
                    </div>

                    {serviceEditorTab === "order" ? (
                      selectedServiceIds.length ? (
                        <div className="mt-3">
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={onDragCategories}
                          >
                            <SortableContext
                              items={svcOrder.categoryOrder.map((c) => `cat:${c}`)}
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="space-y-2">
                                {svcOrder.categoryOrder.map((cat) => {
                                  const dndId = `cat:${cat}`;
                                  const collapsed = Boolean(svcOrder.collapsedCats[cat]);
                                  const ids = svcOrder.serviceOrderByCategory[cat] ?? [];

                                  if (!ids.length) return null;

                                  return (
                                    <div key={cat} className="space-y-2">
                                      <SortableCategoryHeader
                                        dndId={dndId}
                                        label={cat}
                                        count={ids.length}
                                        collapsed={collapsed}
                                        onToggle={() => toggleCatCollapse(cat)}
                                      />

                                      {!collapsed ? (
                                        <div
                                          className="ml-3 space-y-2 border-l pl-3 overflow-x-hidden"
                                          style={{ borderColor: "rgba(51,45,46,.10)" }}
                                        >
                                          <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={(e) => onDragServices(cat, e)}
                                          >
                                            <SortableContext
                                              items={ids}
                                              strategy={verticalListSortingStrategy}
                                            >
                                              <div className="space-y-2 max-h-[260px] overflow-y-auto overflow-x-hidden pr-1">
                                                {ids.map((id) => {
                                                  const s = serviceById.get(id);
                                                  if (!s) return null;
                                                  return (
                                                    <SortableRow
                                                      key={id}
                                                      id={id}
                                                      title={s.name}
                                                      subtitle={s.summary}
                                                      leading={<ServiceListIcon icon={s.icon} />}
                                                    />
                                                  );
                                                })}
                                              </div>
                                            </SortableContext>
                                          </DndContext>
                                        </div>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            </SortableContext>
                          </DndContext>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs opacity-70">Selecciona servicios para poder ordenar.</p>
                      )
                    ) : (
                      <div className="mt-3 space-y-4 min-w-0">
                        {Object.entries(servicesByCat).map(([cat, list]) => (
                          <div key={cat} className="min-w-0">
                            <p className="text-xs font-semibold opacity-70">{cat}</p>

                            <div className="mt-2 space-y-2 min-w-0">
                              {(list ?? []).map((s) => {
                                const checked = selectedServiceIdSet.has(s.id);
                                return (
                                  <label key={s.id} className="flex gap-2 text-sm items-start min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      className="mt-1.5 h-5 w-5 shrink-0 rounded border-[#0f5d3a]"
                                      style={{ accentColor: "#18b65d" }}
                                      onChange={() => toggleServiceSelection(s)}
                                    />
                                    <span className="shrink-0">
                                      <ServiceListIcon icon={s.icon} />
                                    </span>
                                    <span className="min-w-0">
                                      <span className="font-medium break-words">{s.name}</span>
                                      <span className="block text-xs opacity-70 break-words">{s.summary}</span>
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">Controles / diferenciales</p>
                        <p className="text-xs opacity-70">Selecciona controles y luego ordénalos por prioridad.</p>
                      </div>
                      <span className="text-xs opacity-70">{selectedControlIds.length}</span>
                    </div>

                    <div className="mt-3 inline-flex rounded-xl border p-1" style={{ borderColor: "rgba(51,45,46,.15)" }}>
                      <button
                        type="button"
                        onClick={() => setControlEditorTab("select")}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium"
                        style={{
                          background: controlEditorTab === "select" ? "rgba(46,232,142,.18)" : "transparent",
                        }}
                      >
                        Seleccionar
                      </button>
                      <button
                        type="button"
                        onClick={() => setControlEditorTab("order")}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium"
                        style={{
                          background: controlEditorTab === "order" ? "rgba(46,232,142,.18)" : "transparent",
                        }}
                      >
                        Ordenar
                      </button>
                    </div>

                    {controlEditorTab === "order" ? (
                      selectedControls.length ? (
                        <div className="mt-3">
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={onDragSelectedControls}
                          >
                            <SortableContext items={selectedControlIds} strategy={verticalListSortingStrategy}>
                              <div className="space-y-2 overflow-x-hidden">
                                {selectedControls.map((c) => (
                                  <SortableRow
                                    key={c.id}
                                    id={c.id}
                                    title={`${c.name}${c.highlight ? " ★" : ""}`}
                                    subtitle={c.summary}
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs opacity-70">Selecciona al menos un control para ordenar.</p>
                      )
                    ) : (
                      <div className="mt-2 space-y-2 min-w-0">
                        {controls.map((c) => {
                          const checked = selectedControlIds.includes(c.id);
                          return (
                            <label key={c.id} className="flex gap-2 text-sm items-start min-w-0">
                              <input
                                type="checkbox"
                                checked={checked}
                                className="mt-1 h-5 w-5 shrink-0 rounded border-[#0f5d3a]"
                                style={{ accentColor: "#18b65d" }}
                                onChange={() => {
                                  setSelectedControlIds((prev) =>
                                    checked ? prev.filter((x) => x !== c.id) : [...prev, c.id]
                                  );
                                }}
                              />
                              <span className="min-w-0">
                                <span className="font-medium break-words">
                                  {c.name}
                                  {c.highlight ? " ★" : ""}
                                </span>
                                <span className="block text-xs opacity-70 break-words">{c.summary}</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div
            className="min-w-0 rounded-2xl border p-5 shadow-md backdrop-blur-sm overflow-hidden lg:h-full lg:overflow-y-auto"
            style={{ borderColor: panelBorder, background: panelBackground }}
          >
            <div className="mb-3 min-w-0 border-b pb-3" style={{ borderColor: "rgba(51,45,46,.10)" }}>
              <p className="text-sm font-semibold">4) Vista previa en vivo</p>
              <p className="text-xs opacity-70">Aquí ves los cambios al instante antes de compartir o exportar.</p>
            </div>
            <div
              className={[
                "min-w-0 max-w-full overflow-hidden",
                previewAnimNonce
                  ? previewAnimNonce % 2 === 0
                    ? "preview-reorder-a"
                    : "preview-reorder-b"
                  : "",
              ].join(" ")}
            >
              <Preview
                key={variant}
                company={COMPANY}
                client={selectedClient}
                title={customTitle}
                subtitle={customSubtitle}
                services={selectedServices} // ✅ ordenado por cat + orden interno
                controls={selectedControls}
                options={previewOptions}
              />
            </div>
          </div>
        </div>
      </div>

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
