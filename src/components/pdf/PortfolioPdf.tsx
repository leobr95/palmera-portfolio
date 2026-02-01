"use client";

import type { Client, Control, Service, Company } from "@/lib/mock-data";
import { PortfolioPdfExecutive } from "@/components/pdf/templates/PortafolioPdfExecutive";
import { PortfolioPdfInfographic } from "@/components/pdf/templates/PortfolioPdfInfographic";
import { PortfolioPdfBrochure } from "@/components/pdf/templates/PortfolioPdfBrochure";

export type DesignVariant =
  | "executive"
  | "split"
  | "minimal"
  | "infographic"
  | "brochure"
  | "brochure_alt";

export type PortfolioPdfProps = {
  company: Company;
  client: Client;
  title: string;
  subtitle: string;
  services: Service[];
  controls: Control[];
  variant?: DesignVariant;

  logoPalmeraSrc?: string;   // "/brand/palmera-junior.webp"
  logoAnticimexSrc?: string; // "/brand/anticimex.png"
};

export function PortfolioPdf(props: PortfolioPdfProps) {
  const v: DesignVariant = props.variant ?? "executive";

  if (v === "brochure" || v === "brochure_alt") {
    return <PortfolioPdfBrochure {...props} />;
  }
  if (v === "infographic") return <PortfolioPdfInfographic {...props} />;
  return <PortfolioPdfExecutive {...props} />;
}
