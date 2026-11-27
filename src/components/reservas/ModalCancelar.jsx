"use client";

import { useState } from "react";
import ModalBase from "@/components/reservas/ModalBase";
import ResumenReserva from "@/components/reservas/ResumenReserva";
import { validarMotivo } from "@/lib/reservas";

// Cancelar una reserva pidiendo el motivo (el cliente lo ve en la app)
export default function ModalCancelar({ reserva, enviando, error, onConfirmar, onCerrar }) {
  const [motivo, setMotivo] = useState("");
  const [intento, setIntento] = useState(false);
  const errorMotivo = validarMotivo(motivo);

  function confirmar() {
    setIntento(true);
    if (errorMotivo) return;
    onConfirmar(motivo);
  }

  return (
    <ModalBase
      titulo="Cancelar reserva"
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCerrar} disabled={enviando}>
            Volver
          </button>
          <button type="button" className="btn btn-danger" onClick={confirmar} disabled={enviando}>
            {enviando ? "Cancelando..." : "Cancelar reserva"}
          </button>
        </>
      }
    >
      <ResumenReserva reserva={reserva} />
      <label htmlFor="motivo" className="form-label">Motivo de la cancelación</label>
      <textarea
        id="motivo"
        className={`form-control ${intento && errorMotivo ? "is-invalid" : ""}`}
        rows={3}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="Ej: el peluquero no puede asistir ese día"
      />
      {intento && errorMotivo && <div className="invalid-feedback">{errorMotivo}</div>}
      {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
    </ModalBase>
  );
}
