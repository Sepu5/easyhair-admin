"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSesion } from "@/context/SesionContext";

// Solo muestra el panel si hay una sesión; si no, manda al login
export default function PanelProtegido({ children }) {
  const router = useRouter();
  const { haySesion, cargando } = useSesion();

  useEffect(() => {
    if (!cargando && !haySesion) {
      router.replace("/login");
    }
  }, [cargando, haySesion, router]);

  // mientras revisa la sesión (o mientras redirige) no muestra nada del panel
  if (cargando || !haySesion) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return children;
}
