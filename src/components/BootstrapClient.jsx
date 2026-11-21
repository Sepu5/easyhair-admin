"use client";

import { useEffect } from "react";

// Carga el JavaScript de Bootstrap (offcanvas, modales, etc.) solo en el navegador
export default function BootstrapClient() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return null;
}
