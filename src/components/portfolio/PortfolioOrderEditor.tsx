"use client";

import React, { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  restrictToFirstScrollableAncestor,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";

import type {
  RepresentativeClient,
  Service,
  ServiceCategory,
} from "@/lib/mock-data";

type Props = {
  // Servicios
  categories: ServiceCategory[];
  categoryOrder: ServiceCategory[];
  setCategoryOrder: (next: ServiceCategory[]) => void;

  servicesByCategory: Record<string, Service[]>;
  serviceOrderByCategory: Record<string, string[]>; // cat -> serviceIds
  setServiceOrderByCategory: (next: Record<string, string[]>) => void;

  collapsedCats: Record<string, boolean>;
  setCollapsedCats: (next: Record<string, boolean>) => void;

  // Certs
  certs: Array<{ id: string; name: string }>;
  certOrder: string[];
  setCertOrder: (next: string[]) => void;

  // Cobertura (string list)
  coverage: string[];
  coverageOrder: string[];
  setCoverageOrder: (next: string[]) => void;

  // Clientes representativos
  repClients: RepresentativeClient[];
  repClientOrder: string[];
  setRepClientOrder: (next: string[]) => void;
};

function arrayMove<T>(arr: T[], from: number, to: number) {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function Grip() {
  return (
    <span
      className="select-none text-lg leading-none opacity-60"
      title="Arrastrar"
    >
      ≡
    </span>
  );
}

function ToggleButton({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="shrink-0 rounded-lg border px-2 py-1 text-xs opacity-80 hover:opacity-100"
      title={collapsed ? "Expandir" : "Colapsar"}
    >
      {collapsed ? "+" : "–"}
    </button>
  );
}

function SortableRow({
  id,
  title,
  subtitle,
  right,
  isHeader,
  isCollapsed,
  onToggle,
}: {
  id: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  isHeader?: boolean;
  isCollapsed?: boolean;
  onToggle?: () => void;
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

  // ✅ NO subir zIndex a 50 (eso hace que “se monte” sobre el preview)
  // ✅ Mantenerlo bajo + el contenedor usa overflow-hidden/isolate
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    position: "relative",
    zIndex: isDragging ? 5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "flex w-full flex-col gap-2 rounded-xl border bg-white p-3",
        "sm:flex-row sm:items-center sm:gap-3",
        isHeader ? "font-semibold" : "",
      ].join(" ")}
    >
      {/* Left content */}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start gap-2 sm:items-center">
          {onToggle ? (
            <ToggleButton
              collapsed={Boolean(isCollapsed)}
              onToggle={onToggle}
            />
          ) : null}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium break-words sm:truncate">
              {title}
            </p>
            {subtitle ? (
              <p className="mt-0.5 text-xs opacity-70 break-words sm:truncate">
                {subtitle}
              </p>
            ) : null}
          </div>

          {right ? (
            <div className="shrink-0 text-xs opacity-70">{right}</div>
          ) : null}
        </div>
      </div>

      {/* Handle */}
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className={[
          "shrink-0 self-end sm:self-auto",
          "cursor-grab rounded-lg px-2 py-1",
          "hover:bg-black/5 active:cursor-grabbing",
        ].join(" ")}
        // ✅ importante en mobile/trackpad para que no “se pierda” el drag
        style={{ touchAction: "none" }}
        aria-label="Arrastrar"
      >
        <Grip />
      </div>
    </div>
  );
}

export function PortfolioOrderEditor({
  categories,
  categoryOrder,
  setCategoryOrder,
  servicesByCategory,
  serviceOrderByCategory,
  setServiceOrderByCategory,
  collapsedCats,
  setCollapsedCats,
  certs,
  certOrder,
  setCertOrder,
  coverage,
  coverageOrder,
  setCoverageOrder,
  repClients,
  repClientOrder,
  setRepClientOrder,
}: Props) {
  // ✅ Sensors (mejor UX en mouse/trackpad)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // ✅ usar categories/coverage como fallback => elimina warnings de “unused”
  const catsToRender = useMemo<ServiceCategory[]>(
    () => (categoryOrder?.length ? categoryOrder : categories),
    [categoryOrder, categories]
  );

  const catIds = useMemo(() => catsToRender.map(String), [catsToRender]);

  const coverageToRender = useMemo(
    () => (coverageOrder?.length ? coverageOrder : coverage),
    [coverageOrder, coverage]
  );

  function onDragCategories(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const from = catIds.indexOf(String(active.id));
    const to = catIds.indexOf(String(over.id));
    if (from < 0 || to < 0) return;

    setCategoryOrder(arrayMove(catsToRender, from, to));
  }

  function onDragServices(cat: ServiceCategory, e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const services = servicesByCategory[cat] ?? [];
    const configuredIds = serviceOrderByCategory[cat] ?? [];
    const baseIds = configuredIds.length ? configuredIds : services.map((s) => s.id);

    const from = baseIds.indexOf(String(active.id));
    const to = baseIds.indexOf(String(over.id));
    if (from < 0 || to < 0) return;

    setServiceOrderByCategory({
      ...serviceOrderByCategory,
      [cat]: arrayMove(baseIds, from, to),
    });
  }

  function onDragSimple(
    ids: string[],
    setIds: (next: string[]) => void,
    e: DragEndEvent
  ) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;

    setIds(arrayMove(ids, from, to));
  }

  // ✅ card con stacking context + recorte
  // (esto evita que los items “se monten” encima del preview)
  const cardCls =
    "relative isolate overflow-hidden rounded-2xl border bg-white p-4 shadow-sm";
  const titleCls = "text-sm font-semibold opacity-90";

  // ✅ listas con scroll => restrictToFirstScrollableAncestor funciona bien
  const scrollListCls = "mt-2 max-h-[70vh] overflow-auto pr-1 space-y-2";

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-2">
      {/* Servicios */}
      <div className={cardCls} style={{ borderColor: "rgba(51,45,46,.12)" }}>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className={titleCls}>Ordenar servicios</div>
            <div className="text-xs opacity-70">
              Arrastra categorías o servicios. Colapsa para mover más rápido.
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
          onDragEnd={onDragCategories}
        >
          <SortableContext items={catIds} strategy={verticalListSortingStrategy}>
            <div className={scrollListCls}>
              {catsToRender.map((cat) => {
                const collapsed = Boolean(collapsedCats[cat]);
                const services = servicesByCategory[cat] ?? [];

                const configuredIds = serviceOrderByCategory[cat] ?? [];
                const baseIds = configuredIds.length
                  ? configuredIds
                  : services.map((s) => s.id);

                const orderedServices = baseIds
                  .map((id) => services.find((s) => s.id === id))
                  .filter(Boolean) as Service[];

                return (
                  <div key={cat} className="space-y-2">
                    <SortableRow
                      id={String(cat)}
                      isHeader
                      title={cat}
                      right={<span>({services.length})</span>}
                      isCollapsed={collapsed}
                      onToggle={() =>
                        setCollapsedCats({ ...collapsedCats, [cat]: !collapsed })
                      }
                    />

                    {!collapsed ? (
                      <div
                        className="ml-3 space-y-2 border-l pl-3"
                        style={{ borderColor: "rgba(51,45,46,.10)" }}
                      >
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          modifiers={[
                            restrictToVerticalAxis,
                            restrictToFirstScrollableAncestor,
                          ]}
                          onDragEnd={(e) => onDragServices(cat, e)}
                        >
                          <SortableContext
                            items={orderedServices.map((s) => s.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-2">
                              {orderedServices.map((s) => (
                                <SortableRow
                                  key={s.id}
                                  id={s.id}
                                  title={s.name}
                                  subtitle={s.summary}
                                />
                              ))}
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

      {/* Otros bloques */}
      <div className="grid gap-4">
        {/* Clientes */}
        <div className={cardCls} style={{ borderColor: "rgba(51,45,46,.12)" }}>
          <div className="mb-3">
            <div className={titleCls}>Ordenar clientes (Grandes marcas)</div>
            <div className="text-xs opacity-70">
              Arrastra para definir el orden de logos.
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
            onDragEnd={(e) =>
              onDragSimple(repClientOrder, setRepClientOrder, e)
            }
          >
            <SortableContext
              items={repClientOrder}
              strategy={verticalListSortingStrategy}
            >
              <div className="max-h-[320px] overflow-auto pr-1 space-y-2">
                {repClientOrder.map((id) => {
                  const c = repClients.find((x) => x.id === id);
                  if (!c) return null;

                  return (
                    <SortableRow
                      key={id}
                      id={id}
                      title={c.name}
                      subtitle={c.logoSrc ? c.logoSrc : "Sin logo"}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Certificaciones */}
        <div className={cardCls} style={{ borderColor: "rgba(51,45,46,.12)" }}>
          <div className="mb-3">
            <div className={titleCls}>Ordenar certificaciones</div>
            <div className="text-xs opacity-70">
              Arrastra para priorizar certificaciones.
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
            onDragEnd={(e) => onDragSimple(certOrder, setCertOrder, e)}
          >
            <SortableContext items={certOrder} strategy={verticalListSortingStrategy}>
              <div className="max-h-[320px] overflow-auto pr-1 space-y-2">
                {certOrder.map((id) => {
                  const cert = certs.find((x) => x.id === id);
                  if (!cert) return null;
                  return <SortableRow key={id} id={id} title={cert.name} />;
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Cobertura */}
        <div className={cardCls} style={{ borderColor: "rgba(51,45,46,.12)" }}>
          <div className="mb-3">
            <div className={titleCls}>Ordenar cobertura</div>
            <div className="text-xs opacity-70">
              Arrastra ciudades para definir el orden.
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
            onDragEnd={(e) =>
              onDragSimple(coverageToRender, setCoverageOrder, e)
            }
          >
            <SortableContext
              items={coverageToRender}
              strategy={verticalListSortingStrategy}
            >
              <div className="max-h-[320px] overflow-auto pr-1 space-y-2">
                {coverageToRender.map((city) => (
                  <SortableRow key={city} id={city} title={city} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
