"use client";

import { useEffect, useState } from "react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import FiltrosAgenda from "@/components/reservas/FiltrosAgenda";
import ResumenEstados from "@/components/reservas/ResumenEstados";
import TablaReservas from "@/components/reservas/TablaReservas";
import { pedir } from "@/lib/api";
import { cargarAgenda, cargarPeluqueros, fechaHoy, filtrarPorEstado } from "@/lib/reservas";

export default function Reservas() {
  const [filtros, setFiltros] = useState({ fecha: fechaHoy(), peluqueroId: "", estado: "" });
  const [peluqueros, setPeluqueros] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Los peluqueros se piden una sola vez
  useEffect(() => {
    cargarPeluqueros(pedir)
      .then(setPeluqueros)
      .catch((e) => setError(e.message));
  }, []);

  // La agenda se vuelve a pedir cuando cambia la fecha o el peluquero
  // (el filtro de estado se aplica aquí mismo, sin ir al backend)
  useEffect(() => {
    if (peluqueros.length === 0) return;
    let vigente = true; // evita mostrar una respuesta vieja si se cambia rápido el filtro

    async function cargar() {
      setCargando(true);
      setError("");
      try {
        const datos = await cargarAgenda(pedir, filtros.fecha, peluqueros, filtros.peluqueroId);
        if (vigente) setReservas(datos);
      } catch (e) {
        if (vigente) setError(e.message);
      } finally {
        if (vigente) setCargando(false);
      }
    }

    cargar();
    return () => {
      vigente = false;
    };
  }, [filtros.fecha, filtros.peluqueroId, peluqueros]);

  function cambiarFiltro(campo, valor) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  }

  const visibles = filtrarPorEstado(reservas, filtros.estado);

  return (
    <>
      <EncabezadoPagina titulo="Reservas" descripcion="Agenda del día, estados de las reservas y bloqueos de horario" />

      <FiltrosAgenda filtros={filtros} peluqueros={peluqueros} onCambiar={cambiarFiltro} />

      {error && <div className="alert alert-danger">{error}</div>}

      {cargando && !error ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <>
          <ResumenEstados reservas={reservas} />
          <TablaReservas reservas={visibles} />
        </>
      )}
    </>
  );
}
