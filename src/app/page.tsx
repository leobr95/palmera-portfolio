import Link from "next/link";
import Image from "next/image";
import { COMPANY } from "@/lib/mock-data";

const PANEL_BORDER = "rgba(62, 221, 141, 0.26)";
const SOFT_TEXT = "rgba(234,246,255,.82)";
const CARD_BG = "linear-gradient(150deg, rgba(255,255,255,.98), rgba(235,250,242,.96))";

const features = [
  {
    kicker: "Personalizacion",
    title: "Servicios y controles por cliente",
    description: "Seleccion guiada para presentar exactamente lo que necesita cada cuenta.",
  },
  {
    kicker: "Entrega",
    title: "PDF navegador + link compartible",
    description: "Comparte el resumen comercial en segundos con el mismo diseno del preview.",
  },
  {
    kicker: "Diseno",
    title: "Brochure green y aqua listos",
    description: "Una presentacion visual consistente, profesional y alineada a la marca.",
  },
];

const workflow = [
  "Elige cliente o portafolio general",
  "Selecciona servicios, controles y orden",
  "Configura tema y tamano de hoja",
  "Comparte link o PDF navegador",
];

const themes = ["Brochure Verde", "Brochure Aqua", "Infografico"];

export default function HomePage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-10"
      style={{
        background:
          "radial-gradient(1200px 700px at 12% 10%, rgba(46,232,142,.2), transparent 58%), radial-gradient(1000px 760px at 92% 10%, rgba(24,182,93,.22), transparent 55%), linear-gradient(180deg, #041f14, #062a1b)",
      }}
    >
      <div className="orb orbA" />
      <div className="orb orbB" />

      <section className="relative mx-auto w-full max-w-6xl">
        <div
          className="rounded-[30px] border p-4 shadow-[0_26px_80px_rgba(0,0,0,.28)] backdrop-blur-sm sm:p-6 lg:p-8"
          style={{
            borderColor: PANEL_BORDER,
            background:
              "linear-gradient(148deg, rgba(6,43,29,.82), rgba(7,39,27,.76) 48%, rgba(6,34,24,.74))",
          }}
        >
          <div className="grid gap-6 lg:grid-cols-[1.12fr_.88fr]">
            <article className="rounded-3xl border p-6 sm:p-7" style={{ borderColor: "rgba(255,255,255,.14)" }}>
              <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "rgba(234,246,255,.66)" }}>
                Portafolios comerciales
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-[2.3rem]">
                Palmera Junior — Portafolios por cliente
              </h1>
              <p className="mt-4 text-sm leading-relaxed sm:text-base" style={{ color: SOFT_TEXT }}>
                Construye propuestas de alto impacto con una experiencia mas clara y visual. Personaliza por cliente,
                organiza el contenido y entrega un portafolio moderno listo para negocio.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/builder"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(46,232,142,.28)]"
                  style={{ background: "linear-gradient(135deg, #2ee88e, #18b65d)" }}
                >
                  Ir al constructor
                  <span className="transition-transform group-hover:translate-x-[2px]">→</span>
                </Link>

                <Link
                  href="/p?variant=brochure"
                  className="inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
                  style={{ borderColor: "rgba(255,255,255,.18)" }}
                >
                  Ver vista publica
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-4 border-t pt-5" style={{ borderColor: "rgba(255,255,255,.12)" }}>
                <Image
                  src="/brand/palmera-junior.webp"
                  alt="Palmera Junior"
                  width={230}
                  height={84}
                  priority
                  className="h-auto w-[180px]"
                  style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,.35))" }}
                />
                <div className="text-sm" style={{ color: "rgba(234,246,255,.72)" }}>
                  <p className="text-[11px] uppercase tracking-[0.16em]">Una empresa de</p>
                  <Image
                    src="/brand/anticimex.png"
                    alt="Anticimex"
                    width={162}
                    height={46}
                    priority
                    className="mt-1 h-auto w-[146px]"
                    style={{ filter: "brightness(0) saturate(100%) invert(100%)" }}
                  />
                </div>
              </div>
            </article>

            <aside
              className="rounded-3xl border p-6 sm:p-7"
              style={{
                borderColor: "rgba(255,255,255,.14)",
                background:
                  "radial-gradient(520px 280px at 16% 8%, rgba(46,232,142,.2), transparent 58%), linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.02))",
              }}
            >
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "rgba(234,246,255,.68)" }}>
                Experiencia interactiva
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Flujo recomendado</h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: SOFT_TEXT }}>
                Navegacion pensada para que el equipo comercial arme propuestas con velocidad y criterio visual.
              </p>

              <ol className="mt-5 space-y-2">
                {workflow.map((step, idx) => (
                  <li
                    key={step}
                    className="group flex items-start gap-3 rounded-xl border px-3 py-2 transition-all hover:-translate-y-[1px] hover:bg-white/10"
                    style={{ borderColor: "rgba(255,255,255,.14)" }}
                  >
                    <span
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ background: "rgba(46,232,142,.28)" }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-sm text-white/92">{step}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.16em]" style={{ color: "rgba(234,246,255,.66)" }}>
                  Temas disponibles
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {themes.map((theme) => (
                    <span
                      key={theme}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold text-white/90 transition-all hover:-translate-y-[1px]"
                      style={{ borderColor: "rgba(255,255,255,.2)", background: "rgba(255,255,255,.08)" }}
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="featureCard rounded-2xl border p-4 sm:p-5" style={{ borderColor: "rgba(255,255,255,.15)", background: CARD_BG }}>
                <p className="text-xs uppercase tracking-[0.14em] text-[#0e5136]/75">{feature.kicker}</p>
                <h3 className="mt-2 text-base font-semibold text-[#123526]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#24513f]/85">{feature.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border px-5 py-4" style={{ borderColor: "rgba(255,255,255,.14)", background: "rgba(255,255,255,.05)" }}>
            <p className="text-sm" style={{ color: SOFT_TEXT }}>
              Consejo: entra al constructor, selecciona cliente, organiza servicios/controles y exporta la version final
              con el tamano de hoja correcto.
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.12em]" style={{ color: "rgba(234,246,255,.62)" }}>
              {COMPANY.name} • {COMPANY.supportLine}
            </p>
          </div>
        </div>
      </section>

      <style>{`
        .orb {
          position: absolute;
          pointer-events: none;
          border-radius: 999px;
          filter: blur(6px);
          opacity: 0.42;
        }

        .orbA {
          width: min(26vw, 340px);
          height: min(26vw, 340px);
          top: 7%;
          left: 4%;
          background: radial-gradient(circle, rgba(46, 232, 142, 0.38), rgba(46, 232, 142, 0));
          animation: floatA 9s ease-in-out infinite;
        }

        .orbB {
          width: min(22vw, 300px);
          height: min(22vw, 300px);
          top: 64%;
          right: 6%;
          background: radial-gradient(circle, rgba(24, 182, 93, 0.34), rgba(24, 182, 93, 0));
          animation: floatB 11s ease-in-out infinite;
        }

        .featureCard {
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .featureCard:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 28px rgba(5, 37, 24, 0.22);
        }

        @keyframes floatA {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(16px) translateX(8px);
          }
        }

        @keyframes floatB {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-14px) translateX(-10px);
          }
        }
      `}</style>
    </main>
  );
}
