"use client";

import { useEffect } from "react";

// Cargamos el JavaScript de Bootstrap (offcanvas, etc.) solo en el navegador, porque en el servidor no hay document
export default function BootstrapClient() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return null;
}
