import type { Client, Company, Control, Service, ServiceCategory } from "@/lib/mock-data";

export type PortfolioPreviewCopy = {
  experienceIntro?: string;
  industryFocus?: string;
  coverageIntro?: string;
};

export type PortfolioPreviewOptions = {
  accentColor?: string; // por defecto company.colors.palmeraGreen
  showLogo?: boolean; // por defecto true
  showAnticimexBadge?: boolean; // por defecto true
  showClientMeta?: boolean; // por defecto true (industria/ciudad)
  logoSrc?: string; // por defecto "/brand/palmera-junior.webp"
  maxRepresentativeClients?: number; // por defecto 7
  copy?: PortfolioPreviewCopy;
  serviceCategoryOrder?: ServiceCategory[];
  brochureTheme?: "green" | "aqua";
  brochurePreviewMode?: "flip" | "scroll";
  printMode?: boolean;
  printPaper?: "a4" | "letter" | "legal";
};

export type PortfolioPreviewProps = {
  company: Company;
  client: Client;
  title: string;
  subtitle: string;
  services: Service[];
  controls: Control[];
  options?: PortfolioPreviewOptions;
};
