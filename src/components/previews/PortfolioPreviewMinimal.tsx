import Image from "next/image";
import type { PortfolioPreviewProps } from "./portfolioPreviewTypes";

export function PortfolioPreviewMinimal({
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
  const showLogo = options?.showLogo ?? true;
  const showClientMeta = options?.showClientMeta ?? true;

  return (
    <div className="space-y-10">
      {/* Cover (minimal) */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm" style={{ borderColor: "rgba(51,45,46,.12)" }}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-wider opacity-70">{company.name}</p>
            <h2 className="mt-2 text-3xl font-semibold" style={{ color: company.colors.ink }}>{title}</h2>
            <p className="mt-2 text-sm opacity-80">
              {showClientMeta ? (
                <>
                  {subtitle} <span className="font-semibold">{client.name}</span>
                </>
              ) : (
                subtitle
              )}
            </p>
            <div className="mt-4 h-[3px] w-20 rounded-full" style={{ background: accent }} />
            <p className="mt-4 text-sm opacity-80">{company.tagline}</p>
          </div>

          {showLogo && (
            <div className="rounded-2xl p-3" style={{ background: company.colors.muted }}>
              <Image src={logoSrc} alt="Palmera Junior" width={220} height={80} className="h-auto w-[220px]" />
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(51,45,46,.10)" }}>
            <p className="text-xs opacity-70">Cliente</p>
            {showClientMeta ? (
              <>
                <p className="mt-1 text-sm font-semibold">{client.name}</p>
                <p className="text-xs opacity-70">{client.industry}{client.city ? ` • ${client.city}` : ""}</p>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm font-semibold">Portafolio general</p>
                <p className="text-xs opacity-70">Sin cliente específico</p>
              </>
            )}
          </div>
          <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(51,45,46,.10)" }}>
            <p className="text-xs opacity-70">Servicios</p>
            <p className="mt-1 text-2xl font-semibold" style={{ color: company.colors.ink }}>{services.length}</p>
          </div>
          <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(51,45,46,.10)" }}>
            <p className="text-xs opacity-70">Controles</p>
            <p className="mt-1 text-2xl font-semibold" style={{ color: company.colors.ink }}>{controls.length}</p>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-[10px] w-[10px] rounded-full" style={{ background: accent }} />
          <h3 className="text-lg font-semibold" style={{ color: company.colors.ink }}>Trayectoria y experiencia</h3>
        </div>
        <p className="text-sm opacity-80">
          Operación con enfoque en manejo integrado de plagas, orientada a prevención, cumplimiento y continuidad operativa.
        </p>
        <div className="h-px w-full" style={{ background: "rgba(51,45,46,.10)" }} />
        <p className="text-sm">
          <span className="font-semibold">Clientes representativos:</span>{" "}
          <span className="opacity-80">{company.representativeClients.join(", ")}</span>
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-[10px] w-[10px] rounded-full" style={{ background: accent }} />
          <h3 className="text-lg font-semibold" style={{ color: company.colors.ink }}>Servicios ofrecidos</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <div key={s.id} className="rounded-2xl border bg-white p-4 shadow-sm"
                 style={{ borderColor: "rgba(51,45,46,.12)" }}>
              <p className="text-sm font-semibold">{s.name}</p>
              <p className="mt-1 text-xs opacity-75">{s.summary}</p>
              <span className="mt-3 inline-block rounded-full px-2 py-1 text-xs" style={{ background: company.colors.muted }}>
                {s.category}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-[10px] w-[10px] rounded-full" style={{ background: accent }} />
          <h3 className="text-lg font-semibold" style={{ color: company.colors.ink }}>Controles y diferenciales</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {controls.map((c) => (
            <div key={c.id} className="rounded-2xl border bg-white p-4 shadow-sm"
                 style={{ borderColor: "rgba(51,45,46,.12)" }}>
              <p className="text-sm font-semibold">
                {c.name}{c.highlight ? <span style={{ color: accent }}> ★</span> : null}
              </p>
              <p className="mt-1 text-xs opacity-75">{c.summary}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border bg-white p-5 shadow-sm" style={{ borderColor: "rgba(51,45,46,.12)" }}>
          <h3 className="text-lg font-semibold" style={{ color: company.colors.ink }}>Certificaciones</h3>
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
  );
}
