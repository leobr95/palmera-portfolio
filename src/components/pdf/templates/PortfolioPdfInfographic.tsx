"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image as PdfImage,
} from "@react-pdf/renderer";

import type { PortfolioPdfProps } from "@/components/pdf/PortfolioPdf";
import { PORTFOLIO_IMAGES } from "@/lib/portafolio-images";
import { GENERIC_CLIENT_ID } from "@/lib/portfolio-client";
import type {
  Control,
  Service,
  ServiceCategory,
  RepresentativeClient,
} from "@/lib/mock-data";

/**
 * ✅ Nota:
 * - React-PDF puede fallar con WEBP/SVG. Si algún logo no carga, pásalo a PNG manteniendo la ruta.
 * - lineHeight acá se usa como multiplicador (1.15, 1.25...), NO como px.
 */

function publicAssetUrl(path: string): string {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof window === "undefined") return p;
  return new URL(p, window.location.origin).toString();
}

function takeTop<T>(arr: T[], n: number) {
  return arr.slice(0, Math.max(0, n));
}

function byCategory(services: Service[], cat: ServiceCategory) {
  return services.filter((s) => s.category === cat);
}

export function PortfolioPdfInfographic({
  company,
  client,
  title,
  subtitle,
  services,
  controls,
  // ✅ mismos logos que la web (sin blanco)
  logoPalmeraSrc = "/brand/palmera-junior.png",
  logoAnticimexSrc = "/brand/anticimex.png",
}: PortfolioPdfProps) {
  const accent = company.colors.palmeraGreen;
  const showClientMeta = client.id !== GENERIC_CLIENT_ID;

  const MAX_SERVICES_PER_CAT = 6;
  const MAX_CTRL_HIGHLIGHT = 4;
  const MAX_CTRL_OTHER = 4;
  const MAX_COVERAGE = 10;
  const MAX_REP_CLIENTS = 12;

  const palmeraLogo = publicAssetUrl(logoPalmeraSrc);
  const anticimexLogo = publicAssetUrl(logoAnticimexSrc);

  const clientLogo = client.logoSrc ? publicAssetUrl(client.logoSrc) : null;

  const heroImg = publicAssetUrl(PORTFOLIO_IMAGES.hero.src);

  const plagas = byCategory(services, "Plagas");
  const higiene = byCategory(services, "Higiene");
  const especializados = byCategory(services, "Especializados");

  const serviceBlocks = [
    {
      key: "Plagas",
      subtitle: "Control + prevención",
      img: publicAssetUrl(PORTFOLIO_IMAGES.services.plagas.src),
      list: plagas,
    },
    {
      key: "Higiene",
      subtitle: "Protocolos + desinfección",
      img: publicAssetUrl(PORTFOLIO_IMAGES.services.higiene.src),
      list: higiene,
    },
    {
      key: "Especializados",
      subtitle: "Complementarios",
      img: publicAssetUrl(PORTFOLIO_IMAGES.services.especializados.src),
      list: especializados,
    },
  ].filter((x) => x.list.length > 0);

  const highlightControls: Control[] = controls.filter((c) => Boolean(c.highlight));
  const otherControls: Control[] = controls.filter((c) => !c.highlight);

  const certs = company.certifications ?? [];
  const socials = company.socials ?? [];

  const coverageShown = takeTop(company.coverage ?? [], MAX_COVERAGE);
  const coverageMore = Math.max(0, (company.coverage ?? []).length - coverageShown.length);

  const repClients = (company.representativeClients ?? []) as RepresentativeClient[];
  const repShown = takeTop(repClients, MAX_REP_CLIENTS);

  // line-heights (multiplicadores)
  const LH_TIGHT = 1.12;
  const LH_NORMAL = 1.22;
  const LH_COMPACT = 1.16;

  const styles = StyleSheet.create({
    page: {
      padding: 24,
      fontSize: 9.2,
      color: company.colors.ink,
      backgroundColor: company.colors.paper,
    },

    // ===== HERO
    coverWrap: { borderRadius: 14, overflow: "hidden", position: "relative" },
    coverHero: { height: 180, width: "100%" },
    coverOverlay: {
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: company.colors.ink,
      opacity: 0.82,
    },
    coverGlowA: {
      position: "absolute",
      top: -55, left: -55,
      width: 250, height: 250,
      backgroundColor: accent,
      opacity: 0.24,
      borderRadius: 999,
    },
    coverGlowB: {
      position: "absolute",
      top: -60, right: -80,
      width: 240, height: 240,
      backgroundColor: "#FFFFFF",
      opacity: 0.08,
      borderRadius: 999,
    },
    coverContent: {
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      padding: 14,
    },
    coverTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    coverLeft: { flex: 1, paddingRight: 10 },

    chipRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
    chip: {
      backgroundColor: "rgba(255,255,255,.14)",
      borderRadius: 999,
      paddingVertical: 3,
      paddingHorizontal: 8,
      marginRight: 6,
      marginBottom: 6,
    },
    chipText: { fontSize: 8.0, color: "white", opacity: 0.92, lineHeight: LH_COMPACT },

    coverKicker: { fontSize: 8.0, color: "white", opacity: 0.85, marginTop: 2, lineHeight: LH_COMPACT },
    coverTitle: { fontSize: 21, fontWeight: 700, color: "white", marginTop: 5, lineHeight: LH_TIGHT },
    coverSub: { fontSize: 11.2, color: "white", opacity: 0.92, marginTop: 4, lineHeight: LH_NORMAL },
    coverTagline: { fontSize: 8.4, color: "white", opacity: 0.85, marginTop: 6, lineHeight: LH_NORMAL },
    coverSupport: { fontSize: 7.6, color: "white", opacity: 0.78, marginTop: 2, lineHeight: LH_NORMAL },

    // Logos stack
    logosCol: { alignItems: "flex-end" },
    logoPalmera: { width: 145, height: 38, objectFit: "contain" as const },
    empresaDe: { fontSize: 7.6, color: "white", opacity: 0.78, marginTop: 5, marginBottom: 5, lineHeight: LH_COMPACT },
    logoAnticimex: { width: 132, height: 26, objectFit: "contain" as const },

    // ===== SECTIONS
    section: { marginTop: 10 },
    sectionTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    sectionTitle: { fontSize: 12, fontWeight: 700, lineHeight: LH_TIGHT },
    sectionSub: { marginTop: 2, fontSize: 8.4, opacity: 0.82, lineHeight: LH_NORMAL },
    sectionChip: {
      backgroundColor: company.colors.muted,
      borderRadius: 999,
      paddingVertical: 3,
      paddingHorizontal: 8,
    },
    sectionChipText: { fontSize: 8.0, opacity: 0.85, lineHeight: LH_COMPACT },

    card: {
      borderWidth: 1,
      borderColor: "#E7E5E4",
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: "white",
    },
    cardPad: { padding: 9 },

    // Trayectoria split
    splitRow: { flexDirection: "row", marginTop: 8 },
    splitCol: { flex: 1 },
    splitGap: { width: 10 },

    splitHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    splitLogoRow: { flexDirection: "row", alignItems: "center" },
    splitDivider: { width: 1, height: 24, backgroundColor: "rgba(51,45,46,.10)", marginHorizontal: 8 },
    splitLabel: { fontSize: 7.8, fontWeight: 700, opacity: 0.7, textTransform: "uppercase" as const, lineHeight: LH_COMPACT },
    splitBar: { height: 3, width: 54, borderRadius: 99 },

    paraTight: { marginTop: 6, fontSize: 8.4, opacity: 0.86, lineHeight: LH_NORMAL },

    bulletRow: { flexDirection: "row", marginTop: 5 },
    bulletMark: { width: 12, fontSize: 10, fontWeight: 700, lineHeight: LH_COMPACT },
    bulletText: { flex: 1, fontSize: 8.4, opacity: 0.86, lineHeight: LH_NORMAL },

    noteBox: {
      marginTop: 8,
      borderRadius: 12,
      padding: 8,
      backgroundColor: company.colors.muted,
      borderWidth: 1,
      borderColor: "#E7E5E4",
    },
    noteKicker: { fontSize: 7.6, fontWeight: 700, opacity: 0.7, textTransform: "uppercase" as const, lineHeight: LH_COMPACT },
    noteText: { fontSize: 8.4, opacity: 0.86, marginTop: 2, lineHeight: LH_NORMAL },

    // ===== GRANDES MARCAS
    brandsWrap: {
      marginTop: 9,
      borderWidth: 1,
      borderColor: "#E7E5E4",
      borderRadius: 12,
      padding: 9,
      backgroundColor: "white",
    },
    brandsTitle: { fontSize: 12, fontWeight: 700, lineHeight: LH_TIGHT },
    brandsSub: { fontSize: 8.4, opacity: 0.82, marginTop: 2, lineHeight: LH_NORMAL },

    brandsGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
    brandCell: {
      width: 120,
      height: 40,
      marginRight: 8,
      marginBottom: 8,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    brandLogo: { width: 112, height: 34, objectFit: "contain" as const },

    // ===== PAGE 2 LAYOUT
    body: { marginTop: 12, flexDirection: "row" },
    colLeft: { flex: 1.12, paddingRight: 10 },
    colRight: { flex: 0.88 },

    cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    cardTitle: { fontSize: 11.2, fontWeight: 700, lineHeight: LH_TIGHT },
    chipNeutral: {
      backgroundColor: company.colors.muted,
      borderRadius: 999,
      paddingVertical: 3,
      paddingHorizontal: 8,
    },
    chipNeutralText: { fontSize: 8.0, opacity: 0.85, lineHeight: LH_COMPACT },

    bgWrap: { position: "relative" },
    bgImage: { position: "absolute", top: 0, left: 0, right: 0, height: 78, objectFit: "cover" as const },
    bgShade: { position: "absolute", top: 0, left: 0, right: 0, height: 78, backgroundColor: company.colors.ink, opacity: 0.45 },
    bgHeader: { height: 78, padding: 9, justifyContent: "flex-end" },
    bgHeaderTitle: { color: "white", fontSize: 11.0, fontWeight: 700, lineHeight: LH_TIGHT },
    bgHeaderSub: { color: "white", fontSize: 8.2, opacity: 0.9, marginTop: 1, lineHeight: LH_NORMAL },

    item: { marginTop: 5 },
    itemName: { fontSize: 9.4, fontWeight: 700, lineHeight: LH_COMPACT },
    itemSummary: { fontSize: 8.1, opacity: 0.85, lineHeight: LH_NORMAL },

    // Certs
    cert: {
      width: "100%",
      borderWidth: 1,
      borderColor: "#E7E5E4",
      borderRadius: 12,
      padding: 8,
      flexDirection: "row",
    },
    certLogoBox: {
      width: 34,
      height: 34,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#E7E5E4",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "white",
    },
    certLogo: { width: 22, height: 22, objectFit: "contain" as const },
    certName: { fontSize: 9.1, fontWeight: 700, lineHeight: LH_COMPACT },
    certDesc: { fontSize: 7.9, opacity: 0.85, marginTop: 2, lineHeight: LH_NORMAL },

    // Coverage pills
    pillRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
    pill: {
      backgroundColor: company.colors.muted,
      borderRadius: 999,
      paddingVertical: 3,
      paddingHorizontal: 8,
      marginRight: 6,
      marginBottom: 6,
    },
    pillText: { fontSize: 8.0, lineHeight: LH_COMPACT },

    // CTA + Social
    cta: {
      marginTop: 7,
      borderRadius: 12,
      padding: 9,
      backgroundColor: company.colors.muted,
      borderWidth: 1,
      borderColor: "#E7E5E4",
    },
    ctaTitle: { fontSize: 10.0, fontWeight: 700, lineHeight: LH_TIGHT },
    ctaText: { fontSize: 8.1, opacity: 0.85, marginTop: 2, lineHeight: LH_NORMAL },
    socialLine: { marginTop: 5, fontSize: 8.1, lineHeight: LH_NORMAL },

    footer: {
      marginTop: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    footerText: { fontSize: 7.6, opacity: 0.7, lineHeight: LH_NORMAL },
    footerLogos: { flexDirection: "row", alignItems: "center" },
  });

  return (
    <Document>
      {/* ================= PAGE 1 ================= */}
      <Page size="A4" style={styles.page} wrap={false}>
        {/* HERO */}
        <View style={styles.coverWrap}>
          <PdfImage src={heroImg} style={styles.coverHero} />
          <View style={styles.coverOverlay} />
          <View style={styles.coverGlowA} />
          <View style={styles.coverGlowB} />

          <View style={styles.coverContent}>
            <View style={styles.coverTop}>
              <View style={styles.coverLeft}>
              

                <Text style={styles.coverKicker}>{company.name}</Text>
                <Text style={styles.coverTitle}>{title}</Text>

                <Text style={styles.coverSub}>
                  {showClientMeta ? (
                    <>
                      {subtitle} <Text style={{ fontWeight: 700 }}>{client.name}</Text>
                    </>
                  ) : (
                    subtitle
                  )}
                </Text>

                {showClientMeta ? (
                  <View style={styles.chipRow}>
                    {client.industry ? (
                      <View style={styles.chip}><Text style={styles.chipText}>{client.industry}</Text></View>
                    ) : null}
                    {client.city ? (
                      <View style={styles.chip}><Text style={styles.chipText}>{client.city}</Text></View>
                    ) : null}
                  </View>
                ) : null}

                {showClientMeta && clientLogo ? (
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <Text style={{ fontSize: 8.2, color: "white", opacity: 0.9, fontWeight: 700, lineHeight: LH_COMPACT }}>
                      Cliente:
                    </Text>
                    <PdfImage
                      src={clientLogo}
                      style={{ width: 140, height: 22, objectFit: "contain" as const, marginLeft: 6 }}
                    />
                  </View>
                ) : null}

                <View style={{ height: 3, width: 92, backgroundColor: accent, marginTop: 7, borderRadius: 99 }} />
                <Text style={styles.coverTagline}>{company.tagline}</Text>
                <Text style={styles.coverSupport}>{company.supportLine}</Text>
              </View>

              {/* Logos vertical (mismos assets que web) */}
              <View style={styles.logosCol}>
                <PdfImage src={palmeraLogo} style={styles.logoPalmera} />
                <Text style={styles.empresaDe}>Una empresa de</Text>
                <PdfImage src={anticimexLogo} style={styles.logoAnticimex} />
              </View>
            </View>
          </View>
        </View>

        {/* TRAYECTORIA */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View>
              <Text style={styles.sectionTitle}>Trayectoria y experiencia</Text>
              <Text style={styles.sectionSub}>
                Palmera Junior (operación local) + respaldo Anticimex (mejores prácticas y enfoque preventivo).
              </Text>
            </View>
            <View style={styles.sectionChip}>
              <Text style={styles.sectionChipText}>Evidencias + plan de acción</Text>
            </View>
          </View>

          <View style={styles.splitRow}>
            {/* Palmera */}
            <View style={[styles.card, styles.splitCol]}>
              <View style={styles.cardPad}>
                <View style={styles.splitHead}>
                  <View style={styles.splitLogoRow}>
                    <PdfImage src={palmeraLogo} style={{ width: 96, height: 24, objectFit: "contain" as const }} />
                    <View style={styles.splitDivider} />
                    <Text style={styles.splitLabel}>Operación local</Text>
                  </View>
                  <View style={[styles.splitBar, { backgroundColor: accent }]} />
                </View>

                <Text style={styles.paraTight}>
                  Enfoque preventivo (MIP) con ejecución controlada, evidencias y recomendaciones para reducir riesgo.
                </Text>

                <View style={styles.bulletRow}>
                  <Text style={[styles.bulletMark, { color: accent }]}>✓</Text>
                  <Text style={styles.bulletText}>Diagnóstico + plan + ejecución + seguimiento (trazable y auditable).</Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={[styles.bulletMark, { color: accent }]}>✓</Text>
                  <Text style={styles.bulletText}>Tecnología aplicada y personal capacitado para el control del riesgo.</Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={[styles.bulletMark, { color: accent }]}>✓</Text>
                  <Text style={styles.bulletText}>Programas alineados a higiene, inocuidad y calidad (según alcance).</Text>
                </View>

                <View style={styles.noteBox}>
                  <Text style={styles.noteKicker}>En la práctica</Text>
                  <Text style={styles.noteText}>
                    Menos incidentes, mejor control del riesgo y evidencia clara para SST, Calidad y Operaciones.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.splitGap} />

            {/* Anticimex */}
            <View style={[styles.card, styles.splitCol]}>
              <View style={styles.cardPad}>
                <View style={styles.splitHead}>
                  <View style={styles.splitLogoRow}>
                    <PdfImage src={anticimexLogo} style={{ width: 110, height: 24, objectFit: "contain" as const }} />
                    <View style={styles.splitDivider} />
                    <Text style={styles.splitLabel}>Respaldo global</Text>
                  </View>
                  <View style={[styles.splitBar, { backgroundColor: company.colors.ink }]} />
                </View>

                <Text style={styles.paraTight}>
                  Metodologías, estándares y mejores prácticas de una plataforma internacional enfocada en prevención.
                </Text>

                <View style={styles.bulletRow}>
                  <Text style={[styles.bulletMark, { color: company.colors.ink }]}>✓</Text>
                  <Text style={styles.bulletText}>Know-how internacional aplicado a la operación local.</Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={[styles.bulletMark, { color: company.colors.ink }]}>✓</Text>
                  <Text style={styles.bulletText}>Innovación: monitoreo y soluciones inteligentes (según disponibilidad).</Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={[styles.bulletMark, { color: company.colors.ink }]}>✓</Text>
                  <Text style={styles.bulletText}>Servicio más consistente, medible y preparado para auditorías exigentes.</Text>
                </View>

                <View style={[styles.noteBox, { backgroundColor: "white" }]}>
                  <Text style={styles.noteKicker}>Resultado</Text>
                  <Text style={styles.noteText}>
                    Un servicio más robusto para industrias con requerimientos altos de higiene, evidencia y control.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* GRANDES MARCAS */}
          {repShown.length > 0 ? (
            <View style={styles.brandsWrap}>
              <Text style={{ fontSize: 8.6, opacity: 0.75, lineHeight: LH_COMPACT }}>Con la confianza de</Text>
              <Text style={styles.brandsTitle}>Grandes marcas</Text>
              <Text style={styles.brandsSub}>
                Clientes representativos que han confiado en nuestro trabajo (según alcance).
              </Text>

              <View style={styles.brandsGrid}>
                {repShown.map((x) => {
                  const logo = x.logoSrc ? publicAssetUrl(x.logoSrc) : null;
                  return (
                    <View key={x.id} style={styles.brandCell}>
                      {logo ? (
                        <PdfImage src={logo} style={styles.brandLogo} />
                      ) : (
                        <Text style={{ fontSize: 8.6, fontWeight: 700, opacity: 0.7, textAlign: "center", lineHeight: LH_NORMAL }}>
                          {x.name}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>
      </Page>

      {/* ================= PAGE 2 ================= */}
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.body}>
          {/* LEFT: SERVICES */}
          <View style={styles.colLeft}>
            <View style={styles.card}>
              <View style={styles.cardPad}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>Servicios escogidos para ti</Text>
                  <View style={styles.chipNeutral}>
                    <Text style={styles.chipNeutralText}>Impacto en tu operación</Text>
                  </View>
                </View>
                <Text style={{ marginTop: 3, fontSize: 8.1, opacity: 0.82, lineHeight: LH_NORMAL }}>
                  Seleccionamos lo más relevante para tu necesidad (portafolio personalizable).
                </Text>
              </View>

              <View style={{ padding: 10, paddingTop: 0 }}>
                {serviceBlocks.map((block) => {
                  const shown = takeTop(block.list, MAX_SERVICES_PER_CAT);
                  return (
                    <View key={block.key} style={[styles.card, { marginTop: 8 }]}>
                      <View style={styles.bgWrap}>
                        <PdfImage src={block.img} style={styles.bgImage} />
                        <View style={styles.bgShade} />
                        <View style={styles.bgHeader}>
                          <Text style={styles.bgHeaderTitle}>{block.key}</Text>
                          <Text style={styles.bgHeaderSub}>{block.subtitle}</Text>
                        </View>
                      </View>

                      <View style={styles.cardPad}>
                        {shown.map((s) => (
                          <View key={s.id} style={styles.item}>
                            <Text style={styles.itemName}>{s.name}</Text>
                            <Text style={styles.itemSummary}>{s.summary}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* RIGHT: CONTROLS + CERTS + COVERAGE + SOCIAL */}
          <View style={styles.colRight}>
            <View style={styles.card}>
              <View style={styles.cardPad}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>Controles y diferenciales</Text>
                  <View style={styles.chipNeutral}>
                    <Text style={styles.chipNeutralText}>Evidencias + seguimiento</Text>
                  </View>
                </View>

                {takeTop(highlightControls, MAX_CTRL_HIGHLIGHT).map((c) => (
                  <View key={c.id} style={styles.item}>
                    <Text style={styles.itemName}>{c.name} ★</Text>
                    <Text style={styles.itemSummary}>{c.summary}</Text>
                  </View>
                ))}

                {takeTop(otherControls, MAX_CTRL_OTHER).map((c) => (
                  <View key={c.id} style={styles.item}>
                    <Text style={styles.itemName}>{c.name}</Text>
                    <Text style={styles.itemSummary}>{c.summary}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Certificaciones */}
            <View style={[styles.card, { marginTop: 10 }]}>
              <View style={styles.cardPad}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>Certificaciones</Text>
                  <View style={styles.chipNeutral}>
                    <Text style={styles.chipNeutralText}>Cumplimiento</Text>
                  </View>
                </View>

                {certs.map((cert) => {
                  const logo = cert.logoSrc ? publicAssetUrl(cert.logoSrc) : null;
                  return (
                    <View key={cert.id} style={[styles.cert, { marginTop: 8 }]}>
                      <View style={styles.certLogoBox}>
                        {logo ? (
                          <PdfImage src={logo} style={styles.certLogo} />
                        ) : (
                          <Text style={{ fontSize: 8.2, fontWeight: 700, lineHeight: LH_COMPACT }}>
                            {cert.name.slice(0, 2).toUpperCase()}
                          </Text>
                        )}
                      </View>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.certName}>{cert.name}</Text>
                        <Text style={styles.certDesc}>{cert.description}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Cobertura + CTA + Socials */}
            <View style={[styles.card, { marginTop: 10 }]}>
              <View style={styles.cardPad}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>Cobertura</Text>
                  <View style={styles.chipNeutral}>
                    <Text style={styles.chipNeutralText}>Disponibilidad</Text>
                  </View>
                </View>

                <View style={styles.pillRow}>
                  {coverageShown.map((city) => (
                    <View key={city} style={styles.pill}>
                      <Text style={styles.pillText}>{city}</Text>
                    </View>
                  ))}
                  {coverageMore > 0 ? (
                    <View style={styles.pill}>
                      <Text style={styles.pillText}>+{coverageMore}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.cta}>
                  <Text style={styles.ctaTitle}>Siguiente paso</Text>
                  <Text style={styles.ctaText}>
                    Agendemos diagnóstico y definimos plan preventivo, evidencias y cronograma.
                  </Text>

                  {takeTop(socials, 3).map((s) => (
                    <Text key={s.label} style={styles.socialLine}>
                      <Text style={{ fontWeight: 700 }}>{s.label}: </Text>
                      {s.value}
                    </Text>
                  ))}
                </View>

                {socials.length > 0 ? (
                  <View style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 9.2, fontWeight: 700, lineHeight: LH_TIGHT }}>Redes / contacto</Text>
                    {socials.map((s) => (
                      <Text key={s.label} style={{ fontSize: 8.1, opacity: 0.85, marginTop: 2, lineHeight: LH_NORMAL }}>
                        <Text style={{ fontWeight: 700 }}>{s.label}: </Text>
                        {s.value}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Portafolio personalizado para {client.name} • {company.name}
          </Text>
          <View style={styles.footerLogos}>
            <PdfImage
              src={palmeraLogo}
              style={{ width: 110, height: 26, objectFit: "contain" as const, marginRight: 10 }}
            />
            <PdfImage
              src={anticimexLogo}
              style={{ width: 95, height: 20, objectFit: "contain" as const }}
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}
