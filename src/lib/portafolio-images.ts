export type ImageBlock = {
  src: string;
  alt: string;
};

export type PortfolioImages = {
  hero: ImageBlock;
  experience: ImageBlock;
  mip: ImageBlock;
  smart: ImageBlock;
  services: {
    plagas: ImageBlock;
    higiene: ImageBlock;
    especializados: ImageBlock;
  };
  gallery: ImageBlock[];
  coverage: ImageBlock;
};

export const PORTFOLIO_IMAGES: PortfolioImages = {
  hero: {
    src: "https://images.unsplash.com/photo-1541976590-713941681591?auto=format&fit=crop&w=1800&q=80",
    alt: "Portafolio corporativo",
  },
  experience: {
    src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
    alt: "Equipo profesional",
  },
  mip: {
    src: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1400&q=80",
    alt: "Inspección y control",
  },
  smart: {
    src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
    alt: "Monitoreo y tecnología",
  },
  services: {
    plagas: {
      src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=80",
      alt: "Control de plagas",
    },
    higiene: {
      src: "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=1400&q=80",
      alt: "Higiene y desinfección",
    },
    especializados: {
      src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
      alt: "Servicios especializados",
    },
  },
  gallery: [
    { src: "https://images.unsplash.com/photo-1600267165477-6d4cc741b379?auto=format&fit=crop&w=900&q=80", alt: "Operación en sitio" },
    { src: "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=900&q=80", alt: "Evidencia y documentación" },
    { src: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80", alt: "Ambientes industriales" },
    { src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80", alt: "Presentación corporativa" },
  ],
  coverage: {
    src: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1400&q=80",
    alt: "Cobertura y logística",
  },
};
