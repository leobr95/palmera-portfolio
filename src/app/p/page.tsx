import { Suspense } from "react";
import PortfolioPublicClient from "./PortfolioPublicClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-sm opacity-70">Cargando portafolio…</p>
        </div>
      }
    >
      <PortfolioPublicClient />
    </Suspense>
  );
}
