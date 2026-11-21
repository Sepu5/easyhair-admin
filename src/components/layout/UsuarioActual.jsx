"use client";

import { useSesion } from "@/context/SesionContext";

// Nombre y rol del usuario logueado (va en la barra de arriba)
export default function UsuarioActual() {
  const { usuario } = useSesion();
  if (!usuario) return null;

  return (
    <span className="text-white small me-3 d-none d-md-inline">
      <i className="bi bi-person-circle me-1"></i>
      {usuario.nombre}
      <span className="badge text-bg-secondary ms-2">{usuario.rol}</span>
    </span>
  );
}
