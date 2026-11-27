"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { estaActiva } from "@/lib/menu";

// Opción del menú lateral; se marca cuando estamos en esa página
export default function NavLink({ href, icono, children }) {
  const ruta = usePathname();
  const activo = estaActiva(href, ruta);

  return (
    <Link
      href={href}
      className={`nav-link nav-menu d-flex gap-2 ${activo ? "nav-active" : ""}`}
      aria-current={activo ? "page" : undefined}
    >
      <i className={`bi ${icono}`}></i>
      {children}
    </Link>
  );
}
