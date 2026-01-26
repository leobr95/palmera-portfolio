import Image from "next/image";
import { useMemo } from "react";
import type { PortfolioPreviewProps } from "./portfolioPreviewTypes";
import { PORTFOLIO_IMAGES } from "@/lib/portafolio-images";
import type { RepresentativeClient, ServiceCategory } from "@/lib/mock-data";

function borderColor() {
  return "rgba(51,45,46,.14)";
}
function softShadow() {
  return "0 14px 40px rgba(0,0,0,.08)";
}
function logoDropShadow() {
  return "drop-shadow(0 10px 18px rgba(0,0,0,.22))";
}
function whiteLogoFilter() {
  return "brightness(0) invert(1) drop-shadow(0 10px 18px rgba(0,0,0,.22))";
}

type ServiceSection = {
  key: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  items: { id: string; name: string; summary: string }[];
};

// ✅ Constantes estables (NO se recrean por render)
const DEFAULT_ORDER: ServiceCategory[] = ["Plagas", "Higiene", "Especializados"];

const CATEGORY_META: Partial<Record<ServiceCategory, { subtitle: string; imageSrc: string }>> = {
  Plagas: {
    subtitle: "Control + prevención",
    imageSrc: PORTFOLIO_IMAGES.services.plagas.src,
  },
  Higiene: {
    subtitle: "Protocolos + desinfección",
    imageSrc: PORTFOLIO_IMAGES.services.higiene.src,
  },
  Especializados: {
    subtitle: "Complementarios",
    imageSrc: PORTFOLIO_IMAGES.services.especializados.src,
  },
};

export function PortfolioPreviewInfographic({
  company,
  client,
  title,
  subtitle,
  services,
  controls,
  options,
}: PortfolioPreviewProps) {
  const accent = options?.accentColor ?? company.colors.palmeraGreen;
  const logoSrc = options?.logoSrc ?? "/brand/palmera-junior.webp";
  const showClientMeta = options?.showClientMeta ?? true;
  const maxClients = options?.maxRepresentativeClients ?? 12;

  const repClients = (company.representativeClients ?? []) as RepresentativeClient[];

  const highlightControls = controls.filter((c) => c.highlight);
  const otherControls = controls.filter((c) => !c.highlight);

  // ✅ 1) Orden REAL de categorías según vienen los services (ya vienen ordenados desde el Builder)
  const catsFromServices = useMemo(() => {
    const seen = new Set<ServiceCategory>();
    const order: ServiceCategory[] = [];
    for (const s of services) {
      if (!seen.has(s.category)) {
        seen.add(s.category);
        order.push(s.category);
      }
    }
    return order;
  }, [services]);

  // ✅ 2) Base: si llega serviceCategoryOrder úsalo; si no, usa lo detectado desde services; si no hay nada, default
  const baseOrder = useMemo<ServiceCategory[]>(() => {
    const opt = options?.serviceCategoryOrder;
    if (opt?.length) return opt;
    if (catsFromServices.length) return catsFromServices;
    return DEFAULT_ORDER;
  }, [options?.serviceCategoryOrder, catsFromServices]);

  // ✅ 3) CatOrder final: baseOrder + categorías faltantes detectadas en services (para no perder ninguna)
  const catOrder = useMemo<ServiceCategory[]>(() => {
    const set = new Set<ServiceCategory>(baseOrder);
    const merged = [...baseOrder];
    for (const c of catsFromServices) {
      if (!set.has(c)) {
        set.add(c);
        merged.push(c);
      }
    }
    return merged;
  }, [baseOrder, catsFromServices]);

  // ✅ 4) Agrupar services por categoría respetando el ORDEN que trae "services" (orden interno)
  const servicesByCategory = useMemo(() => {
    const map: Record<string, { id: string; name: string; summary: string }[]> = {};
    for (const s of services) {
      (map[s.category] ||= []).push({ id: s.id, name: s.name, summary: s.summary });
    }
    return map;
  }, [services]);

  const sections: ServiceSection[] = useMemo(() => {
    return catOrder
      .map((cat) => {
        const items = servicesByCategory[cat] ?? [];
        if (!items.length) return null;

        return {
          key: String(cat),
          title: String(cat),
          subtitle: CATEGORY_META[cat]?.subtitle ?? "",
          imageSrc: CATEGORY_META[cat]?.imageSrc ?? PORTFOLIO_IMAGES.services.plagas.src,
          items,
        };
      })
      .filter(Boolean) as ServiceSection[];
  }, [catOrder, servicesByCategory]);

  return (
    <div className="space-y-8">
      {/* ================= COVER ================= */}
      <section
        className="overflow-hidden rounded-3xl border bg-white"
        style={{ borderColor: borderColor(), boxShadow: softShadow() }}
      >
        {/* ================= HERO ================= */}
        <div className="relative">
          <div className="relative h-[340px] w-full">
            <Image
              src={PORTFOLIO_IMAGES.hero.src}
              alt={PORTFOLIO_IMAGES.hero.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>

          {/* Overlay pro */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(900px 420px at 12% 28%, rgba(0,172,75,.35) 0%, rgba(0,0,0,0) 62%), radial-gradient(700px 340px at 75% 20%, rgba(255,255,255,.10) 0%, rgba(0,0,0,0) 60%), linear-gradient(90deg, rgba(51,45,46,.94) 0%, rgba(51,45,46,.84) 45%, rgba(51,45,46,.10) 100%)",
            }}
          />

          {/* Contenido */}
          <div className="absolute inset-0 p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="max-w-[72%]">
                <p className="mt-3 text-xs uppercase tracking-wider text-white/80">{company.name}</p>

                <h2 className="mt-2 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  {title}
                </h2>

                <p className="mt-3 text-xl text-white/90 sm:text-2xl">
                  {subtitle} <span className="font-semibold">{client.name}</span>
                </p>

                {showClientMeta && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/90">
                    {client.industry ? (
                      <span className="rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,.12)" }}>
                        {client.industry}
                      </span>
                    ) : null}

                    {client.city ? (
                      <span className="rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,.12)" }}>
                        {client.city}
                      </span>
                    ) : null}

                    {client.logoSrc ? (
                      <span
                        className="ml-1 inline-flex items-center gap-2 rounded-full px-3 py-1"
                        style={{ background: "rgba(255,255,255,.12)" }}
                      >
                        <span className="opacity-90">Cliente:</span>
                        <Image
                          src={client.logoSrc}
                          alt={`${client.name} logo`}
                          width={260}
                          height={80}
                          className="h-[34px] w-auto object-contain"
                          style={{ filter: logoDropShadow() }}
                        />
                      </span>
                    ) : null}
                  </div>
                )}

                <div className="mt-5 h-[3px] w-28 rounded-full" style={{ background: accent }} />
                <p className="mt-2 text-xs text-white/75">{company.supportLine}</p>
              </div>

              {/* Logos */}
              <div className="flex flex-col items-end gap-2 text-right">
                <Image
                  src={logoSrc}
                  alt="Palmera Junior"
                  width={260}
                  height={96}
                  priority
                  className="h-auto w-[220px]"
                  style={{ filter: logoDropShadow() }}
                />

                <p className="text-[11px] uppercase tracking-wider text-white/70">Una empresa de</p>

                <Image
                  src="/brand/anticimex.png"
                  alt="Anticimex"
                  width={220}
                  height={56}
                  priority
                  className="h-auto w-[200px]"
                  style={{ filter: whiteLogoFilter() }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= EXPERIENCE ================= */}
        <div className="p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold" style={{ color: company.colors.ink }}>
                Trayectoria y experiencia
              </h3>
              <p className="mt-1 text-sm opacity-80">
                Somos Palmera Junior: equipo local con respaldo Anticimex, enfocado en prevención, evidencias y continuidad operativa.
              </p>
            </div>
            <span className="inline-flex rounded-full px-3 py-1 text-xs" style={{ background: company.colors.muted }}>
              Evidencias + plan de acción
            </span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {/* Palmera */}
            <div className="overflow-hidden rounded-3xl border bg-white" style={{ borderColor: borderColor() }}>
              <div className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={logoSrc}
                      alt="Palmera Junior"
                      width={170}
                      height={52}
                      className="h-auto w-[150px]"
                      style={{ filter: logoDropShadow() }}
                    />
                    <div className="h-10 w-[1px]" style={{ background: "rgba(51,45,46,.10)" }} />
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Operación local</span>
                  </div>
                  <div className="h-[3px] w-16 rounded-full" style={{ background: accent }} />
                </div>

                <p className="mt-4 text-sm opacity-85">
                  Enfoque preventivo (MIP) con ejecución controlada, evidencias y recomendaciones para reducir riesgos y sostener auditorías.
                </p>

                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span style={{ color: accent }} className="font-bold">✓</span>
                    <span className="opacity-85">Control de plagas con foco en prevención y buenas prácticas.</span>
                  </li>
                  <li className="flex gap-2">
                    <span style={{ color: accent }} className="font-bold">✓</span>
                    <span className="opacity-85">Procedimientos trazables: visita, diagnóstico, plan, ejecución y seguimiento.</span>
                  </li>
                  <li className="flex gap-2">
                    <span style={{ color: accent }} className="font-bold">✓</span>
                    <span className="opacity-85">Programas alineados a requerimientos sanitarios y de calidad (según alcance).</span>
                  </li>
                </ul>

                <div className="mt-5 rounded-2xl p-4" style={{ background: company.colors.muted }}>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-70">En la práctica</p>
                  <p className="mt-1 text-sm opacity-85">
                    Menos incidentes, mejor control del riesgo y evidencia clara para áreas de SST, Calidad y Operaciones.
                  </p>
                </div>
              </div>
            </div>

            {/* Anticimex */}
            <div className="overflow-hidden rounded-3xl border bg-white" style={{ borderColor: borderColor() }}>
              <div className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/brand/anticimex.png"
                      alt="Anticimex"
                      width={180}
                      height={70}
                      className="h-auto w-[210px]"
                    />
                    <div className="h-10 w-[1px]" style={{ background: "rgba(51,45,46,.10)" }} />
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Respaldo global</span>
                  </div>
                  <div className="h-[3px] w-16 rounded-full" style={{ background: company.colors.ink }} />
                </div>

                <p className="mt-4 text-sm opacity-85">
                  Anticimex impulsa un enfoque moderno: prevención antes que reacción, estándares, mejores prácticas y tecnología aplicada al control de riesgo.
                </p>

                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="font-bold" style={{ color: company.colors.ink }}>✓</span>
                    <span className="opacity-85">Metodologías y know-how internacional aplicados a la operación local.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold" style={{ color: company.colors.ink }}>✓</span>
                    <span className="opacity-85">Innovación: monitoreo y soluciones inteligentes (p.ej. SMART, según disponibilidad).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold" style={{ color: company.colors.ink }}>✓</span>
                    <span className="opacity-85">Enfoque eco-friendly y control de riesgo con evidencia.</span>
                  </li>
                </ul>

                <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: "rgba(51,45,46,.12)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Resultado</p>
                  <p className="mt-1 text-sm opacity-85">
                    Un servicio más consistente, medible y preparado para requerimientos exigentes de industria y auditoría.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      {sections.length > 0 && (
        <section
          className="overflow-hidden rounded-3xl border bg-white"
          style={{ borderColor: borderColor(), boxShadow: softShadow() }}
        >
          <div className="p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider opacity-70">Enfoque recomendado</p>
                <h3 className="text-xl font-semibold" style={{ color: company.colors.ink }}>
                  Servicios escogidos para ti
                </h3>
                <p className="mt-1 text-sm opacity-80">
                  Seleccionamos los servicios que más pueden <span className="font-semibold">impactar tu negocio</span>.
                  <span className="block mt-1 text-xs opacity-70">
                    Para ver nuestros otros servicios y variantes, revisa el portafolio completo.
                  </span>
                </p>
              </div>
              <div className="h-[3px] w-24 rounded-full" style={{ background: accent }} />
            </div>

            <div
              className={`mt-5 grid gap-4 ${
                sections.length === 1 ? "lg:grid-cols-1" : sections.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"
              }`}
            >
              {sections.map((sec) => (
                <div key={sec.key} className="overflow-hidden rounded-3xl border" style={{ borderColor: borderColor() }}>
                  <div className="relative h-[150px]">
                    <Image
                      src={sec.imageSrc}
                      alt={sec.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.70) 100%)" }}
                    />
                    <div className="absolute inset-0 flex items-end justify-between p-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{sec.title}</p>
                        <p className="text-xs text-white/80">{sec.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="space-y-2">
                      {sec.items.map((s) => (
                        <div
                          key={s.id}
                          className="rounded-2xl border bg-white p-3"
                          style={{ borderColor: "rgba(51,45,46,.12)" }}
                        >
                          <p className="text-sm font-semibold">{s.name}</p>
                          <p className="mt-1 text-xs opacity-75">{s.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= CLIENTS ================= */}
      <section
        className="overflow-hidden rounded-3xl border bg-white"
        style={{ borderColor: borderColor(), boxShadow: softShadow() }}
      >
        <div className="p-7">
          {repClients.length > 0 && (
            <div className="mt-2 rounded-3xl bg-white">
              <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
                <div>
                  <p className="text-sm opacity-70">Con la confianza de</p>
                  <p className="mt-1 text-3xl font-semibold" style={{ color: company.colors.ink }}>
                    Grandes marcas
                  </p>
                  <p className="mt-3 text-sm opacity-80">
                    Clientes representativos que han confiado en nuestro trabajo (según alcance).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
                  {repClients.slice(0, maxClients).map((x) => (
                    <div key={x.id} className="flex items-center justify-center">
                      <div className="relative w-full max-w-[240px] rounded-2xl" style={{ height: 86 }}>
                        {x.logoSrc ? (
                          <Image
                            src={x.logoSrc}
                            alt={x.name}
                            fill
                            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 220px"
                            className="object-contain"
                            style={{
                              padding: "10px",
                              filter: "drop-shadow(0 10px 18px rgba(0,0,0,.14))",
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-base font-semibold opacity-70">{x.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= CONTROLS + CERTS + COVERAGE + SOCIALS ================= */}
      <section
        className="overflow-hidden rounded-3xl border bg-white"
        style={{ borderColor: borderColor(), boxShadow: softShadow() }}
      >
        <div className="p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-70">Diferenciales</p>
              <h3 className="text-xl font-semibold" style={{ color: company.colors.ink }}>
                Controles ofrecidos
              </h3>
              <p className="mt-1 text-sm opacity-80">
                Énfasis en controles representativos, diferenciales e innovadores (con evidencia).
              </p>
            </div>
            <div className="h-[3px] w-24 rounded-full" style={{ background: accent }} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border" style={{ borderColor: borderColor() }}>
              <div className="relative h-[160px]">
                <Image
                  src={PORTFOLIO_IMAGES.mip.src}
                  alt={PORTFOLIO_IMAGES.mip.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, rgba(0,0,0,.05) 0%, rgba(0,0,0,.65) 100%)" }}
                />
                <div className="absolute inset-0 flex items-end p-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Enfoque MIP</p>
                    <p className="mt-1 text-xs text-white/85">Plan preventivo con evidencia y acciones correctivas.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border" style={{ borderColor: borderColor() }}>
              <div className="relative h-[160px]">
                <Image
                  src={PORTFOLIO_IMAGES.smart.src}
                  alt={PORTFOLIO_IMAGES.smart.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, rgba(0,0,0,.05) 0%, rgba(0,0,0,.65) 100%)" }}
                />
                <div className="absolute inset-0 flex items-end p-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Monitoreo / SMART</p>
                    <p className="mt-1 text-xs text-white/85">Seguimiento digital opcional y reacción oportuna.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {highlightControls.map((c) => (
              <div key={c.id} className="rounded-3xl border bg-white p-4" style={{ borderColor: borderColor() }}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">
                    {c.name} <span style={{ color: accent }}>★</span>
                  </p>
                  <span className="rounded-full px-2 py-1 text-[11px]" style={{ background: company.colors.muted }}>
                    Diferencial
                  </span>
                </div>
                <p className="mt-2 text-xs opacity-80">{c.summary}</p>
                <div className="mt-3 h-[2px] w-16 rounded-full" style={{ background: accent }} />
              </div>
            ))}

            {otherControls.map((c) => (
              <div key={c.id} className="rounded-3xl border bg-white p-4" style={{ borderColor: borderColor() }}>
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="mt-2 text-xs opacity-80">{c.summary}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border bg-white p-5" style={{ borderColor: borderColor() }}>
              <h4 className="text-base font-semibold" style={{ color: company.colors.ink }}>
                Certificaciones y respaldos
              </h4>
              <p className="mt-1 text-sm opacity-80">Soporte a requerimientos de auditoría y cumplimiento (según alcance).</p>

              <div className="mt-4 grid gap-3">
                {company.certifications.map((cert) => (
                  <div key={cert.id} className="rounded-2xl border p-3" style={{ borderColor: "rgba(51,45,46,.12)" }}>
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white"
                        style={{ border: `1px solid ${borderColor()}` }}
                      >
                        {cert.logoSrc ? (
                          <Image
                            src={cert.logoSrc}
                            alt={cert.name}
                            width={32}
                            height={32}
                            className="h-8 w-8 object-contain"
                          />
                        ) : (
                          <span className="text-xs font-semibold">{cert.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{cert.name}</p>
                        <p className="mt-1 text-xs opacity-80">{cert.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border bg-white" style={{ borderColor: borderColor() }}>
              <div className="relative h-[140px]">
                <Image
                  src={PORTFOLIO_IMAGES.coverage.src}
                  alt={PORTFOLIO_IMAGES.coverage.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(90deg, rgba(51,45,46,.75) 0%, rgba(51,45,46,.10) 100%)" }}
                />
                <div className="absolute inset-0 flex items-end p-5">
                  <div>
                    <p className="text-base font-semibold text-white">Cobertura</p>
                    <p className="mt-1 text-xs text-white/85">Operación en múltiples ciudades (según necesidad).</p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {company.coverage.map((city) => (
                    <span key={city} className="rounded-full px-3 py-1 text-xs" style={{ background: company.colors.muted }}>
                      {city}
                    </span>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl p-4" style={{ background: company.colors.muted }}>
                  <p className="text-sm font-semibold" style={{ color: company.colors.ink }}>
                    Siguiente paso
                  </p>
                  <p className="mt-1 text-xs opacity-80">
                    Agendemos una visita de diagnóstico y definimos plan preventivo, evidencias y cronograma.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {company.socials.slice(0, 3).map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:-translate-y-[1px] active:translate-y-0"
                        style={{ background: accent }}
                      >
                        {s.label}: {s.value}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t pt-4" style={{ borderColor: "rgba(51,45,46,.12)" }}>
                  <p className="text-sm font-semibold" style={{ color: company.colors.ink }}>
                    Redes / contacto
                  </p>
                  <div className="mt-2 grid gap-2">
                    {company.socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm opacity-85 hover:opacity-100"
                      >
                        <span className="font-semibold">{s.label}:</span> {s.value}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <Image
                    src={logoSrc}
                    alt="Palmera Junior"
                    width={160}
                    height={50}
                    className="h-auto w-[140px]"
                    style={{ filter: logoDropShadow() }}
                  />
                  <Image
                    src="/brand/anticimex.png"
                    alt="Anticimex"
                    width={160}
                    height={42}
                    className="h-auto w-[140px]"
                    style={{ filter: whiteLogoFilter() }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border bg-white p-5" style={{ borderColor: borderColor() }}>
            <p className="text-sm font-semibold" style={{ color: company.colors.ink }}>
              Portafolio personalizado para {client.name}
            </p>
            <p className="mt-1 text-xs opacity-75">
              {company.name} • {company.supportLine}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
