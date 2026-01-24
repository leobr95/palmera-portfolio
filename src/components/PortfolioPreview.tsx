import Image from "next/image";
import type { Client, Control, Service, Company } from "@/lib/mock-data";

export function PortfolioPreview({
  company,
  client,
  title,
  subtitle,
  services,
  controls,
}: {
  company: Company;
  client: Client;
  title: string;
  subtitle: string;
  services: Service[];
  controls: Control[];
}) {
  // ✅ Si no te llega options aquí, dejamos un default fijo (evita "Cannot find name 'maxClients'")
  const maxClients = 7;

  return (
    <div className="space-y-8">
      {/* 1) Portada */}
      <section
        className="rounded-2xl p-6"
        style={{ background: company.colors.ink, color: "white" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm opacity-80">{company.name}</p>
            <h2 className="mt-2 text-3xl font-semibold">{title}</h2>
            <p className="mt-2 text-lg opacity-90">
              {subtitle} <span className="font-semibold">{client.name}</span>
            </p>
            <p className="mt-4 text-sm opacity-80">{company.tagline}</p>
          </div>

          {/* ✅ Logos */}
          <div className="text-right flex flex-col items-end gap-3">
            {/* Palmera Junior (local en /public/brand/...) */}
            <Image
              src="/brand/palmera-junior.webp"
              alt="Palmera Junior"
              width={220}
              height={80}
              priority
              className="h-auto w-[220px]"
            />

            {/* Anticimex (placeholder) */}
            <div
              className="inline-block rounded-xl px-3 py-2"
              style={{ background: company.colors.anticimexBlue }}
            >
              <p className="text-sm font-semibold">Anticimex</p>
            </div>

            <p className="text-xs opacity-80">{company.supportLine}</p>
          </div>
        </div>
      </section>

      {/* 2) Trayectoria */}
      <section>
        <h3 className="text-lg font-semibold">Trayectoria y experiencia</h3>
        <p className="mt-2 text-sm opacity-80">
          Operación con enfoque en manejo integrado de plagas, orientada a prevención,
          cumplimiento y continuidad operativa.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <p className="text-sm font-semibold">Clientes representativos</p>

            <ul className="mt-2 list-disc pl-5 text-sm opacity-85">
              {/* ✅ Ajuste: si representativeClients ahora es array de objetos {id,name} */}
              {company.representativeClients.slice(0, maxClients).map((x) => (
                <li key={x.id}>{x.name}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-sm font-semibold">Enfoque por industria</p>
            <p className="mt-2 text-sm opacity-85">
              Propuesta ajustable por sector (alimentos, retail, industrial, residencial),
              con plan preventivo y evidencias.
            </p>
          </div>
        </div>
      </section>

      {/* 3) Servicios */}
      <section>
        <h3 className="text-lg font-semibold">Servicios ofrecidos</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <div key={s.id} className="rounded-xl border p-4">
              <p className="text-sm font-semibold">{s.name}</p>
              <p className="mt-1 text-xs opacity-75">{s.summary}</p>
              <span
                className="mt-2 inline-block rounded-full px-2 py-1 text-xs"
                style={{ background: company.colors.muted }}
              >
                {s.category}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4) Controles */}
      <section>
        <h3 className="text-lg font-semibold">Controles y diferenciales</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {controls.map((c) => (
            <div key={c.id} className="rounded-xl border p-4">
              <p className="text-sm font-semibold">
                {c.name}
                {c.highlight ? " ★" : ""}
              </p>
              <p className="mt-1 text-xs opacity-75">{c.summary}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5) Certificaciones */}
      <section>
        <h3 className="text-lg font-semibold">Certificaciones y respaldos</h3>

        <div className="mt-3 flex flex-wrap gap-2">
          {/* ✅ Ajuste: si certifications ahora es array de objetos {id,name,description,logoSrc?} */}
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
      </section>

      {/* 6) Cobertura */}
      <section>
        <h3 className="text-lg font-semibold">Cobertura</h3>
        <p className="mt-2 text-sm opacity-80">
          Atención y operación en múltiples ciudades de Colombia (según necesidad del cliente).
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {company.coverage.map((city: string) => (
            <span
              key={city}
              className="rounded-full px-3 py-1 text-xs"
              style={{ background: company.colors.muted }}
            >
              {city}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
