"use client";

import ModalBase from "@/components/reservas/ModalBase";

// Confirmación antes de eliminar un servicio
export default function ModalEliminarServicio({ servicio, enviando, error, onConfirmar, onCerrar }) {
  return (
    <ModalBase
      titulo="Eliminar servicio"
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCerrar} disabled={enviando}>
            Volver
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirmar} disabled={enviando}>
            {enviando ? "Eliminando..." : "Eliminar"}
          </button>
        </>
      }
    >
      <p className="mb-0">
        ¿Seguro que quieres eliminar el servicio <strong>{servicio.nombre}</strong>? Dejará de mostrarse, pero las
        reservas anteriores se mantienen.
      </p>
      {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
    </ModalBase>
  );
}