"use client";

import ModalBase from "@/components/reservas/ModalBase";
import { TIPOS, CATEGORIAS } from "@/lib/finanzas";
import { formatearPrecio, formatearFecha } from "@/lib/formato";

// Pedimos confirmación antes de eliminar un movimiento porque no se puede deshacer
export default function ModalEliminarMovimiento({ movimiento, enviando, error, onConfirmar, onCerrar }) {
  const tipo = TIPOS[movimiento.tipo]?.texto.toLowerCase() || "movimiento";

  return (
    <ModalBase
      titulo="Eliminar movimiento"
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
        ¿Seguro que quieres eliminar este {tipo} de <strong>{formatearPrecio(movimiento.monto)}</strong> (
        {CATEGORIAS[movimiento.categoria] || movimiento.categoria}) del {formatearFecha(movimiento.fecha)}? Esta acción no
        se puede deshacer.
      </p>
      {movimiento.reservaId && <p className="text-muted small mt-2 mb-0">Este movimiento se creó al atender una reserva.</p>}
      {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
    </ModalBase>
  );
}
