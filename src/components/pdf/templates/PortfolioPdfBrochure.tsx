"use client";

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
  RepresentativeClient,
  Service,
  ServiceCategory,
  SocialLink,
} from "@/lib/mock-data";

type BrochureTheme = {
  bg950: string;
  bg900: string;
  panel: string;
  accent: string;
  accentSoft: string;
  textSoft: string;
};

const CATEGORY_COPY: Record<ServiceCategory, string> = {
  Plagas: "Control preventivo y correctivo para entornos sensibles.",
  Higiene: "Protocolos de desinfeccion y mantenimiento sanitario.",
  Especializados: "Servicios tecnicos para riesgos de alta complejidad.",
};

function publicAssetUrl(path: string): string {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof window === "undefined") return p;
  return new URL(p, window.location.origin).toString();
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase() ?? "")
    .join("");
}

function shortText(value: string, max = 120) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}...`;
}

function groupServices(services: Service[]) {
  const map = new Map<ServiceCategory, Service[]>();
  for (const s of services) {
    const curr = map.get(s.category) ?? [];
    curr.push(s);
    map.set(s.category, curr);
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
}

function brochureTheme(variant: PortfolioPdfProps["variant"]): BrochureTheme {
  if (variant === "brochure_alt") {
    return {
      bg950: "#081e2c",
      bg900: "#0b2b3f",
      panel: "#11354d",
      accent: "#3bd5ff",
      accentSoft: "rgba(59, 213, 255, .18)",
      textSoft: "#c9e6f8",
    };
  }

  return {
    bg950: "#041f14",
    bg900: "#062a1b",
    panel: "#0a3a28",
    accent: "#2ee88e",
    accentSoft: "rgba(46, 232, 142, .18)",
    textSoft: "#c9e3d8",
  };
}

export function PortfolioPdfBrochure({
  company,
  client,
  title,
  subtitle,
  services,
  controls,
  variant,
  logoPalmeraSrc = "/brand/palmera-junior.webp",
}: PortfolioPdfProps) {
  const theme = brochureTheme(variant);
  const showClientMeta = client.id !== GENERIC_CLIENT_ID;

  const palmeraLogo = publicAssetUrl(logoPalmeraSrc);
  const heroImg = publicAssetUrl(PORTFOLIO_IMAGES.hero.src);
  const touchImg = publicAssetUrl(PORTFOLIO_IMAGES.smart.src);

  const serviceGroups = groupServices(services);
  const whyItems = controls.slice(0, 4);

  const representativeClients = ((company.representativeClients ?? []) as RepresentativeClient[]).slice(0, 8);
  const clientList = representativeClients.length
    ? representativeClients
    : [{ id: client.id, name: client.name, logoSrc: client.logoSrc }];

  const socials = company.socials ?? [];
  const contactRows: SocialLink[] = [
    ...socials.slice(0, 3),
    {
      label: "Ubicacion",
      value: client.city || company.coverage[0] || "Colombia",
      href: "#",
    },
  ];

  const styles = StyleSheet.create({
    page: {
      padding: 22,
      fontSize: 10,
      color: "#eaf6ff",
      backgroundColor: theme.bg950,
    },

    topLogoWrap: {
      alignItems: "center",
      marginBottom: 10,
    },
    topLogo: {
      width: 210,
      height: 62,
      objectFit: "contain",
    },

    heroWrap: {
      position: "relative",
      borderRadius: 12,
      overflow: "hidden",
      height: 276,
    },
    heroImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    heroShade: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.bg900,
      opacity: 0.58,
    },
    heroGlow: {
      position: "absolute",
      top: -80,
      left: -90,
      width: 260,
      height: 260,
      borderRadius: 999,
      backgroundColor: theme.accent,
      opacity: 0.2,
    },
    heroContent: {
      position: "absolute",
      left: 20,
      right: 20,
      bottom: 18,
    },
    heroTitle: {
      fontSize: 34,
      fontWeight: 800,
      lineHeight: 1.06,
    },
    heroSubtitle: {
      marginTop: 6,
      fontSize: 16,
      opacity: 0.95,
      lineHeight: 1.2,
    },
    heroKicker: {
      marginTop: 8,
      fontSize: 11,
      color: theme.textSoft,
      lineHeight: 1.35,
    },

    pageNum: {
      position: "absolute",
      top: 16,
      right: 18,
      fontSize: 13,
      color: "rgba(234, 246, 255, .60)",
      fontWeight: 700,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: 800,
      lineHeight: 1.12,
    },
    sectionHint: {
      marginTop: 4,
      fontSize: 9,
      color: theme.textSoft,
    },

    servicesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 12,
      marginLeft: -4,
      marginRight: -4,
    },
    serviceCard: {
      width: "50%",
      paddingLeft: 4,
      paddingRight: 4,
      marginBottom: 8,
    },
    serviceCardInner: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,.12)",
      padding: 10,
      minHeight: 124,
      backgroundColor: "rgba(255,255,255,.03)",
    },
    serviceTitle: {
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 3,
    },
    serviceDesc: {
      fontSize: 8.7,
      color: theme.textSoft,
      marginBottom: 6,
      lineHeight: 1.3,
    },
    serviceLine: {
      marginBottom: 4,
      fontSize: 8.8,
      lineHeight: 1.28,
    },

    clientsIntro: {
      marginTop: 7,
      fontSize: 9.4,
      color: theme.textSoft,
      lineHeight: 1.4,
      maxWidth: 430,
    },
    clientsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 12,
      marginLeft: -6,
      marginRight: -6,
    },
    clientCell: {
      width: "25%",
      paddingLeft: 6,
      paddingRight: 6,
      marginBottom: 12,
      alignItems: "center",
    },
    clientLogoBox: {
      width: 68,
      height: 68,
      borderRadius: 8,
      backgroundColor: theme.panel,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,.14)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    clientLogo: {
      width: 54,
      height: 42,
      objectFit: "contain",
    },
    clientInitials: {
      fontSize: 17,
      fontWeight: 700,
      color: theme.accent,
    },
    clientName: {
      fontSize: 8.6,
      textAlign: "center",
      lineHeight: 1.2,
    },

    p4Row: {
      flexDirection: "row",
      marginTop: 10,
    },
    whyCol: {
      width: "56%",
      paddingRight: 6,
    },
    touchCol: {
      width: "44%",
      paddingLeft: 6,
    },
    whiteCard: {
      backgroundColor: "#f3f7fb",
      borderRadius: 10,
      padding: 12,
    },
    whyTitle: {
      color: "#0c2c45",
      fontSize: 18,
      fontWeight: 800,
      lineHeight: 1.12,
    },
    whySubtitle: {
      marginTop: 5,
      color: "#4e6880",
      fontSize: 8.8,
      lineHeight: 1.35,
    },
    whyItem: {
      marginTop: 8,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: "rgba(12,44,69,.10)",
    },
    whyItemTitle: {
      color: "#0c2c45",
      fontSize: 9.2,
      fontWeight: 700,
      lineHeight: 1.2,
    },
    whyItemText: {
      marginTop: 2,
      color: "#4e6880",
      fontSize: 8.3,
      lineHeight: 1.3,
    },

    touchCard: {
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: theme.panel,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,.12)",
    },
    touchTop: {
      position: "relative",
      height: 96,
    },
    touchTopImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    touchShade: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.bg900,
      opacity: 0.45,
    },
    touchTitle: {
      position: "absolute",
      left: 10,
      bottom: 8,
      color: "white",
      fontSize: 16,
      fontWeight: 800,
    },
    touchBody: {
      padding: 10,
    },
    touchHead: {
      fontSize: 9.5,
      fontWeight: 700,
      marginBottom: 6,
    },
    contactRow: {
      marginBottom: 5,
    },
    contactValue: {
      fontSize: 8.8,
      fontWeight: 700,
      lineHeight: 1.2,
    },
    contactLabel: {
      fontSize: 8,
      color: theme.textSoft,
      marginTop: 1,
      lineHeight: 1.2,
    },
    followRow: {
      marginTop: 6,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,.12)",
    },
    followLink: {
      fontSize: 8.4,
      marginBottom: 3,
      color: "#eaf6ff",
    },

    footerLine: {
      marginTop: 10,
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,.13)",
      paddingTop: 7,
      fontSize: 8.4,
      color: theme.textSoft,
      textAlign: "center",
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.topLogoWrap}>
          <PdfImage src={palmeraLogo} style={styles.topLogo} />
        </View>

        <View style={styles.heroWrap}>
          <PdfImage src={heroImg} style={styles.heroImage} />
          <View style={styles.heroShade} />
          <View style={styles.heroGlow} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{title}</Text>
            <Text style={styles.heroSubtitle}>
              {subtitle}
              {showClientMeta ? ` ${client.name}` : ""}
            </Text>
            <Text style={styles.heroKicker}>{company.tagline}</Text>
          </View>
        </View>

        <Text style={styles.footerLine}>{company.supportLine}</Text>
      </Page>

      <Page size="A4" style={styles.page} wrap={false}>
        <Text style={styles.pageNum}>02</Text>
        <Text style={styles.sectionTitle}>Servicios</Text>
        <Text style={styles.sectionHint}>Formato brochure: bloques por categoria con resumen ejecutivo.</Text>

        <View style={styles.servicesGrid}>
          {serviceGroups.map((group) => (
            <View key={group.category} style={styles.serviceCard}>
              <View style={styles.serviceCardInner}>
                <Text style={styles.serviceTitle}>{group.category}</Text>
                <Text style={styles.serviceDesc}>{CATEGORY_COPY[group.category]}</Text>
                {group.items.slice(0, 5).map((service) => (
                  <Text key={service.id} style={styles.serviceLine}>
                    • {service.name}: {shortText(service.summary, 80)}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </Page>

      <Page size="A4" style={styles.page} wrap={false}>
        <Text style={styles.pageNum}>03</Text>
        <Text style={styles.sectionTitle}>Nuestros Clientes</Text>
        <Text style={styles.clientsIntro}>
          Empresas que han confiado en nuestros programas de prevencion, control y mejora continua.
        </Text>

        <View style={styles.clientsGrid}>
          {clientList.map((item) => (
            <View key={item.id} style={styles.clientCell}>
              <View style={styles.clientLogoBox}>
                {item.logoSrc ? (
                  <PdfImage src={publicAssetUrl(item.logoSrc)} style={styles.clientLogo} />
                ) : (
                  <Text style={styles.clientInitials}>{initials(item.name)}</Text>
                )}
              </View>
              <Text style={styles.clientName}>{item.name}</Text>
            </View>
          ))}
        </View>
      </Page>

      <Page size="A4" style={styles.page} wrap={false}>
        <Text style={styles.pageNum}>04</Text>
        <Text style={styles.sectionTitle}>Why Choose {company.name}?</Text>

        <View style={styles.p4Row}>
          <View style={styles.whyCol}>
            <View style={styles.whiteCard}>
              <Text style={styles.whyTitle}>Operacion proactiva y con evidencia</Text>
              <Text style={styles.whySubtitle}>
                Un equipo tecnico enfocado en continuidad operativa, cumplimiento y riesgo controlado.
              </Text>

              {whyItems.map((control) => (
                <View key={control.id} style={styles.whyItem}>
                  <Text style={styles.whyItemTitle}>{control.name}</Text>
                  <Text style={styles.whyItemText}>{shortText(control.summary, 120)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.touchCol}>
            <View style={styles.touchCard}>
              <View style={styles.touchTop}>
                <PdfImage src={touchImg} style={styles.touchTopImage} />
                <View style={styles.touchShade} />
                <Text style={styles.touchTitle}>Get in Touch</Text>
              </View>

              <View style={styles.touchBody}>
                <Text style={styles.touchHead}>Contacto</Text>
                {contactRows.map((row) => (
                  <View key={`${row.label}-${row.value}`} style={styles.contactRow}>
                    <Text style={styles.contactValue}>{row.value}</Text>
                    <Text style={styles.contactLabel}>{row.label}</Text>
                  </View>
                ))}

                <View style={styles.followRow}>
                  <Text style={styles.touchHead}>Follow Us</Text>
                  {socials.slice(0, 4).map((row) => (
                    <Text key={`${row.label}-${row.href}`} style={styles.followLink}>
                      {row.label}: {row.value}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
