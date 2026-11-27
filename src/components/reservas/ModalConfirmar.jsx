"use client";

import ModalBase from "@/components/reservas/ModalBase";
import ResumenReserva from "@/components/reservas/ResumenReserva";

// Confirmación simple (para atender o marcar que no asistió)
export default function ModalConfirmar({ titulo, mensaje, textoBoton, color, reserva, enviando, error, onConfirmar, onCerrar }) {
  return (
    <ModalBase
      titulo={titulo}
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCerrar} disabled={enviando}>
            Volver
          </button>
          <button type="button" className={`btn btn-${color}`} onClick={onConfirmar} disabled={enviando}>
            {enviando ? "Guardando..." : textoBoton}
          </button>
        </>
      }
    >
      <ResumenReserva reserva={reserva} />
      <p className="mb-0">{mensaje}</p>
      {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
    </ModalBase>
  );
}
