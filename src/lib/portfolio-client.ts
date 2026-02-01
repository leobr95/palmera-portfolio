import type { Client, Control, Service } from "@/lib/mock-data";

export const GENERIC_CLIENT_ID = "generic-client";

export function buildGenericClient(services: Service[], controls: Control[]): Client {
  return {
    id: GENERIC_CLIENT_ID,
    name: "Portafolio General",
    industry: "Sin cliente especifico",
    city: "",
    recommendedServiceIds: services.map((s) => s.id),
    recommendedControlIds: controls.map((c) => c.id),
  };
}
