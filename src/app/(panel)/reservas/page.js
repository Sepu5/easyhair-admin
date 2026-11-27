"use client";

import { useCallback, useEffect, useState } from "react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import FiltrosAgenda from "@/components/reservas/FiltrosAgenda";
import ResumenEstados from "@/components/reservas/ResumenEstados";
import TablaReservas from "@/components/reservas/TablaReservas";
import ModalConfirmar from "@/components/reservas/ModalConfirmar";
import ModalCancelar from "@/components/reservas/ModalCancelar";
import ModalReprogramar from "@/components/reservas/ModalReprogramar";
import BloqueosHorario from "@/components/reservas/BloqueosHorario";
import { pedir } from "@/lib/api";
import {
  cargarAgenda,
  cargarPeluqueros,
  cargarHorasLibres,
  fechaHoy,
  filtrarPorEstado,
  atenderReserva,
  marcarNoAsistio,
  cancelarReserva,
  reprogramarReserva,
} from "@/lib/reservas";

export default function Reservas() {
  const hoy = fechaHoy();
  const [filtros, setFiltros] = useState({ fecha: hoy, peluqueroId: "", estado: "" });
  const [peluqueros, setPeluqueros] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // cada vez que le sumamos 1 se vuelve a pedir la agenda (lo usamos después de cada acción)
  const [recargas, setRecargas] = useState(0);

  // aquí guardamos qué modal está abierto: { tipo, reserva } o null
  const [accion, setAccion] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");
  const [aviso, setAviso] = useState("");

  // Los peluqueros los pedimos una sola vez, al entrar
  useEffect(() => {
    cargarPeluqueros(pedir)
      .then(setPeluqueros)
      .catch((e) => setError(e.message));
  }, []);

  // La agenda la volvemos a pedir cuando cambia la fecha, el peluquero o después de una acción
  // (el filtro de estado lo aplicamos aquí mismo, sin volver a llamar al backend)
  useEffect(() => {
    if (peluqueros.length === 0) return;
    let vigente = true; // con esto evitamos mostrar una respuesta vieja si alguien cambia el filtro muy rápido

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
  }, [filtros.fecha, filtros.peluqueroId, peluqueros, recargas]);

  function cambiarFiltro(campo, valor) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  }

  function abrirAccion(tipo, reserva) {
    setAccion({ tipo, reserva });
    setErrorAccion("");
    setAviso("");
  }

  function cerrarAccion() {
    if (!enviando) setAccion(null);
  }

  // Mandamos la acción al backend; si sale bien cerramos el modal y recargamos la agenda
  async function ejecutar(llamada, mensajeExito) {
    setEnviando(true);
    setErrorAccion("");
    try {
      await llamada();
      setAccion(null);
      setAviso(mensajeExito);
      setRecargas((n) => n + 1);
    } catch (e) {
      setErrorAccion(e.message);
    } finally {
      setEnviando(false);
    }
  }

  // usamos useCallback para que el modal no vuelva a pedir las horas en cada render
  const peluqueroDeAccion = accion ? accion.reserva.peluqueroId : null;
  const cargarHoras = useCallback(
    (fecha) => cargarHorasLibres(pedir, fecha, peluqueroDeAccion),
    [peluqueroDeAccion]
  );

  const visibles = filtrarPorEstado(reservas, filtros.estado);
  // los bloqueos son de un solo peluquero: usamos el del filtro (o el único que haya)
  const peluqueroBloqueos =
    peluqueros.find((p) => String(p.id) === String(filtros.peluqueroId)) ||
    (peluqueros.length === 1 ? peluqueros[0] : null);
  const reserva = accion ? accion.reserva : null;

  return (
    <>
      <EncabezadoPagina titulo="Reservas" descripcion="Agenda del día, estados de las reservas y bloqueos de horario" />

      <FiltrosAgenda filtros={filtros} peluqueros={peluqueros} onCambiar={cambiarFiltro} />

      {aviso && (
        <div className="alert alert-success alert-dismissible">
          {aviso}
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setAviso("")}></button>
        </div>
      )}
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
          <TablaReservas reservas={visibles} hoy={hoy} onAccion={abrirAccion} />
        </>
      )}

      <BloqueosHorario fecha={filtros.fecha} peluquero={peluqueroBloqueos} hoy={hoy} />

      {accion?.tipo === "atender" && (
        <ModalConfirmar
          titulo="Atender reserva"
          mensaje="Se marcará como atendida y el ingreso quedará registrado en Finanzas."
          textoBoton="Marcar como atendida"
          color="success"
          reserva={reserva}
          enviando={enviando}
          error={errorAccion}
          onCerrar={cerrarAccion}
          onConfirmar={() => ejecutar(() => atenderReserva(pedir, reserva.id), "Reserva marcada como atendida.")}
        />
      )}

      {accion?.tipo === "noAsistio" && (
        <ModalConfirmar
          titulo="El cliente no asistió"
          mensaje="La reserva quedará como 'No asistió' y ya no se podrá modificar."
          textoBoton="Marcar que no asistió"
          color="danger"
          reserva={reserva}
          enviando={enviando}
          error={errorAccion}
          onCerrar={cerrarAccion}
          onConfirmar={() => ejecutar(() => marcarNoAsistio(pedir, reserva.id), "Reserva marcada como 'No asistió'.")}
        />
      )}

      {accion?.tipo === "cancelar" && (
        <ModalCancelar
          reserva={reserva}
          enviando={enviando}
          error={errorAccion}
          onCerrar={cerrarAccion}
          onConfirmar={(motivo) => ejecutar(() => cancelarReserva(pedir, reserva.id, motivo), "Reserva cancelada.")}
        />
      )}

      {accion?.tipo === "reprogramar" && (
        <ModalReprogramar
          reserva={reserva}
          cargarHoras={cargarHoras}
          enviando={enviando}
          error={errorAccion}
          onCerrar={cerrarAccion}
          onConfirmar={(fecha, hora) =>
            ejecutar(() => reprogramarReserva(pedir, reserva.id, fecha, hora), `Reserva reprogramada para el ${fecha} a las ${hora}.`)
          }
        />
      )}
    </>
  );
}
