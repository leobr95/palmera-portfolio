"use client";
import Link from "next/link";
import Image from "next/image";
import { COMPANY } from "@/lib/mock-data";
import { use } from "react";

function borderColor() {
  return "rgba(51,45,46,.14)";
}
function softShadow() {
  return "0 18px 60px rgba(0,0,0,.10)";
}

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `radial-gradient(900px 420px at 25% 20%, rgba(0,172,75,.18) 0%, rgba(0,0,0,0) 60%), ${COMPANY.colors.muted}`,
      }}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border bg-white"
        style={{ borderColor: borderColor(), boxShadow: softShadow() }}
      >
        {/* Top bar / brand */}
        <div className="flex flex-col gap-5 p-7 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider opacity-70">Portafolios comerciales</p>
            <h1 className="mt-2 text-3xl font-semibold" style={{ color: COMPANY.colors.ink }}>
              Palmera Junior — Portafolios por cliente
            </h1>
            <p className="mt-3 text-sm opacity-85">
              Un constructor moderno para armar <span className="font-semibold">portafolios personalizados</span> por cliente.
              Selecciona servicios y controles relevantes, genera un PDF profesional o comparte un enlace con el resumen.
            </p>
          </div>

          {/* Logos (sin cuadros) */}
          <div className="flex shrink-0 flex-col items-end gap-2 text-right">
            <Image
              src="/brand/palmera-junior.webp"
              alt="Palmera Junior"
              width={240}
              height={90}
              priority
              className="h-auto w-[190px]"
              style={{ filter: "drop-shadow(0 10px 18px rgba(0,0,0,.18))" }}
            />
            <p className="text-[11px] uppercase tracking-wider opacity-70">Una empresa de</p>
            <Image
              src="/brand/anticimex.png"
              alt="Anticimex"
              width={190}
              height={52}
              priority
              className="h-auto w-[165px]"
              style={{ filter: "drop-shadow(0 10px 18px rgba(0,0,0,.18))" }}
            />
          </div>
        </div>

        {/* Feature bullets */}
        <div className="px-7 pb-2">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border bg-white p-4" style={{ borderColor: borderColor() }}>
              <p className="text-xs opacity-70">Personalización</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: COMPANY.colors.ink }}>
                Servicios y controles por cliente
              </p>
              <p className="mt-1 text-xs opacity-75">
                Selección guiada para impactar el negocio.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-4" style={{ borderColor: borderColor() }}>
              <p className="text-xs opacity-70">Entrega</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: COMPANY.colors.ink }}>
                PDF + link compartible
              </p>
              <p className="mt-1 text-xs opacity-75">
                Un resumen web y un PDF listo para enviar.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-4" style={{ borderColor: borderColor() }}>
              <p className="text-xs opacity-70">Diseño</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: COMPANY.colors.ink }}>
                Visual pro y consistente
              </p>
              <p className="mt-1 text-xs opacity-75">
                Plantillas modernas (web y PDF).
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-7 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/builder"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition-all"
              style={{ background: COMPANY.colors.palmeraGreen }}
            >
              <span className="transition-transform group-hover:translate-x-[1px]">
                Ir al constructor de portafolio
              </span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>

            <Link
              href="/p?client=colanta"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl border bg-white px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-[1px]"
              style={{ borderColor: borderColor(), color: COMPANY.colors.ink }}
            >
              Ver ejemplo
              <span className="opacity-60 transition-opacity group-hover:opacity-100">↗</span>
            </Link>
          </div>

          <p className="mt-4 text-xs opacity-70">
            Consejo: entra al constructor, selecciona el cliente y marca los servicios/controles recomendados; luego genera el PDF o comparte el enlace.
          </p>
        </div>

        {/* Subtle bottom strip */}
        <div className="border-t px-7 py-4" style={{ borderColor: borderColor() }}>
          <p className="text-xs opacity-70">
            {COMPANY.name} • {COMPANY.supportLine}
          </p>
        </div>
      </div>

      <style jsx global>{`
        /* Efecto moderno para botones (sin dependencias) */
        a.group {
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.08);
        }
        a.group:hover {
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
        }
        a.group:active {
          transform: translateY(1px);
        }
      `}</style>
    </main>
  );
}
