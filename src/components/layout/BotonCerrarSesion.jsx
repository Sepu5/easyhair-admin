"use client";

import { useRouter } from "next/navigation";
import { useSesion } from "@/context/SesionContext";

export default function BotonCerrarSesion() {
  const router = useRouter();
  const { cerrarSesion } = useSesion();

  function salir() {
    cerrarSesion();
    router.replace("/login");
  }

  return (
    <button type="button" className="btn btn-danger mx-4 d-flex gap-2 justify-content-center" onClick={salir}>
      <i className="bi bi-door-closed"></i>
      Cerrar sesión
    </button>
  );
}
