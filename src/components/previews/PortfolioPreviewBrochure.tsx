import Image from "next/image";
import { Source_Sans_3 } from "next/font/google";
import { useCallback, useEffect, useMemo, useState, type SVGProps } from "react";
import type {
  Certification,
  RepresentativeClient,
  Service,
  ServiceCategory,
  SocialLink,
} from "@/lib/mock-data";
import { PORTFOLIO_IMAGES } from "@/lib/portafolio-images";
import type { PortfolioPreviewProps } from "./portfolioPreviewTypes";

const DEFAULT_CAT_ORDER: ServiceCategory[] = ["Plagas", "Higiene", "Especializados"];
const PAGE_COUNT = 5;

const brochureFont = Source_Sans_3({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

type TurnDirection = "next" | "prev";
type TurnState = { from: number; to: number; direction: TurnDirection };

const CATEGORY_COPY: Record<ServiceCategory, string> = {
  Plagas: "Control preventivo y correctivo para ambientes sensibles.",
  Higiene: "Protocolos de desinfeccion y mantenimiento sanitario.",
  Especializados: "Servicios tecnicos para riesgos de mayor complejidad.",
};

type BrochurePalette = {
  bg950: string;
  bg900: string;
  accent: string;
  accent2: string;
  accentRgb: string;
  accent2Rgb: string;
  bgSoft1: string;
  bgSoft2: string;
  bgSoft2Rgb: string;
  bgSoft3: string;
  touch1: string;
  touch2: string;
  touch3: string;
  whyAccent: string;
};

type PrintPaper = "a4" | "letter" | "legal";

type PrintPaperSpec = {
  key: PrintPaper;
  widthMm: number;
  heightMm: number;
};

function brochurePalette(theme: "green" | "aqua"): BrochurePalette {
  if (theme === "aqua") {
    return {
      bg950: "#081e2c",
      bg900: "#0b2b3f",
      accent: "#3bd5ff",
      accent2: "#1baac9",
      accentRgb: "59, 213, 255",
      accent2Rgb: "27, 170, 201",
      bgSoft1: "#12344a",
      bgSoft2: "#0f2c3e",
      bgSoft2Rgb: "15, 44, 62",
      bgSoft3: "#0a2231",
      touch1: "#17577a",
      touch2: "#124560",
      touch3: "#0a2e42",
      whyAccent: "#1779a7",
    };
  }

  return {
    bg950: "#041f14",
    bg900: "#062a1b",
    accent: "#2ee88e",
    accent2: "#18b65d",
    accentRgb: "46, 232, 142",
    accent2Rgb: "24, 182, 93",
    bgSoft1: "#073726",
    bgSoft2: "#052b1f",
    bgSoft2Rgb: "5, 43, 31",
    bgSoft3: "#041f16",
    touch1: "#0a4a2e",
    touch2: "#063822",
    touch3: "#041f16",
    whyAccent: "#0c6b3e",
  };
}

function printPaperSpec(paper: PrintPaper): PrintPaperSpec {
  if (paper === "letter") return { key: "letter", widthMm: 216, heightMm: 279 };
  if (paper === "legal") return { key: "legal", widthMm: 216, heightMm: 356 };
  return { key: "a4", widthMm: 210, heightMm: 297 };
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase() ?? "")
    .join("");
}

function normalizeLabel(label: string) {
  return label.toLowerCase().trim();
}

function IconBase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

function ServiceIcon({ icon, className }: { icon: Service["icon"]; className?: string }) {
  switch (icon) {
    case "spray":
      return (
        <IconBase className={className}>
          <path d="M4 15h10a2 2 0 0 1 2 2v3H4z" />
          <path d="M8 15V9h4v6" />
          <path d="M12 9h7" />
          <path d="M19 9h1" />
          <path d="M21 9h1" />
        </IconBase>
      );
    case "rat":
      return (
        <IconBase className={className}>
          <path d="M4 14c2-4 7-6 11-4l4 2-1 3-4 1c-3 1-6 0-8-2z" />
          <path d="M3 15c-1 1-1 3 1 4" />
          <circle cx="15.5" cy="11.5" r=".6" />
        </IconBase>
      );
    case "cockroach":
      return (
        <IconBase className={className}>
          <path d="M12 5v14" />
          <path d="M9 8h6" />
          <path d="M8 12h8" />
          <path d="M9 18h6" />
          <path d="M6 7l3 2" />
          <path d="M18 7l-3 2" />
          <path d="M6 17l3-2" />
          <path d="M18 17l-3-2" />
        </IconBase>
      );
    case "fly":
      return (
        <IconBase className={className}>
          <ellipse cx="12" cy="13" rx="2.4" ry="4" />
          <path d="M12 7V5" />
          <path d="M8 9C6.5 6.5 5 5 3.5 5.5S3 9 5 10.5" />
          <path d="M16 9c1.5-2.5 3-4 4.5-3.5S21 9 19 10.5" />
          <path d="M7.5 15h9" />
        </IconBase>
      );
    case "mosquito":
      return (
        <IconBase className={className}>
          <path d="M12 11v8" />
          <path d="M12 11l-4-3" />
          <path d="M12 11l4-3" />
          <path d="M8 8 4 6" />
          <path d="M16 8l4-2" />
          <path d="M10 20h4" />
        </IconBase>
      );
    case "ant":
      return (
        <IconBase className={className}>
          <circle cx="12" cy="8" r="1.8" />
          <circle cx="12" cy="12" r="2.2" />
          <circle cx="12" cy="17" r="2.4" />
          <path d="M9 12H6" />
          <path d="M18 12h-3" />
          <path d="M8.5 17H6" />
          <path d="M18 17h-2.5" />
        </IconBase>
      );
    case "flea":
      return (
        <IconBase className={className}>
          <path d="M8 15a4 4 0 1 0 8 0c0-2.6-1.7-4.3-4-6-2.3 1.7-4 3.4-4 6z" />
          <path d="M12 4v3" />
          <path d="M7 20h10" />
        </IconBase>
      );
    case "tick":
      return (
        <IconBase className={className}>
          <circle cx="12" cy="12" r="4.8" />
          <path d="M12 3v3" />
          <path d="M12 18v3" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
        </IconBase>
      );
    case "bird":
      return (
        <IconBase className={className}>
          <path d="M4 13c2.5 3 6.4 5 10 5 4.5 0 6-2.6 6-4.5 0-1.2-.8-2.2-2-2.2h-3.2L11 8 8 9l-1.2 2H4.8A2.8 2.8 0 0 0 2 13.8V18" />
          <path d="M14 8h3" />
        </IconBase>
      );
    case "termite":
      return (
        <IconBase className={className}>
          <path d="M6 18V8l6-4 6 4v10" />
          <path d="M9 18v-4h6v4" />
          <path d="M5 18h14" />
        </IconBase>
      );
    case "bat":
      return (
        <IconBase className={className}>
          <path d="M3 12c2.5-3 5.5-4 9-4s6.5 1 9 4" />
          <path d="M8 12c1 2 2.3 3 4 3s3-1 4-3" />
          <path d="M12 10v3" />
        </IconBase>
      );
    case "snake":
      return (
        <IconBase className={className}>
          <path d="M5 17c0-3 2-5 5-5h3c2 0 3-1 3-2.5S15 7 13 7c-1.7 0-2.8.7-3.5 2" />
          <path d="M8 17h6" />
          <circle cx="16.5" cy="7.5" r=".6" />
        </IconBase>
      );
    case "grain":
      return (
        <IconBase className={className}>
          <path d="M12 5v14" />
          <path d="M12 8c-2 0-3.5-1.5-3.5-3.5C10.5 4.5 12 6 12 8z" />
          <path d="M12 12c2 0 3.5-1.5 3.5-3.5C13.5 8.5 12 10 12 12z" />
          <path d="M12 16c-2 0-3.5-1.5-3.5-3.5C10.5 12.5 12 14 12 16z" />
        </IconBase>
      );
    case "shield":
      return (
        <IconBase className={className}>
          <path d="M12 3l7 3v5c0 4.5-2.8 8.3-7 10-4.2-1.7-7-5.5-7-10V6z" />
          <path d="m9 12 2 2 4-4" />
        </IconBase>
      );
    case "water":
      return (
        <IconBase className={className}>
          <path d="M12 3c4 5 6 7.6 6 10.1A6 6 0 0 1 6 13.1C6 10.6 8 8 12 3z" />
          <path d="M9 15c.8.8 2 1.3 3 1.3 1.2 0 2.2-.4 3-1.3" />
        </IconBase>
      );
    case "wrench":
    default:
      return (
        <IconBase className={className}>
          <path d="M21 7.5a4.5 4.5 0 0 1-6 4.2L8 18.8a2 2 0 1 1-2.8-2.8L12.3 9A4.5 4.5 0 1 1 21 7.5z" />
        </IconBase>
      );
  }
}

function ContactIcon({ label, className }: { label: string; className?: string }) {
  const key = normalizeLabel(label);

  if (key.includes("email")) {
    return (
      <IconBase className={className}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 8 9 6 9-6" />
      </IconBase>
    );
  }

  if (key.includes("whatsapp") || key.includes("tel") || key.includes("phone")) {
    return (
      <IconBase className={className}>
        <path d="M5 4h4l2 5-2.5 2.5a15.5 15.5 0 0 0 4 4L15 13l5 2v4a2 2 0 0 1-2 2C9 21 3 15 3 7a2 2 0 0 1 2-2z" />
      </IconBase>
    );
  }

  if (key.includes("web") || key.includes("site")) {
    return (
      <IconBase className={className}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a15 15 0 0 1 0 18" />
        <path d="M12 3a15 15 0 0 0 0 18" />
      </IconBase>
    );
  }

  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5l3 2" />
    </IconBase>
  );
}

function SocialLinkIcon({ label, className }: { label: string; className?: string }) {
  const key = normalizeLabel(label);

  if (key.includes("linkedin")) {
    return (
      <IconBase className={className}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 10v6" />
        <path d="M8 8h.01" />
        <path d="M12 16v-3a2 2 0 0 1 4 0v3" />
      </IconBase>
    );
  }

  if (key.includes("instagram")) {
    return (
      <IconBase className={className}>
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.2" />
        <circle cx="16.5" cy="7.5" r="0.7" />
      </IconBase>
    );
  }

  if (key.includes("facebook")) {
    return (
      <IconBase className={className}>
        <path d="M14 8h-1.5c-1 0-1.5.5-1.5 1.5V11H14l-.5 3h-2.5v6H8v-6H6v-3h2V9.3C8 6.9 9.5 5 12.1 5H14z" />
      </IconBase>
    );
  }

  if (key.includes("youtube")) {
    return (
      <IconBase className={className}>
        <rect x="3.5" y="6.5" width="17" height="11" rx="2.5" />
        <path d="m10 9.5 5 3-5 3z" />
      </IconBase>
    );
  }

  if (key.includes("whatsapp")) {
    return (
      <IconBase className={className}>
        <path d="M20 11.5A8 8 0 1 0 7 18l-3 3 4-.8A8 8 0 0 0 20 11.5z" />
        <path d="M9.8 10.2c0 2 1.9 3.8 4 4l1.2-1.1" />
      </IconBase>
    );
  }

  if (key.includes("web") || key.includes("site")) {
    return (
      <IconBase className={className}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a15 15 0 0 1 0 18" />
        <path d="M12 3a15 15 0 0 0 0 18" />
      </IconBase>
    );
  }

  return (
    <IconBase className={className}>
      <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1" />
      <path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" />
    </IconBase>
  );
}

function WhyIcon({ index, className }: { index: number; className?: string }) {
  if (index % 4 === 0) {
    return (
      <IconBase className={className}>
        <path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20l1.1-6.2L3 9.5l6.3-.9z" />
      </IconBase>
    );
  }
  if (index % 4 === 1) {
    return (
      <IconBase className={className}>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M8 9h8" />
        <path d="M8 13h6" />
      </IconBase>
    );
  }
  if (index % 4 === 2) {
    return (
      <IconBase className={className}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </IconBase>
    );
  }
  return (
    <IconBase className={className}>
      <path d="M12 3l7 3v5c0 4.5-2.8 8.3-7 10-4.2-1.7-7-5.5-7-10V6z" />
      <path d="m9 12 2 2 4-4" />
    </IconBase>
  );
}

export function PortfolioPreviewBrochure({
  company,
  client,
  title,
  subtitle,
  services,
  controls,
  options,
}: PortfolioPreviewProps) {
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState<TurnState | null>(null);

  const brochureTheme = options?.brochureTheme ?? "green";
  const palette = brochurePalette(brochureTheme);
  const accent = options?.accentColor ?? palette.accent;
  const logoSrc = options?.logoSrc ?? "/brand/palmera-junior.webp";
  const showLogo = options?.showLogo ?? true;
  const showAnticimexBadge = options?.showAnticimexBadge ?? true;
  const showClientMeta = options?.showClientMeta ?? true;
  const maxClients = options?.maxRepresentativeClients ?? 8;
  const isScrollPreview = options?.brochurePreviewMode === "scroll";
  const isPrintMode = options?.printMode ?? false;
  const selectedPrintPaper: PrintPaper = options?.printPaper === "letter" || options?.printPaper === "legal"
    ? options.printPaper
    : "a4";
  const paperSpec = printPaperSpec(selectedPrintPaper);
  const pageAspect = `${paperSpec.widthMm} / ${paperSpec.heightMm}`;
  const touchImageSrc = isPrintMode ? "/Images/portada.jpg" : PORTFOLIO_IMAGES.smart.src;

  const serviceGroups = useMemo(() => {
    const byCategory = new Map<ServiceCategory, Service[]>();

    for (const service of services) {
      const current = byCategory.get(service.category) ?? [];
      current.push(service);
      byCategory.set(service.category, current);
    }

    const baseOrder = options?.serviceCategoryOrder?.length
      ? options.serviceCategoryOrder
      : DEFAULT_CAT_ORDER;
    const withData = Array.from(byCategory.keys());
    const ordered = [
      ...baseOrder.filter((cat) => withData.includes(cat)),
      ...withData.filter((cat) => !baseOrder.includes(cat)),
    ];

    return ordered
      .map((category) => ({
        category,
        items: byCategory.get(category) ?? [],
      }))
      .filter((group) => group.items.length > 0);
  }, [options, services]);

  const representativeClients = useMemo(() => {
    const list = (company.representativeClients ?? []) as RepresentativeClient[];
    if (list.length) return list.slice(0, maxClients);
    return [{ id: client.id, name: client.name, logoSrc: client.logoSrc }];
  }, [client.id, client.logoSrc, client.name, company.representativeClients, maxClients]);

  const certifications = useMemo(
    () => (company.certifications ?? []) as Certification[],
    [company.certifications]
  );

  const whyItems = controls;

  const contactRows = useMemo(() => {
    const socials = company.socials ?? [];
    const sorted = [...socials].sort((a, b) => {
      const aKey = normalizeLabel(a.label);
      const bKey = normalizeLabel(b.label);
      const score = (key: string) => {
        if (key.includes("email")) return 0;
        if (key.includes("whatsapp") || key.includes("tel") || key.includes("phone")) return 1;
        if (key.includes("web")) return 2;
        return 3;
      };
      return score(aKey) - score(bKey);
    });

    const location: SocialLink = {
      label: "Ubicacion",
      value: client.city ?? company.coverage[0] ?? "Colombia",
      href: "#",
    };

    return [...sorted.slice(0, 3), location];
  }, [client.city, company.coverage, company.socials]);

  const followRows = useMemo(() => (company.socials ?? []).slice(0, 4), [company.socials]);

  const canPrev = !isScrollPreview && index > 0 && !turn;
  const canNext = !isScrollPreview && index < PAGE_COUNT - 1 && !turn;

  const goTo = useCallback(
    (next: number, direction: TurnDirection) => {
      if (isScrollPreview) return;
      if (turn) return;
      if (next < 0 || next >= PAGE_COUNT) return;
      if (next === index) return;
      setTurn({ from: index, to: next, direction });
    },
    [index, isScrollPreview, turn]
  );

  useEffect(() => {
    if (isScrollPreview) return;
    if (!turn) return;
    const timer = window.setTimeout(() => {
      setIndex(turn.to);
      setTurn(null);
    }, 760);
    return () => window.clearTimeout(timer);
  }, [isScrollPreview, turn]);

  useEffect(() => {
    if (isScrollPreview) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goTo(index - 1, "prev");
      if (event.key === "ArrowRight") goTo(index + 1, "next");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo, index, isScrollPreview, turn]);

  const pageClassName = (page: number) => {
    if (isScrollPreview) return "page pageScroll";
    if (!turn) return page === index ? "page is-active" : "page";
    if (page === turn.from) {
      return `page is-active ${turn.direction === "next" ? "turn-out-next" : "turn-out-prev"}`;
    }
    if (page === turn.to) {
      return `page is-adjacent ${turn.direction === "next" ? "turn-in-next" : "turn-in-prev"}`;
    }
    return "page";
  };

  return (
    <div className={`brochureRoot ${brochureFont.className}`}>
      {!isScrollPreview ? (
        <div className="toolbar">
        <div className="brandbar">
          <Image
            src={logoSrc}
            alt={`${company.name} logo`}
            width={128}
            height={38}
            className="brandLogo"
          />
          <div className="brandText">
            <strong>{company.name}</strong>
            <small>Brochure · Sangrado completo</small>
          </div>
        </div>

          <div className="controls">
            <button className="btn" type="button" onClick={() => goTo(index - 1, "prev")} disabled={!canPrev}>
              <IconBase className="toolbarIcon">
                <path d="m15 18-6-6 6-6" />
                <path d="M9 12h12" />
              </IconBase>
              Anterior
            </button>
            <button className="btn" type="button" onClick={() => goTo(index + 1, "next")} disabled={!canNext}>
              Siguiente
              <IconBase className="toolbarIcon">
                <path d="m9 6 6 6-6 6" />
                <path d="M3 12h12" />
              </IconBase>
            </button>
          </div>
        </div>
      ) : null}

      <div className={`stage${isScrollPreview ? " stageScroll" : ""}`}>
        <div className={`book${isScrollPreview ? " bookScroll" : ""}`}>
          <section className={pageClassName(0)}>
            <div className="pageInner">
              <div className="pageNum">01</div>
              <div className="coverFull">
                <figure className="coverMedia">
                  <Image
                    src="/Images/portada.jpg"
                    alt="Portada brochure"
                    fill
                    priority
                    sizes="100vw"
                    className="coverImage"
                  />
                  {showLogo ? (
                    <div className="coverTopLogoWrap">
                      <Image
                        src={logoSrc}
                        alt={company.name}
                        width={280}
                        height={96}
                        className="coverTopLogo"
                        priority
                      />
                    </div>
                  ) : null}
                  {showAnticimexBadge ? (
                    <div className="coverAnticimexWrap">
                      <Image
                        src="/brand/anticimex.png"
                        alt="Anticimex"
                        width={170}
                        height={56}
                        className="coverAnticimexLogo"
                        loading={isPrintMode ? "eager" : undefined}
                        style={
                          isPrintMode
                            ? {
                                filter: "brightness(0) saturate(100%) invert(100%)",
                                opacity: 0.98,
                              }
                            : undefined
                        }
                      />
                    </div>
                  ) : null}
                  <div className="coverOverlay">
                    <h1 className="coverTitle">{title}</h1>
                    {showClientMeta ? (
                      <h2 className="coverSubtitle">
                        {subtitle} <span>{client.name}</span>
                      </h2>
                    ) : (
                      <h2 className="coverSubtitle">{subtitle}</h2>
                    )}
                    <p className="coverKicker">{company.tagline}</p>
                  </div>
                </figure>
              </div>
            </div>
          </section>

          <section className={pageClassName(1)}>
            <div className="bgTech" />
            <div className="pageInner">
              <div className="pageNum">02</div>
              <div className="pad">
                <div className="sectionHead">
                  <h2>Servicios</h2>
                </div>

                <div className="servicesGrid">
                  {serviceGroups.map((group) => (
                    <article key={group.category} className="serviceBlock">
                      <h3>{group.category}</h3>
                      <p>{CATEGORY_COPY[group.category]}</p>

                      <div className="serviceItemsGrid">
                        {group.items.map((service) => (
                          <div className="serviceItem" key={service.id}>
                            <ServiceIcon icon={service.icon} className="iconSvg iconService" />
                            <div>
                              <b>{service.name}</b>
                              <small>{service.summary}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={pageClassName(2)}>
            <div className="bgTech" />
            <div className="pageInner">
              <div className="pageNum">03</div>
              <div className="pad">
                <div className="sectionHead">
                  <h2>Nuestros Clientes</h2>
                </div>

                <p className="clientsIntro">
                  Empresas que han confiado en nuestro equipo para ejecutar programas de control, prevencion y mejora
                  continua.
                </p>

                <div className="clientsGrid">
                  {representativeClients.map((item) => (
                    <div key={item.id} className="clientCell">
                      <div className="clientLogo">
                        {item.logoSrc ? (
                          <Image
                            src={item.logoSrc}
                            alt={item.name}
                            fill
                            sizes="112px"
                            className="clientLogoImage"
                            loading={isPrintMode ? "eager" : undefined}
                          />
                        ) : (
                          <span>{initials(item.name)}</span>
                        )}
                      </div>
                      <div className="clientName">{item.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={pageClassName(3)}>
            <div className="bgTech" />
            <div className="pageInner certPage">
              <div className="pageNum">04</div>
              <div className="pad certPad">
                <div className="sectionHead">
                  <h2>Certificaciones</h2>
                </div>

                <p className="clientsIntro">
                  Certificaciones y estándares que respaldan nuestros procesos de calidad, inocuidad y cumplimiento.
                </p>

                <div className="certGrid">
                  {certifications.map((cert) => (
                    <article key={cert.id} className="certItem">
                      <div className="certLogo">
                        {cert.logoSrc ? (
                          <Image
                            src={cert.logoSrc}
                            alt={cert.name}
                            fill
                            sizes="96px"
                            className="certLogoImage"
                            loading={isPrintMode ? "eager" : undefined}
                          />
                        ) : (
                          <span>{initials(cert.name)}</span>
                        )}
                      </div>
                      <div>
                        <h3>{cert.name}</h3>
                        <p>{cert.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <figure className="certBottomMedia">
                <Image
                  src="/Images/certificaciones.jpg"
                  alt="Certificaciones Palmera Junior"
                  fill
                  sizes="(max-width: 900px) 100vw, 70vw"
                  className="certBottomImage"
                  loading={isPrintMode ? "eager" : undefined}
                />
                <div className="certBottomFade" />
              </figure>
            </div>
          </section>

          <section className={pageClassName(4)}>
            <div className="bgTech" />
            <div className="pageInner">
              <div className="pageNum">05</div>
              <div className="p4">
                <article className="why">
                  <h2>
                    ¿Por qué elegir <span>{company.name}?</span>
                  </h2>
                  <p className="whySub">Acompanamiento tecnico con prevencion, trazabilidad y respuesta proactiva.</p>

                  {whyItems.map((control, idx) => (
                    <div className="whyRow" key={control.id}>
                      <WhyIcon index={idx} className="iconSvg whyIcon" />
                      <div>
                        <b>{control.name}</b>
                        <p>{control.summary}</p>
                      </div>
                    </div>
                  ))}
                </article>

                <aside className="touch">
                  <div className="touchTop">
                    <Image
                      src={touchImageSrc}
                      alt={PORTFOLIO_IMAGES.smart.alt}
                      fill
                      sizes="(max-width: 900px) 100vw, 40vw"
                      className="touchImage"
                      loading={isPrintMode ? "eager" : undefined}
                    />
                    <div className="touchTitle">
                      Contác<span>ta</span>nos
                    </div>
                  </div>

                  <div className="touchBody">
                    <div>
                      <div className="miniHead">Contáctanos</div>
                      <div className="contactList">
                        {contactRows.map((row) => (
                          <div className="contactRow" key={`${row.label}-${row.value}`}>
                            <ContactIcon label={row.label} className="iconSvg" />
                            <div>
                              <b>{row.value}</b>
                              <small>{row.label}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="miniHead">Síguenos</div>
                      <div className="follow">
                        {followRows.map((row) => (
                          <a
                            key={`${row.label}-${row.href}`}
                            className="socialLink"
                            href={row.href}
                            target={row.href.startsWith("http") ? "_blank" : undefined}
                            rel={row.href.startsWith("http") ? "noreferrer" : undefined}
                          >
                            <SocialLinkIcon label={row.label} className="socialIcon" />
                            {row.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .brochureRoot {
          --bg-950: ${palette.bg950};
          --bg-900: ${palette.bg900};
          --accent: ${accent};
          --accent-2: ${palette.accent2};
          --accent-rgb: ${palette.accentRgb};
          --accent-2-rgb: ${palette.accent2Rgb};
          --bg-soft-1: ${palette.bgSoft1};
          --bg-soft-2: ${palette.bgSoft2};
          --bg-soft-2-rgb: ${palette.bgSoft2Rgb};
          --bg-soft-3: ${palette.bgSoft3};
          --touch-1: ${palette.touch1};
          --touch-2: ${palette.touch2};
          --touch-3: ${palette.touch3};
          --why-accent: ${palette.whyAccent};
          --text: #eaf6ff;
          --muted: #a8c8e6;
          --ico: 24px;
          --ico-service: 34px;
          width: 100%;
          border-radius: 26px;
          background:
            radial-gradient(1200px 800px at 15% 10%, rgba(var(--accent-rgb), 0.16), transparent 60%),
            radial-gradient(900px 700px at 90% 20%, rgba(var(--accent-2-rgb), 0.14), transparent 55%),
            linear-gradient(180deg, var(--bg-950), var(--bg-900));
          color: var(--text);
          padding: 12px;
        }

        .toolbar {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 0 6px 10px;
        }

        .brandbar {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 220px;
        }

        .brandLogo {
          width: min(128px, 32vw);
          height: auto;
          object-fit: contain;
          flex: 0 0 auto;
        }

        .brandText {
          display: flex;
          flex-direction: column;
          line-height: 1.06;
        }

        .brandText strong {
          font-size: 13px;
          letter-spacing: 0.6px;
          font-weight: 900;
        }

        .brandText small {
          color: rgba(234, 246, 255, 0.72);
          font-size: 11px;
          letter-spacing: 0.2px;
        }

        .controls {
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: flex-end;
          width: auto;
          margin-left: auto;
        }

        .btn {
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
          color: var(--text);
          padding: 8px 12px;
          cursor: pointer;
          font-weight: 800;
          letter-spacing: 0.2px;
          display: inline-flex;
          gap: 8px;
          align-items: center;
          transition: transform 0.12s ease, background 0.12s ease, border-color 0.12s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(var(--accent-rgb), 0.28);
        }

        .btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
        }

        .toolbarIcon {
          width: 18px;
          height: 18px;
          flex: 0 0 auto;
        }

        .stage {
          width: 100%;
          aspect-ratio: ${pageAspect};
          position: relative;
          perspective: 1800px;
          overflow: hidden;
        }

        .stageScroll {
          aspect-ratio: auto;
          perspective: none;
          overflow: visible;
        }

        .book {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .bookScroll {
          height: auto;
          overflow: visible;
          display: grid;
          gap: 12px;
        }

        .page {
          position: absolute;
          inset: 0;
          overflow: hidden;
          transform-style: preserve-3d;
          opacity: 0;
          pointer-events: none;
        }

        .pageScroll {
          position: relative;
          inset: auto;
          overflow: hidden;
          transform: none !important;
          animation: none !important;
          transform-style: flat;
          opacity: 1;
          pointer-events: auto;
          aspect-ratio: ${pageAspect};
          min-height: 540px;
        }

        .page.is-active {
          opacity: 1;
          pointer-events: auto;
          z-index: 4;
        }

        .page.is-adjacent {
          opacity: 1;
          z-index: 3;
        }

        .turn-out-next {
          transform-origin: left center;
          animation: turnOutNext 0.75s cubic-bezier(0.22, 0.72, 0.15, 1) forwards;
        }

        .turn-in-next {
          transform-origin: left center;
          transform: rotateY(180deg);
          animation: turnInNext 0.75s cubic-bezier(0.22, 0.72, 0.15, 1) forwards;
        }

        .turn-out-prev {
          transform-origin: right center;
          animation: turnOutPrev 0.75s cubic-bezier(0.22, 0.72, 0.15, 1) forwards;
        }

        .turn-in-prev {
          transform-origin: right center;
          transform: rotateY(-180deg);
          animation: turnInPrev 0.75s cubic-bezier(0.22, 0.72, 0.15, 1) forwards;
        }

        .pageInner {
          position: relative;
          height: 100%;
        }

        .bgTech {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(900px 650px at 10% 10%, rgba(var(--accent-rgb), 0.18), transparent 55%),
            radial-gradient(750px 600px at 90% 18%, rgba(var(--accent-2-rgb), 0.14), transparent 55%),
            linear-gradient(180deg, var(--bg-soft-1), var(--bg-soft-2) 55%, var(--bg-soft-3));
        }

        .bgTech::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 20% 25%, rgba(255, 255, 255, 0.14) 1px, transparent 2px) 0 0 / 20px 20px,
            radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.1) 1px, transparent 2px) 0 0 / 26px 26px;
          opacity: 0.18;
          pointer-events: none;
        }

        .coverFull {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-rows: 1fr;
          background: linear-gradient(180deg, rgba(4, 31, 20, 0), rgba(4, 31, 20, 1));
        }

        .coverMedia {
          position: relative;
          height: 100%;
          overflow: hidden;
          margin: 0;
        }

        .coverImage {
          object-fit: cover;
          filter: contrast(1.02) saturate(1.05);
        }

        .coverTopLogoWrap {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          padding: 0;
          border: 0;
          background: transparent;
          backdrop-filter: none;
        }

        .coverTopLogo {
          width: min(260px, 58vw);
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.45));
        }

        .coverAnticimexWrap {
          position: absolute;
          right: 18px;
          bottom: 42px;
          z-index: 4;
          pointer-events: none;
        }

        .coverAnticimexLogo {
          width: min(170px, 36vw);
          height: auto;
          object-fit: contain;
          opacity: 0.96;
          filter: brightness(0) saturate(100%) invert(100%) drop-shadow(0 8px 18px rgba(0, 0, 0, 0.42));
        }

        .coverOverlay {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 26px 26px 22px;
          background: linear-gradient(
            180deg,
            rgba(4, 31, 20, 0) 0%,
            rgba(4, 31, 20, 0.28) 44%,
            rgba(4, 31, 20, 0.56) 82%,
            rgba(4, 31, 20, 0.72) 100%
          );
        }

        .coverTitle {
          margin: 0;
          font-size: clamp(34px, 5vw, 48px);
          line-height: 1.02;
          font-weight: 900;
          letter-spacing: -0.85px;
        }

        .coverSubtitle {
          margin: 7px 0 0;
          font-size: clamp(16px, 2.5vw, 22px);
          font-weight: 700;
          color: rgba(234, 246, 255, 0.92);
          letter-spacing: -0.2px;
        }

        .coverSubtitle span {
          color: var(--accent);
        }

        .coverKicker {
          margin: 9px 0 0;
          font-size: 13px;
          color: rgba(168, 200, 230, 0.95);
          max-width: 760px;
          line-height: 1.45;
        }

        .pad {
          position: relative;
          z-index: 2;
          padding: 26px;
        }

        .pageNum {
          position: absolute;
          bottom: 14px;
          right: 14px;
          font-weight: 900;
          color: rgba(234, 246, 255, 0.7);
          letter-spacing: 2px;
          font-size: 16px;
          z-index: 5;
          text-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
        }

        .sectionHead {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 14px;
        }

        .sectionHead h2 {
          margin: 0;
          font-size: clamp(32px, 5.4vw, 46px);
          font-weight: 950;
          letter-spacing: -0.8px;
          line-height: 1.05;
          text-transform: uppercase;
        }

        .hint {
          margin: 0;
          color: rgba(234, 246, 255, 0.72);
          font-size: 12px;
          text-align: right;
          max-width: 320px;
          line-height: 1.35;
        }

        .servicesGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          align-items: start;
        }

        .serviceBlock h3 {
          margin: 0 0 8px;
          font-size: 22px;
          font-weight: 950;
          letter-spacing: 0.1px;
          line-height: 1.1;
        }

        .serviceBlock > p {
          margin: 0 0 10px;
          font-size: 12px;
          color: rgba(234, 246, 255, 0.82);
          line-height: 1.45;
        }

        .serviceItemsGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 14px;
        }

        .serviceItem {
          display: grid;
          grid-template-columns: var(--ico-service) 1fr;
          gap: 14px;
          align-items: start;
          padding: 7px 0;
        }

        .serviceItem b {
          display: block;
          font-size: 13px;
          line-height: 1.3;
          margin-bottom: 2px;
        }

        .serviceItem small {
          display: -webkit-box;
          margin: 0;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-size: 11px;
          color: rgba(234, 246, 255, 0.76);
          line-height: 1.4;
        }

        .iconSvg {
          width: var(--ico);
          height: var(--ico);
          flex: 0 0 auto;
        }

        .iconService {
          width: var(--ico-service);
          height: var(--ico-service);
        }

        .clientsIntro {
          margin: 0 0 14px;
          font-size: 12px;
          color: rgba(234, 246, 255, 0.82);
          line-height: 1.5;
          max-width: 820px;
        }

        .clientsGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px 18px;
          margin-top: 12px;
          align-items: center;
        }

        .clientCell {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 10px;
          padding: 10px 0;
        }

        .clientLogo {
          width: 112px;
          height: 112px;
          position: relative;
          display: grid;
          place-items: center;
          background: transparent;
          color: rgba(234, 246, 255, 0.92);
          font-weight: 900;
          letter-spacing: 0.6px;
          box-shadow: none;
          overflow: hidden;
          padding: 12px;
          transition: transform 0.18s ease, filter 0.18s ease;
          transform-origin: center;
        }

        .clientLogoImage {
          object-fit: contain;
          padding: 2px;
        }

        .clientCell:hover .clientLogo {
          transform: scale(1.08);
          filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.24));
        }

        .clientName {
          font-weight: 900;
          letter-spacing: 0.2px;
          font-size: 13px;
          color: rgba(234, 246, 255, 0.92);
          line-height: 1.2;
        }

        .certPage {
          overflow: hidden;
        }

        .certPad {
          padding-bottom: clamp(170px, 24%, 220px);
        }

        .certGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px 20px;
          margin-top: 12px;
        }

        .certItem {
          display: grid;
          grid-template-columns: 96px 1fr;
          gap: 12px;
          align-items: center;
          min-width: 0;
        }

        .certLogo {
          position: relative;
          width: 96px;
          height: 64px;
          display: grid;
          place-items: center;
          background: transparent;
          color: rgba(234, 246, 255, 0.9);
          font-weight: 900;
          letter-spacing: 0.3px;
          overflow: hidden;
        }

        .certLogoImage {
          object-fit: contain;
        }

        .certItem h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 900;
          line-height: 1.2;
        }

        .certItem p {
          margin: 6px 0 0;
          font-size: 12px;
          color: rgba(234, 246, 255, 0.84);
          line-height: 1.4;
        }

        .certBottomMedia {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: clamp(165px, 30%, 225px);
          margin: 0;
          z-index: 1;
          overflow: hidden;
        }

        .certBottomImage {
          object-fit: cover;
          object-position: center 40%;
          filter: contrast(1.03) saturate(1.04);
        }

        .certBottomFade {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(var(--bg-soft-2-rgb), 0.96) 0%,
            rgba(var(--bg-soft-2-rgb), 0.78) 22%,
            rgba(var(--bg-soft-2-rgb), 0.34) 50%,
            rgba(var(--bg-soft-2-rgb), 0.08) 72%,
            rgba(var(--bg-soft-2-rgb), 0) 100%
          );
        }

        .p4 {
          display: grid;
          grid-template-columns: 56% 44%;
          gap: 18px;
          height: 100%;
          padding: 26px;
          position: relative;
          z-index: 2;
        }

        .why {
          position: relative;
          background: #0a3526;
          color: #eaf6ff;
          padding: 18px;
          overflow: hidden;
          isolation: isolate;
        }

        .why::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("/Images/confianza.jpg");
          background-size: cover;
          background-position: center;
          z-index: 0;
        }

        .why::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(7, 31, 21, 0.38) 0%, rgba(6, 28, 18, 0.72) 54%, rgba(5, 22, 15, 0.9) 100%);
          z-index: 0;
        }

        .why > * {
          position: relative;
          z-index: 1;
        }

        .why h2 {
          margin: 0;
          font-size: clamp(23px, 3vw, 30px);
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -0.45px;
        }

        .why h2 span {
          color: var(--accent);
        }

        .whySub {
          margin: 10px 0 0;
          color: rgba(234, 246, 255, 0.9);
          font-size: 14px;
          line-height: 1.45;
        }

        .whyRow {
          display: grid;
          grid-template-columns: var(--ico) 1fr;
          gap: 12px;
          padding: 9px 0;
          margin-top: 9px;
          align-items: start;
        }

        .whyIcon {
          color: rgba(234, 246, 255, 0.92);
        }

        .whyRow b {
          font-size: 13px;
          line-height: 1.25;
        }

        .whyRow p {
          margin: 3px 0 0;
          font-size: 13px;
          color: rgba(234, 246, 255, 0.9);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .touch {
          overflow: hidden;
          background: transparent;
        }

        .touchTop {
          position: relative;
          height: 44%;
          overflow: hidden;
        }

        .touchImage {
          object-fit: cover;
          filter: contrast(1.02) saturate(1.05);
        }

        .touchTop::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.58));
          pointer-events: none;
        }

        .touchTitle {
          position: absolute;
          left: 18px;
          bottom: 14px;
          font-weight: 900;
          font-size: clamp(30px, 4vw, 44px);
          letter-spacing: -0.8px;
          line-height: 1;
          text-shadow: 0 12px 25px rgba(0, 0, 0, 0.35);
          z-index: 1;
        }

        .touchTitle span {
          color: var(--accent);
        }

        .touchBody {
          padding: 14px 18px 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .miniHead {
          font-weight: 900;
          letter-spacing: 0.2px;
          margin-top: 2px;
          font-size: 12px;
        }

        .contactList {
          display: grid;
          gap: 10px;
          margin-top: 8px;
        }

        .contactRow {
          display: grid;
          grid-template-columns: var(--ico) 1fr;
          gap: 12px;
          align-items: start;
          padding: 0;
        }

        .contactRow b {
          font-size: 12px;
          line-height: 1.3;
          display: block;
        }

        .contactRow small {
          display: block;
          color: rgba(234, 246, 255, 0.78);
          margin-top: 2px;
          font-size: 11px;
        }

        .follow {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 6px;
        }

        .socialLink {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          color: rgba(234, 246, 255, 0.92);
          text-decoration: none;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.2px;
          border-bottom: 1px solid rgba(var(--accent-rgb), 0.22);
        }

        .socialIcon {
          width: 18px;
          height: 18px;
          flex: 0 0 auto;
        }

        .socialLink:hover {
          border-bottom-color: rgba(var(--accent-rgb), 0.5);
        }

        @keyframes turnOutNext {
          0% {
            transform: rotateY(0);
          }
          100% {
            transform: rotateY(-180deg);
          }
        }

        @keyframes turnInNext {
          0% {
            transform: rotateY(180deg);
          }
          100% {
            transform: rotateY(0);
          }
        }

        @keyframes turnOutPrev {
          0% {
            transform: rotateY(0);
          }
          100% {
            transform: rotateY(180deg);
          }
        }

        @keyframes turnInPrev {
          0% {
            transform: rotateY(-180deg);
          }
          100% {
            transform: rotateY(0);
          }
        }

        @media (max-width: 1024px) {
          .servicesGrid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .serviceItemsGrid {
            grid-template-columns: 1fr;
          }

          .clientsGrid {
            grid-template-columns: repeat(3, 1fr);
          }

          .certGrid {
            grid-template-columns: 1fr;
          }

          .p4 {
            grid-template-columns: 1fr;
            padding: 18px;
          }
        }

        @media (max-width: 860px) {
          .toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .controls {
            justify-content: flex-start;
            margin-left: 0;
          }

          .btn {
            padding: 8px 10px;
            font-size: 12px;
          }

          .clientsGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .sectionHead {
            flex-direction: column;
            align-items: flex-start;
          }

          .hint {
            max-width: none;
            text-align: left;
          }
        }

        @media (max-width: 620px) {
          .stage {
            aspect-ratio: ${pageAspect};
          }

          .pageScroll {
            aspect-ratio: ${pageAspect};
            min-height: 520px;
          }

          .pad {
            padding: 16px;
          }

          .clientsGrid {
            grid-template-columns: 1fr;
          }

          .coverOverlay {
            padding: 18px;
          }

          .coverTopLogoWrap {
            top: 10px;
            padding: 0;
          }

          .coverTopLogo {
            width: min(210px, 70vw);
          }

          .coverAnticimexWrap {
            right: 12px;
            bottom: 38px;
          }

          .coverAnticimexLogo {
            width: min(132px, 45vw);
          }

          .pageNum {
            bottom: 10px;
            right: 10px;
            font-size: 15px;
          }
        }

        @media print {
          @page {
            size: ${paperSpec.widthMm}mm ${paperSpec.heightMm}mm;
            margin: 0;
          }

          .brochureRoot,
          .brochureRoot * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            forced-color-adjust: none;
            box-shadow: none !important;
            text-shadow: none !important;
          }

          .coverImage,
          .coverTopLogo,
          .clientLogoImage,
          .certLogoImage,
          .certBottomImage,
          .touchImage {
            filter: none !important;
          }

          .coverOverlay {
            background: linear-gradient(
              180deg,
              rgba(4, 31, 20, 0) 0%,
              rgba(4, 31, 20, 0.3) 34%,
              rgba(4, 31, 20, 0.62) 72%,
              rgba(4, 31, 20, 0.86) 100%
            ) !important;
          }

          .coverAnticimexLogo {
            filter: brightness(0) saturate(100%) invert(100%) !important;
            opacity: 0.98 !important;
          }

          .bgTech {
            background: linear-gradient(180deg, var(--bg-soft-1), var(--bg-soft-2) 58%, var(--bg-soft-3)) !important;
          }

          .bgTech::before {
            display: none !important;
          }

          .touch {
            background: transparent !important;
          }

          .touchTop {
            background: transparent !important;
          }

          .touchTop::after {
            display: none !important;
          }

          .touchTitle {
            text-shadow: none !important;
          }

          .toolbar {
            display: none !important;
          }

          .brochureRoot {
            padding: 0 !important;
            border-radius: 0 !important;
            background: #fff !important;
          }

          .stage {
            width: ${paperSpec.widthMm}mm !important;
            aspect-ratio: auto !important;
            margin: 0 auto !important;
            perspective: none !important;
            overflow: visible !important;
          }

          .book {
            height: auto !important;
            overflow: visible !important;
          }

          .page {
            position: relative !important;
            inset: auto !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            transform: none !important;
            animation: none !important;
            height: ${paperSpec.heightMm}mm !important;
            min-height: ${paperSpec.heightMm}mm !important;
            background: #fff !important;
            break-after: page;
            page-break-after: always;
          }

          .pageInner {
            height: 100% !important;
            min-height: ${paperSpec.heightMm}mm !important;
          }

          .page:last-child {
            break-after: auto;
            page-break-after: auto;
          }

          .page.is-active,
          .page.is-adjacent {
            z-index: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
