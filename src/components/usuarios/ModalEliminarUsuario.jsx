"use client";

import ModalBase from "@/components/reservas/ModalBase";

// Confirmación antes de eliminar una cuenta
export default function ModalEliminarUsuario({ usuario, enviando, error, onConfirmar, onCerrar }) {
  return (
    <ModalBase
      titulo="Eliminar usuario"
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
        ¿Seguro que quieres eliminar la cuenta de <strong>{usuario.nombre}</strong> ({usuario.correo})? Ya no podrá
        iniciar sesión. Esta acción no se puede deshacer.
      </p>
      {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
    </ModalBase>
  );
}
