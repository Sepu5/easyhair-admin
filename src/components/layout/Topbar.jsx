"use client";

import Link from "next/link";
import UsuarioActual from "@/components/layout/UsuarioActual";
import { useSesion } from "@/context/SesionContext";
import { tituloPanel } from "@/lib/permisos";

// Barra negra de arriba con el nombre y el botón del menú en celular.
// El nombre cambia según el rol (Admin o Staff).
export default function Topbar() {
  const { usuario } = useSesion();

  return (
    <header className="navbar sticky-top bg-dark flex-md-nowrap p-0 shadow" data-bs-theme="dark">
      <Link href="/" className="navbar-brand col-md-3 col-lg-2 me-0 px-3 fs-6 text-white">
        <i className="bi bi-scissors me-2"></i>
        {tituloPanel(usuario?.rol)}
      </Link>

      <div className="ms-auto d-flex align-items-center">
        <UsuarioActual />
      </div>

      {/* en celular el menú se abre con este botón */}
      <ul className="navbar-nav flex-row d-md-none">
        <li className="nav-item text-nowrap">
          <button
            className="nav-link px-3 text-white"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#menuLateral"
            aria-controls="menuLateral"
            aria-label="Abrir menú"
          >
            <i className="bi bi-list"></i>
          </button>
        </li>
      </ul>
    </header>
  );
}
