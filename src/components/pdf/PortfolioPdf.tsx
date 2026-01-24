"use client";

import type { Client, Control, Service, Company } from "@/lib/mock-data";
import { PortfolioPdfExecutive } from "@/components/pdf/templates/PortafolioPdfExecutive";
import { PortfolioPdfInfographic } from "@/components/pdf/templates/PortfolioPdfInfographic";

export type DesignVariant = "executive" | "split" | "minimal" | "infographic";

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

  // Por ahora: split/minimal usan el template executive (hasta que hagas sus templates PDF)
  if (v === "infographic") return <PortfolioPdfInfographic {...props} />;
  return <PortfolioPdfExecutive {...props} />;
}
