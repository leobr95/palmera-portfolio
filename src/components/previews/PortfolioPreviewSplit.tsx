import Image from "next/image";
import type { PortfolioPreviewProps } from "./portfolioPreviewTypes";
import type { RepresentativeClient } from "@/lib/mock-data";

export function PortfolioPreviewSplit({
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
  const logoSrc = options?.logoSrc ?? "/brand/palmera-junior.webp";
  const showClientMeta = options?.showClientMeta ?? true;
  const maxClients = options?.maxRepresentativeClients ?? 7;

  const repClients = (company.representativeClients ?? []) as RepresentativeClient[];

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Sidebar */}
      <aside
        className="rounded-3xl p-5 shadow-sm"
        style={{ background: company.colors.ink, color: company.colors.paper }}
      >
        {showLogo && (
          <div className="rounded-2xl bg-white/10 p-3">
            <Image
              src={logoSrc}
              alt="Palmera Junior"
              width={240}
              height={90}
              priority
              className="h-auto w-full"
            />
          </div>
        )}

        <div className="mt-4">
          <p className="text-xs opacity-80">{company.name}</p>
          <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
          <p className="mt-2 text-sm opacity-90">
            {showClientMeta ? (
              <>
                {subtitle} <span className="font-semibold">{client.name}</span>
              </>
            ) : (
              subtitle
            )}
          </p>

          {showClientMeta && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {client.industry ? (
                <span
                  className="rounded-full px-3 py-1"
                  style={{ background: "rgba(255,255,255,.10)" }}
                >
                  {client.industry}
                </span>
              ) : null}
              {client.city ? (
                <span
                  className="rounded-full px-3 py-1"
                  style={{ background: "rgba(255,255,255,.10)" }}
                >
                  {client.city}
                </span>
              ) : null}
            </div>
          )}

          <div className="mt-5 h-[3px] w-16 rounded-full" style={{ background: accent }} />
          <p className="mt-4 text-sm opacity-80">{company.tagline}</p>
          <p className="mt-2 text-xs opacity-80">{company.supportLine}</p>
        </div>

        {/* (Opcional) métricas — si NO las quieres aquí tampoco, bórralas */}
        <div className="mt-6 grid gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs opacity-80">Servicios</p>
            <p className="text-xl font-semibold">{services.length}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs opacity-80">Controles</p>
            <p className="text-xl font-semibold">{controls.length}</p>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="space-y-6">
        <section
          className="rounded-3xl border bg-white p-5 shadow-sm"
          style={{ borderColor: "rgba(51,45,46,.12)" }}
        >
          <h3 className="text-lg font-semibold" style={{ color: company.colors.ink }}>
            Trayectoria y experiencia
          </h3>
          <p className="mt-2 text-sm opacity-80">
            Operación con enfoque en manejo integrado de plagas, orientada a prevención, cumplimiento y continuidad
            operativa.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(51,45,46,.10)" }}>
              <p className="text-sm font-semibold">Clientes representativos</p>
              <ul className="mt-2 list-disc pl-5 text-sm opacity-85">
                {repClients.slice(0, maxClients).map((x) => (
                  <li key={x.id}>{x.name}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(51,45,46,.10)" }}>
              <p className="text-sm font-semibold">Enfoque por industria</p>
              <p className="mt-2 text-sm opacity-85">
                Propuesta ajustable por sector (alimentos, retail, industrial, residencial), con plan preventivo y
                evidencias.
              </p>
            </div>
          </div>
        </section>

        <section
          className="rounded-3xl border bg-white p-5 shadow-sm"
          style={{ borderColor: "rgba(51,45,46,.12)" }}
        >
          <h3 className="text-lg font-semibold" style={{ color: company.colors.ink }}>
            Servicios ofrecidos
          </h3>
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
              </div>
            ))}
          </div>
        </section>

        <section
          className="rounded-3xl border bg-white p-5 shadow-sm"
          style={{ borderColor: "rgba(51,45,46,.12)" }}
        >
          <h3 className="text-lg font-semibold" style={{ color: company.colors.ink }}>
            Controles y diferenciales
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {controls.map((c) => (
              <div key={c.id} className="rounded-2xl border p-4" style={{ borderColor: "rgba(51,45,46,.10)" }}>
                <p className="text-sm font-semibold">
                  {c.name}
                  {c.highlight ? <span style={{ color: accent }}> ★</span> : null}
                </p>
                <p className="mt-1 text-xs opacity-75">{c.summary}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border bg-white p-5 shadow-sm" style={{ borderColor: "rgba(51,45,46,.12)" }}>
            <h3 className="text-lg font-semibold" style={{ color: company.colors.ink }}>
              Certificaciones
            </h3>
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
            <h3 className="text-lg font-semibold" style={{ color: company.colors.ink }}>
              Cobertura
            </h3>
            <p className="mt-2 text-sm opacity-80">Atención y operación en múltiples ciudades de Colombia.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {company.coverage.map((city: string) => (
                <span key={city} className="rounded-full px-3 py-1 text-xs" style={{ background: company.colors.muted }}>
                  {city}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
