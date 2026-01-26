"use client";

import React, { useEffect, useMemo, useState } from "react";
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

import type { Client, Control, Service, ServiceCategory } from "@/lib/mock-data";
import { COMPANY } from "@/lib/mock-data";
import { getClients, getControls, getServices } from "@/lib/mock-api";

import { PortfolioPdf } from "@/components/pdf/PortfolioPdf";
import type { DesignVariant } from "@/components/pdf/PortfolioPdf";

import { PortfolioPreviewExecutive } from "@/components/previews/PortfolioPreviewExecutive";
import { PortfolioPreviewSplit } from "@/components/previews/PortfolioPreviewSplit";
import { PortfolioPreviewMinimal } from "@/components/previews/PortfolioPreviewMinimal";
import { PortfolioPreviewInfographic } from "@/components/previews/PortfolioPreviewInfographic";

const INITIAL_CLIENT_ID = "colanta";

// (opcional) para un orden base bonito cuando se inicializa por primera vez
const DEFAULT_CAT_ORDER: ServiceCategory[] = ["Plagas", "Higiene", "Especializados"];

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

type ServiceOrderState = {
  categoryOrder: ServiceCategory[];
  serviceOrderByCategory: Record<string, string[]>; // cat -> serviceIds
  collapsedCats: Record<string, boolean>;
};

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

/** ✅ Item (servicio/control) sortable */
function SortableRow({
  id,
  title,
  subtitle,
}: {
  id: string;
  title: string;
  subtitle?: string;
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
  const [variant, setVariant] = useState<DesignVariant>("executive");

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

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === clientId) ?? null,
    [clients, clientId]
  );

  const servicesByCat = useMemo(() => groupByCategory(services), [services]);

  const serviceById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);
  const controlById = useMemo(() => new Map(controls.map((c) => [c.id, c])), [controls]);

  // ✅ ids planos (orden final) => URL/PDF/Preview
  const selectedServiceIds = useMemo(() => {
    return svcOrder.categoryOrder.flatMap((cat) => svcOrder.serviceOrderByCategory[cat] ?? []);
  }, [svcOrder.categoryOrder, svcOrder.serviceOrderByCategory]);

  const selectedServiceIdSet = useMemo(() => new Set(selectedServiceIds), [selectedServiceIds]);

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

  const handleClientChange = (nextClientId: string) => {
    setClientId(nextClientId);
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
      accentColor: COMPANY.colors.palmeraGreen,
      showAnticimexBadge: true,
      showClientMeta: true,
      maxRepresentativeClients: 7,
    }),
    []
  );

  const previewMap: Record<DesignVariant, React.ComponentType<PreviewProps>> = {
    executive: PortfolioPreviewExecutive,
    split: PortfolioPreviewSplit,
    minimal: PortfolioPreviewMinimal,
    infographic: PortfolioPreviewInfographic,
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

  return (
    <div className="min-h-screen w-full" style={{ background: COMPANY.colors.muted }}>
      {/* FULL width */}
      <div className="w-full px-4 py-8 2xl:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold" style={{ color: COMPANY.colors.ink }}>
              Builder — Portafolio por cliente
            </h1>
            <p className="text-sm opacity-80">
              Datos mock. Selecciona, ordena por categorías y genera PDF o link.
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
                  services={selectedServices} // ✅ ya ordenado (categorías + servicios)
                  controls={selectedControls} // ✅ ordenado
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

        {/* 2 columnas */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(420px,560px)_minmax(0,1fr)]">
          {/* Builder */}
          <div
            className="min-w-0 rounded-2xl bg-white p-5 shadow-md border overflow-x-hidden"
            style={{ borderColor: "rgba(51,45,46,.12)" }}
          >
            <div className="grid gap-5 min-w-0">
              <div className="grid gap-2 sm:grid-cols-2 min-w-0">
                <div className="min-w-0">
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

                <div className="min-w-0">
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

              {/* ✅ ORDEN POR CATEGORÍAS + SERVICIOS */}
              <div className="border-t pt-4 min-w-0" style={{ borderColor: "rgba(51,45,46,.10)" }}>
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Orden de servicios seleccionados</p>
                    <p className="text-xs opacity-70">
                      Primero ordena categorías, luego ordena servicios dentro de cada categoría.
                    </p>
                  </div>
                  <span className="text-xs opacity-70">{selectedServiceIds.length}</span>
                </div>

                {selectedServiceIds.length ? (
                  <div className="mt-3">
                    {/* Drag categorías */}
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

                            // por si acaso (si queda una cat vacía)
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
                                    {/* Drag servicios dentro de esta categoría */}
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
                )}
              </div>

              {/* ✅ ORDENAR CONTROLES (plano) */}
              <div className="border-t pt-4 min-w-0" style={{ borderColor: "rgba(51,45,46,.10)" }}>
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Orden de controles seleccionados</p>
                    <p className="text-xs opacity-70">Arrastra por el ícono ≡ para priorizar controles.</p>
                  </div>
                  <span className="text-xs opacity-70">{selectedControlIds.length}</span>
                </div>

                {selectedControls.length ? (
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
                )}
              </div>

              {/* ✅ Selección servicios */}
              <div className="border-t pt-4 min-w-0" style={{ borderColor: "rgba(51,45,46,.10)" }}>
                <p className="text-sm font-semibold">Servicios (selección)</p>

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
                                className="mt-1 shrink-0"
                                onChange={() => toggleServiceSelection(s)}
                              />
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
              </div>

              {/* ✅ Selección controles */}
              <div className="border-t pt-4 min-w-0" style={{ borderColor: "rgba(51,45,46,.10)" }}>
                <p className="text-sm font-semibold">Controles / diferenciales (selección)</p>

                <div className="mt-2 space-y-2 min-w-0">
                  {controls.map((c) => {
                    const checked = selectedControlIds.includes(c.id);
                    return (
                      <label key={c.id} className="flex gap-2 text-sm items-start min-w-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          className="mt-1 shrink-0"
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
              </div>
            </div>
          </div>

          {/* Preview */}
          <div
            className="min-w-0 rounded-2xl bg-white p-5 shadow-md border overflow-hidden"
            style={{ borderColor: "rgba(51,45,46,.12)" }}
          >
            <div className="min-w-0 max-w-full overflow-hidden">
              <Preview
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
    </div>
  );
}
