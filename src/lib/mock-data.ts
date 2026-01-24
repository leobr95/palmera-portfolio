export type ServiceCategory = "Plagas" | "Higiene" | "Especializados";

export type Service = {
  id: string;
  name: string;
  category: ServiceCategory;
  summary: string;
};

export type Control = {
  id: string;
  name: string;
  highlight?: boolean;
  summary: string;
};

export type Client = {
  id: string;
  name: string;
  industry: string;
  city?: string;

  logoSrc?: string;

  recommendedServiceIds: string[];
  recommendedControlIds: string[];
};

export type CompanyColors = {
  palmeraGreen: string;
  anticimexBlue: string;
  ink: string;
  paper: string;
  muted: string;
};

export type Certification = {
  id: string;
  name: string;
  description: string;
  logoSrc?: string; // /brand/certs/...
};

export type RepresentativeClient = {
  id: string;
  name: string;
  logoSrc?: string; // /brand/clients/...
};

export type SocialLink = {
  label: string; // "Web", "WhatsApp", "LinkedIn", ...
  value: string; // texto mostrado
  href: string;  // link (https://..., mailto:, https://wa.me/...)
};

export type Company = {
  name: string;
  tagline: string;
  supportLine: string;
  colors: CompanyColors;

  coverage: string[];

  // ✅ Antes string[] -> ahora objetos con logo + descripción
  certifications: Certification[];

  // ✅ Antes string[] -> ahora objetos con logo opcional
  representativeClients: RepresentativeClient[];

  // ✅ Nuevo: redes/contacto para CTA
  socials: SocialLink[];
};
// ===== Types (los tuyos quedan igual) =====
// export type ServiceCategory = "Plagas" | "Higiene" | "Especializados";
// ...

export const COMPANY: Company = {
  name: "Palmera Junior SAS",
  // Basado en el enfoque del sitio (control de plagas con foco en seguridad/prevención)
  tagline: "Control de plagas sin contaminar",
  supportLine: "Una empresa de Anticimex",
  colors: {
    palmeraGreen: "#00ac4b",
    anticimexBlue: "#332d2e",
    ink: "#332d2e",
    paper: "#FFFFFF",
    muted: "#F2FBF6",
  },

  // Cobertura: el sitio menciona operación en muchas ciudades; dejé un set “usable”
  coverage: [
    "Bogotá",
    "Medellín",
    "Cali",
    "Barranquilla",
    "Cartagena",
    "Bucaramanga",
    "Pereira",
    "Manizales",
    "Armenia",
    "Ibagué",
    "Villavicencio",
    "Neiva",
    "Santa Marta",
    "Valledupar",
    "Montería",
    "Cúcuta",
    "Pasto",
    "Popayán",
  ],

  certifications: [
    // Certificaciones principales (según página de certificaciones)
    { id: "iso-22000", name: "ISO 22000", description: "Sistema de gestión de inocuidad y seguridad alimentaria.", logoSrc: "/brand/certs/iso-22000.png" },
    { id: "iso-9001", name: "ISO 9001", description: "Gestión de calidad, estandarización y mejora continua.", logoSrc: "/brand/certs/iso-9001.png" },
    { id: "iso-14001", name: "ISO 14001", description: "Gestión ambiental y buenas prácticas para reducción de impacto.", logoSrc: "/brand/certs/iso-14001.png" },
    { id: "iso-45001", name: "ISO 45001", description: "Seguridad y salud en el trabajo: prevención y control de riesgos.", logoSrc: "/brand/certs/iso-45001.png" },
    { id: "haccp", name: "HACCP", description: "Sistema preventivo para control de peligros y puntos críticos.", logoSrc: "/brand/certs/haccp.png" },
    { id: "norsok", name: "NORSOK", description: "Estándares para entornos industriales exigentes (según alcance).", logoSrc: "/brand/certs/norsok.png" },

    // Conceptos sanitarios (el sitio los lista por regiones/departamentos)
    // { id: "cs-antioquia", name: "Concepto Sanitario", description: "Antioquia." },
    // { id: "cs-atlantico", name: "Concepto Sanitario", description: "Atlántico." },
    // { id: "cs-bogota", name: "Concepto Sanitario", description: "Bogotá D.C." },
    // { id: "cs-bolivar", name: "Concepto Sanitario", description: "Bolívar." },
    // { id: "cs-caldas", name: "Concepto Sanitario", description: "Caldas." },
    // { id: "cs-casanare", name: "Concepto Sanitario", description: "Casanare." },
    // { id: "cs-cauca", name: "Concepto Sanitario", description: "Cauca." },
    // { id: "cs-cesar", name: "Concepto Sanitario", description: "Cesar." },
    // { id: "cs-choco", name: "Concepto Sanitario", description: "Chocó." },
    // { id: "cs-cordoba", name: "Concepto Sanitario", description: "Córdoba." },
    // { id: "cs-cundinamarca", name: "Concepto Sanitario", description: "Cundinamarca." },
    // { id: "cs-huila", name: "Concepto Sanitario", description: "Huila." },
    // { id: "cs-magdalena", name: "Concepto Sanitario", description: "Magdalena." },
    // { id: "cs-meta", name: "Concepto Sanitario", description: "Meta." },
    // { id: "cs-narino", name: "Concepto Sanitario", description: "Nariño." },
    // { id: "cs-nsantander", name: "Concepto Sanitario", description: "Norte de Santander." },
    // { id: "cs-quindio", name: "Concepto Sanitario", description: "Quindío." },
    // { id: "cs-risaralda", name: "Concepto Sanitario", description: "Risaralda." },
    // { id: "cs-santander", name: "Concepto Sanitario", description: "Santander." },
    // { id: "cs-sucre", name: "Concepto Sanitario", description: "Sucre." },
    // { id: "cs-valle", name: "Concepto Sanitario", description: "Valle del Cauca." },
    // { id: "cs-tolima", name: "Concepto Sanitario", description: "Tolima." },
  ],

  // No vi una “lista oficial pública” única de clientes en la web en lo revisado;
  // dejo los tuyos (son perfectos para el bloque “Trusted by…”).
  representativeClients: [
    { id: "colanta", name: "Colanta", logoSrc: "/brand/clients/colanta.png" },
    { id: "alpina", name: "Alpina", logoSrc: "/brand/clients/alpina.png" },
    { id: "frisby", name: "Frisby", logoSrc: "/brand/clients/frisby.png" },
    { id: "parmalat", name: "Parmalat", logoSrc: "/brand/clients/parmalat.png" },
    { id: "qbano", name: "Qbano", logoSrc: "/brand/clients/qbano.png" },
    { id: "ramo", name: "Ramo", logoSrc: "/brand/clients/ramo.png" },
    { id: "bucanero", name: "Bucanero", logoSrc: "/brand/clients/bucanero.png" },
    { id: "campollo", name: "Campollo", logoSrc: "/brand/clients/campollo.png" },
  ],

  socials: [
    { label: "Web", value: "palmerajunior.com", href: "https://palmerajunior.com" },
    { label: "Email", value: "contacto@palmerajunior.com", href: "mailto:contacto@palmerajunior.com" },

    // CTA principal (puedes cambiarlo por el de tu ciudad)
    { label: "WhatsApp", value: "+57 312 233 9551", href: "https://wa.me/573122339551" },
    { label: "Tel", value: "(602) 489 00 30", href: "tel:+576024890030" },
  ],
};

export const SERVICES: Service[] = [
  // ===== Plagas =====
  {
    id: "fumigacion",
    name: "Fumigación / Desinsectación",
    category: "Plagas",
    summary:
      "Control de plagas rastreras y voladoras con técnicas profesionales para reducir focos y proteger la operación (según diagnóstico).",
  },
  {
    id: "roedores",
    name: "Control de roedores (ratas y ratones)",
    category: "Plagas",
    summary:
      "Prevención y control con enfoque MIP: inspección, puntos críticos, medidas de control y recomendaciones para mitigar el riesgo.",
  },
  {
    id: "cucarachas",
    name: "Control de cucarachas",
    category: "Plagas",
    summary:
      "Tratamientos focalizados + acciones preventivas para cortar reinfestación y mejorar condiciones sanitarias del sitio.",
  },
  {
    id: "moscas",
    name: "Control de moscas",
    category: "Plagas",
    summary:
      "Manejo integral del riesgo: identificación de focos, control y recomendaciones para reducir presencia en áreas sensibles.",
  },
  {
    id: "mosquitos",
    name: "Control de zancudos / mosquitos",
    category: "Plagas",
    summary:
      "Control en entornos residenciales, comerciales e industriales con métodos y productos aprobados, priorizando seguridad del ambiente.",
  },
  { id: "hormigas", name: "Control de hormigas", category: "Plagas", summary: "Control y prevención según puntos de ingreso y condiciones del entorno." },
  { id: "pulgas", name: "Control de pulgas", category: "Plagas", summary: "Intervención orientada a cortar ciclo y reducir riesgo en áreas de convivencia." },
  { id: "garrapatas", name: "Control de garrapatas", category: "Plagas", summary: "Acompañamiento y control para disminuir presencia y riesgo sanitario." },
  {
    id: "palomas",
    name: "Control de palomas / aves",
    category: "Plagas",
    summary:
      "Medidas de control y exclusión para reducir afectación sanitaria y deterioro en infraestructura (según sitio).",
  },
  {
    id: "comejen",
    name: "Control de comején / termitas",
    category: "Especializados",
    summary:
      "Intervención especializada para proteger estructura y activos, con diagnóstico del nivel de afectación y plan de control.",
  },
  {
    id: "murcielagos",
    name: "Control de murciélagos",
    category: "Especializados",
    summary:
      "Manejo especializado para mitigar riesgos sanitarios y operativos, considerando condiciones del lugar y medidas de control.",
  },
  {
    id: "ofidios",
    name: "Control de ofidios (serpientes)",
    category: "Especializados",
    summary:
      "Servicio orientado a seguridad en zonas con riesgo: prevención, manejo y acciones estratégicas según el entorno.",
  },
  {
    id: "granos_almacenados",
    name: "Control de plagas en granos almacenados",
    category: "Especializados",
    summary:
      "Prevención y control para reducir deterioro/contaminación en almacenamiento, con plan según condiciones del sitio.",
  },

  // ===== Higiene =====
  {
    id: "desinfeccion",
    name: "Desinfección de ambientes y superficies",
    category: "Higiene",
    summary:
      "Protocolos de desinfección según necesidad del cliente y tipo de área, con soporte para evidencias (según alcance).",
  },
  {
    id: "lavado_tanques",
    name: "Lavado de tanques de agua",
    category: "Higiene",
    summary:
      "Limpieza y mantenimiento para reducir contaminación y apoyar buenas prácticas de higiene en el suministro de agua.",
  },

  // ===== Especializados =====
  {
    id: "servicios_especiales",
    name: "Servicios especiales (mallas, anjeos, sellos, etc.)",
    category: "Especializados",
    summary:
      "Acciones complementarias de control físico/mecánico para reforzar la prevención (según diagnóstico y necesidad).",
  },
];

export const CONTROLS: Control[] = [
  {
    id: "mip",
    name: "MIP — Manejo Integrado de Plagas",
    highlight: true,
    summary:
      "Enfoque preventivo: inspección, control, correcciones y seguimiento para reducir riesgos y mantener continuidad operativa.",
  },
  {
    id: "diagnostico",
    name: "Diagnóstico e inspección técnica",
    highlight: true,
    summary:
      "Levantamiento de condiciones, puntos críticos y nivel de riesgo para definir alcance y plan de trabajo.",
  },
  {
    id: "plan_accion",
    name: "Plan de acción + recomendaciones",
    highlight: true,
    summary:
      "Medidas preventivas y correctivas para disminuir reinfestación, mejorar condiciones sanitarias y estandarizar rutinas.",
  },
  {
    id: "evidencias",
    name: "Evidencias e informes para auditoría",
    highlight: true,
    summary:
      "Registro de actividades, hallazgos y soporte del servicio para control interno y cumplimiento (según contrato).",
  },
  {
    id: "soporte_documental",
    name: "Soporte documental (SDS, certificados, cronogramas)",
    highlight: true,
    summary:
      "Documentación de respaldo: fichas, hojas de seguridad, certificados y soportes requeridos por auditorías (según alcance).",
  },
  {
    id: "productos_aprobados",
    name: "Productos y técnicas aprobadas",
    highlight: false,
    summary:
      "Intervenciones con productos/técnicas permitidas por autoridades sanitarias, priorizando seguridad de personas y operación.",
  },
  {
    id: "personal_calificado",
    name: "Personal calificado y certificado",
    highlight: false,
    summary:
      "Equipo técnico con perfiles profesionales y protocolos de seguridad para servicios de mayor complejidad (según servicio).",
  },
  {
    id: "poliza_rc",
    name: "Pólizas de responsabilidad civil",
    highlight: false,
    summary:
      "Cobertura para protección de instalaciones y operación del cliente (según condiciones del servicio).",
  },
];

// === Ejemplos de clientes (ajusté IDs para que coincidan con SERVICES/CONTROLS) ===
export const CLIENTS: Client[] = [
  {
    id: "colanta",
    name: "Colanta",
    industry: "Industria de alimentos",
    city: "Medellín",
    logoSrc: "/brand/clients/colanta.png",
    recommendedServiceIds: ["roedores", "moscas", "cucarachas", "mosquitos", "desinfeccion", "lavado_tanques"],
    recommendedControlIds: ["mip", "diagnostico", "plan_accion", "evidencias", "soporte_documental"],
  },
  {
    id: "alpina",
    name: "Alpina",
    industry: "Industria de alimentos",
    city: "Bogotá",
    logoSrc: "/brand/clients/alpina.png",
    recommendedServiceIds: ["roedores", "moscas", "cucarachas", "palomas", "desinfeccion"],
    recommendedControlIds: ["mip", "diagnostico", "plan_accion", "evidencias", "soporte_documental"],
  },
  {
    id: "frisby",
    name: "Frisby",
    industry: "Restaurantes",
    city: "Pereira",
    logoSrc: "/brand/clients/frisby.png",
    recommendedServiceIds: ["cucarachas", "roedores", "moscas", "desinfeccion"],
    recommendedControlIds: ["mip", "diagnostico", "plan_accion", "evidencias"],
  },
];
