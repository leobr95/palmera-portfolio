import Image from "next/image";
import type { PortfolioPreviewProps } from "./portfolioPreviewTypes";

export function PortfolioPreviewExecutive({
  company,
  client,
  title,
  subtitle,
  services,
  controls,
  options,
}: PortfolioPreviewProps) {
  const accent = options?.accentColor ?? company.colors.palmeraGreen;
  const showLogo = options?.showLogo ?? true;
  const showAnticimexBadge = options?.showAnticimexBadge ?? true;
  const showClientMeta = options?.showClientMeta ?? true;
  const logoSrc = options?.logoSrc ?? "/brand/palmera-junior.webp";
  const maxClients = options?.maxRepresentativeClients ?? 7;

  const copy = {
    experienceIntro:
      options?.copy?.experienceIntro ??
      "Operación con enfoque en manejo integrado de plagas, orientada a prevención, cumplimiento y continuidad operativa.",
    industryFocus:
      options?.copy?.industryFocus ??
      "Propuesta ajustable por sector (alimentos, retail, industrial, residencial), con plan preventivo y evidencias.",
    coverageIntro:
      options?.copy?.coverageIntro ??
      "Atención y operación en múltiples ciudades de Colombia (según necesidad del cliente).",
  };

  const highlightControls = controls.filter((c) => c.highlight);
  const otherControls = controls.filter((c) => !c.highlight);

  return (
    <div className="space-y-8">
      {/* Cover */}
      <section
        className="rounded-3xl p-6 shadow-sm"
        style={{ background: company.colors.ink, color: company.colors.paper }}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm opacity-80">{company.name}</p>
            <h2 className="mt-2 text-3xl font-semibold">{title}</h2>
            <p className="mt-2 text-lg opacity-90">
              {subtitle} <span className="font-semibold">{client.name}</span>
            </p>

            {showClientMeta && (
              <div className="mt-4 flex flex-wrap gap-2 text-xs opacity-90">
                <span className="rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,.10)" }}>
                  {client.industry}
                </span>
                {client.city && (
                  <span className="rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,.10)" }}>
                    {client.city}
                  </span>
                )}
              </div>
            )}

            <div className="mt-5 h-[3px] w-24 rounded-full" style={{ background: accent }} />
            <p className="mt-4 text-sm opacity-80">{company.tagline}</p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            {showLogo && (
              <div className="rounded-2xl bg-white/10 p-3">
                <Image
                  src={logoSrc}
                  alt="Palmera Junior"
                  width={220}
                  height={80}
                  priority
                  className="h-auto w-[200px]"
                />
              </div>
            )}

            {showAnticimexBadge && (
              <div className="inline-flex items-center gap-2 rounded-2xl px-3 py-2"
                   style={{ background: accent }}>
                <span className="text-sm font-semibold">Anticimex</span>
              </div>
            )}

            <p className="text-xs opacity-80">{company.supportLine}</p>
          </div>
        </div>
      </section>

      {/* KPI Row */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: "rgba(51,45,46,.12)" }}>
          <p className="text-xs opacity-70">Servicios seleccionados</p>
          <p className="mt-1 text-2xl font-semibold" style={{ color: company.colors.ink }}>{services.length}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: "rgba(51,45,46,.12)" }}>
          <p className="text-xs opacity-70">Controles / diferenciales</p>
          <p className="mt-1 text-2xl font-semibold" style={{ color: company.colors.ink }}>{controls.length}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: "rgba(51,45,46,.12)" }}>
          <p className="text-xs opacity-70">Cobertura</p>
          <p className="mt-1 text-2xl font-semibold" style={{ color: company.colors.ink }}>{company.coverage.length}</p>
        </div>
      </section>

      {/* Trayectoria */}
      <section className="rounded-3xl border bg-white p-5 shadow-sm" style={{ borderColor: "rgba(51,45,46,.12)" }}>
        <h3 className="text-lg font-semibold" style={{ color: company.colors.ink }}>Trayectoria y experiencia</h3>
        <p className="mt-2 text-sm opacity-80">{copy.experienceIntro}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(51,45,46,.10)" }}>
            <p className="text-sm font-semibold">Clientes representativos</p>
            <ul className="mt-2 list-disc pl-5 text-sm opacity-85">
  {company.representativeClients.slice(0, maxClients).map((x) => (
    <li key={x.id}>{x.name}</li>
  ))}
</ul>
          </div>
          <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(51,45,46,.10)" }}>
            <p className="text-sm font-semibold">Enfoque por industria</p>
            <p className="mt-2 text-sm opacity-85">{copy.industryFocus}</p>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="rounded-3xl border bg-white p-5 shadow-sm" style={{ borderColor: "rgba(51,45,46,.12)" }}>
        <h3 className="text-lg font-semibold" style={{ color: company.colors.ink }}>Servicios ofrecidos</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <div key={s.id} className="rounded-2xl border p-4" style={{ borderColor: "rgba(51,45,46,.10)" }}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold">{s.name}</p>
                <span className="rounded-full px-2 py-1 text-xs" style={{ background: company.colors.muted }}>
                  {s.category}
                </span>
              </div>
              <p className="mt-1 text-xs opacity-75">{s.summary}</p>
              <div className="mt-3 h-[2px] w-14 rounded-full" style={{ background: accent }} />
            </div>
          ))}
        </div>
      </section>

      {/* Controles */}
      <section className="rounded-3xl border bg-white p-5 shadow-sm" style={{ borderColor: "rgba(51,45,46,.12)" }}>
        <h3 className="text-lg font-semibold" style={{ color: company.colors.ink }}>Controles y diferenciales</h3>

        {highlightControls.length > 0 && (
          <div className="mt-3 rounded-2xl border p-4" style={{ borderColor: "rgba(51,45,46,.10)" }}>
            <p className="text-sm font-semibold" style={{ color: company.colors.ink }}>
              Diferenciales destacados
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {highlightControls.map((c) => (
                <div key={c.id} className="rounded-2xl border p-4" style={{ borderColor: "rgba(51,45,46,.10)" }}>
                  <p className="text-sm font-semibold">
                    {c.name} <span style={{ color: accent }}>★</span>
                  </p>
                  <p className="mt-1 text-xs opacity-75">{c.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {otherControls.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {otherControls.map((c) => (
              <div key={c.id} className="rounded-2xl border p-4" style={{ borderColor: "rgba(51,45,46,.10)" }}>
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="mt-1 text-xs opacity-75">{c.summary}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Certificaciones + Cobertura */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border bg-white p-5 shadow-sm" style={{ borderColor: "rgba(51,45,46,.12)" }}>
          <h3 className="text-lg font-semibold" style={{ color: company.colors.ink }}>Certificaciones y respaldos</h3>
      <div className="mt-3 flex flex-wrap gap-2">
  {company.certifications.map((cert) => (
    <span
      key={cert.id}
      className="rounded-full border px-3 py-1 text-xs"
      style={{ borderColor: "rgba(51,45,46,.14)" }}
      title={cert.description}
    >
      {cert.name}
    </span>
  ))}
</div>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm" style={{ borderColor: "rgba(51,45,46,.12)" }}>
          <h3 className="text-lg font-semibold" style={{ color: company.colors.ink }}>Cobertura</h3>
          <p className="mt-2 text-sm opacity-80">{copy.coverageIntro}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {company.coverage.map((city: string) => (
              <span key={city} className="rounded-full px-3 py-1 text-xs"
                    style={{ background: company.colors.muted }}>
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
