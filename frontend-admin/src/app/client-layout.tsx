// src/app/client-layout.tsx
"use client";  // Marque ce fichier comme un composant client

import { ReactNode } from "react";

const ClientLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
    </>
  );
};

export default ClientLayout;
