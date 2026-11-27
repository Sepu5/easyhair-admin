"use client";

import { useEffect, useState } from "react";
import ModalBase from "@/components/reservas/ModalBase";
import ResumenReserva from "@/components/reservas/ResumenReserva";
import { fechaHoy, validarReprogramacion } from "@/lib/reservas";

// Cambiar la fecha y la hora de una reserva.
// cargarHoras(fecha) le pide al backend las horas libres de ese peluquero.
export default function ModalReprogramar({ reserva, cargarHoras, enviando, error, onConfirmar, onCerrar }) {
  const hoy = fechaHoy();
  const [fecha, setFecha] = useState(reserva.fecha < hoy ? hoy : reserva.fecha);
  const [hora, setHora] = useState("");
  const [horas, setHoras] = useState([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [errorHoras, setErrorHoras] = useState("");
  const [intento, setIntento] = useState(false);

  // cada vez que cambia la fecha pedimos las horas libres de ese día
  useEffect(() => {
    if (!fecha || fecha < hoy) return;
    let vigente = true;

    async function cargar() {
      setCargandoHoras(true);
      setErrorHoras("");
      setHora("");
      try {
        const libres = await cargarHoras(fecha);
        if (vigente) setHoras(libres);
      } catch (e) {
        if (vigente) setErrorHoras(e.message);
      } finally {
        if (vigente) setCargandoHoras(false);
      }
    }

    cargar();
    return () => {
      vigente = false;
    };
  }, [fecha, hoy, cargarHoras]);

  const errores = validarReprogramacion({ fecha, hora }, hoy);

  function confirmar() {
    setIntento(true);
    if (Object.keys(errores).length > 0) return;
    onConfirmar(fecha, hora);
  }

  return (
    <ModalBase
      titulo="Reprogramar reserva"
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCerrar} disabled={enviando}>
            Volver
          </button>
          <button type="button" className="btn btn-primary" onClick={confirmar} disabled={enviando}>
            {enviando ? "Guardando..." : "Reprogramar"}
          </button>
        </>
      }
    >
      <ResumenReserva reserva={reserva} />

      <div className="mb-3">
        <label htmlFor="nuevaFecha" className="form-label">Nueva fecha</label>
        <input
          id="nuevaFecha"
          type="date"
          min={hoy}
          className={`form-control ${intento && errores.fecha ? "is-invalid" : ""}`}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        {intento && errores.fecha && <div className="invalid-feedback">{errores.fecha}</div>}
      </div>

      <div>
        <label htmlFor="nuevaHora" className="form-label">Nueva hora</label>
        <select
          id="nuevaHora"
          className={`form-select ${intento && errores.hora ? "is-invalid" : ""}`}
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          disabled={cargandoHoras}
        >
          <option value="">{cargandoHoras ? "Buscando horas libres..." : "Elige una hora"}</option>
          {horas.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        {intento && errores.hora && <div className="invalid-feedback">{errores.hora}</div>}
        {!cargandoHoras && !errorHoras && fecha >= hoy && horas.length === 0 && (
          <div className="form-text text-danger">No quedan horas libres ese día.</div>
        )}
        {errorHoras && <div className="form-text text-danger">{errorHoras}</div>}
      </div>

      {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
    </ModalBase>
  );
}
