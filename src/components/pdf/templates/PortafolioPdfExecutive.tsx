"use client";

import { Document, Page, Text, View, StyleSheet, Image as PdfImage } from "@react-pdf/renderer";
import type { PortfolioPdfProps } from "@/components/pdf/PortfolioPdf";

function publicAssetUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof window === "undefined") return p;
  return new URL(p, window.location.origin).toString();
}

export function PortfolioPdfExecutive({
  company,
  client,
  title,
  subtitle,
  services,
  controls,
  logoPalmeraSrc = "/brand/palmera-junior.webp",
  logoAnticimexSrc = "/brand/anticimex.png",
}: PortfolioPdfProps) {
  const palmeraLogo = publicAssetUrl(logoPalmeraSrc);
  const anticimexLogo = publicAssetUrl(logoAnticimexSrc);

  const styles = StyleSheet.create({
    page: { padding: 32, fontSize: 11, color: company.colors.ink },
    cover: { padding: 18, borderRadius: 12, backgroundColor: company.colors.ink, color: "white" },
    topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },

    logoBox: { backgroundColor: "white", padding: 8, borderRadius: 10 },
    logoPalmera: { width: 170, height: 48, objectFit: "contain" },
    logoAnticimex: { width: 130, height: 30, objectFit: "contain", marginTop: 8 },

    h1: { fontSize: 22, fontWeight: 700 },
    h2: { fontSize: 12, marginTop: 6, opacity: 0.9 },

    section: { marginTop: 18 },
    sectionTitle: { fontSize: 14, fontWeight: 700, marginBottom: 8 },

    card: { borderWidth: 1, borderColor: "#E7E5E4", borderRadius: 10, padding: 10, marginBottom: 8 },
    itemTitle: { fontSize: 11, fontWeight: 700 },
    itemText: { fontSize: 10, marginTop: 3, opacity: 0.85 },

    pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    pill: { borderWidth: 1, borderColor: "#E7E5E4", borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8 },
    pillText: { fontSize: 10 },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Portada */}
        <View style={styles.cover}>
          <View style={styles.topRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ fontSize: 10, opacity: 0.85 }}>{company.name}</Text>
              <Text style={[styles.h1, { marginTop: 6 }]}>{title}</Text>
              <Text style={styles.h2}>
                {subtitle} {client.name}
              </Text>
              <Text style={{ marginTop: 10, fontSize: 10, opacity: 0.85 }}>{company.tagline}</Text>
              <Text style={{ marginTop: 4, fontSize: 9, opacity: 0.8 }}>{company.supportLine}</Text>
            </View>

            <View style={styles.logoBox}>
              <PdfImage src={palmeraLogo} style={styles.logoPalmera} />
              <PdfImage src={anticimexLogo} style={styles.logoAnticimex} />
            </View>
          </View>
        </View>

        {/* 2) Trayectoria */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trayectoria y experiencia</Text>
          <View style={styles.card}>
            <Text style={styles.itemText}>
              Propuesta orientada a prevención, continuidad operativa y cumplimiento, ajustable por industria.
            </Text>
            <Text style={[styles.itemTitle, { marginTop: 8 }]}>Clientes representativos</Text>
            <Text style={styles.itemText}>{company.representativeClients.join(", ")}</Text>
          </View>
        </View>

        {/* 3) Servicios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicios ofrecidos</Text>
          {services.map((s) => (
            <View key={s.id} style={styles.card}>
              <Text style={styles.itemTitle}>{s.name}</Text>
              <Text style={styles.itemText}>{s.summary}</Text>
              <Text style={[styles.itemText, { marginTop: 4 }]}>Categoría: {s.category}</Text>
            </View>
          ))}
        </View>

        {/* 4) Controles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controles y diferenciales</Text>
          {controls.map((c) => (
            <View key={c.id} style={styles.card}>
              <Text style={styles.itemTitle}>
                {c.name}
                {c.highlight ? " ★" : ""}
              </Text>
              <Text style={styles.itemText}>{c.summary}</Text>
            </View>
          ))}
        </View>

        {/* 5) Certificaciones */}
    {/* 5) Certificaciones */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Certificaciones y respaldos</Text>
  <View style={styles.pillRow}>
    {company.certifications.map((c) => (
      <View key={c.id} style={styles.pill}>
        <Text style={styles.pillText}>{c.name}</Text>
      </View>
    ))}
  </View>
</View>


        {/* 6) Cobertura */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cobertura</Text>
          <View style={styles.pillRow}>
            {company.coverage.map((x) => (
              <View key={x} style={styles.pill}>
                <Text style={styles.pillText}>{x}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}
