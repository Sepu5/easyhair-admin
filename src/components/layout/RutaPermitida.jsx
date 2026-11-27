"use client";

import { usePathname } from "next/navigation";
import { useSesion } from "@/context/SesionContext";
import { puedeVerRuta } from "@/lib/permisos";
import SinPermisos from "@/components/layout/SinPermisos";

// Muestra la página solo si el rol del usuario puede verla.
// "ruta" se puede pasar a mano (sirve para las pruebas); si no, usa la URL actual.
export default function RutaPermitida({ children, ruta }) {
  const rutaActual = usePathname();
  const { usuario } = useSesion();

  if (!puedeVerRuta(usuario?.rol, ruta ?? rutaActual)) {
    return <SinPermisos />;
  }

  return children;
}
