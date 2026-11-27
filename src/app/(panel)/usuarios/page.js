"use client";

import { useEffect, useState } from "react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import FiltrosUsuarios from "@/components/usuarios/FiltrosUsuarios";
import TablaUsuarios from "@/components/usuarios/TablaUsuarios";
import { useSesion } from "@/context/SesionContext";
import { pedir } from "@/lib/api";
import { listarUsuarios, filtrarUsuarios } from "@/lib/usuarios";

// Mantenedor de usuarios (solo ADMIN; el menú y RutaPermitida no dejan entrar al staff)
export default function Usuarios() {
  const { usuario } = useSesion();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState({ texto: "", rol: "" });

  useEffect(() => {
    let vigente = true;
    listarUsuarios(pedir)
      .then((datos) => vigente && setUsuarios(datos))
      .catch((e) => vigente && setError(e.message))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, []);

  function cambiarFiltro(campo, valor) {
    setFiltros((anteriores) => ({ ...anteriores, [campo]: valor }));
  }

  return (
    <>
      <EncabezadoPagina titulo="Usuarios" descripcion="Cuentas de clientes, staff y administradores" />

      {error && <div className="alert alert-danger">{error}</div>}

      {cargando && !error ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <>
          <FiltrosUsuarios filtros={filtros} usuarios={usuarios} onCambiar={cambiarFiltro} />
          <TablaUsuarios usuarios={filtrarUsuarios(usuarios, filtros)} idSesion={usuario?.id} />
        </>
      )}
    </>
  );
}
