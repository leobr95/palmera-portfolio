import { CLIENTS, CONTROLS, SERVICES } from "./mock-data";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getClients() {
  await wait(150);
  return CLIENTS;
}
export async function getServices() {
  await wait(150);
  return SERVICES;
}
export async function getControls() {
  await wait(150);
  return CONTROLS;
}
