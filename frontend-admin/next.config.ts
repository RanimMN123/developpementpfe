import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour Docker avec sortie standalone
  output: 'standalone',

  // Optimisations pour la production
  experimental: {
    optimizeCss: true,
  },

  // Configuration des images
  images: {
    unoptimized: true, // Pour éviter les problèmes avec les images statiques
  },

  // Configuration du serveur
  serverRuntimeConfig: {
    // Variables côté serveur uniquement
  },

  publicRuntimeConfig: {
    // Variables accessibles côté client et serveur
  },
};

export default nextConfig;
