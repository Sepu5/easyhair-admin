"use client";

import { useState } from "react";
import ModalBase from "@/components/reservas/ModalBase";
import { ETIQUETAS_ROL, ROLES } from "@/lib/usuarios";

// Cambia el rol de una cuenta (ej. un cliente que entra a trabajar como staff)
export default function ModalCambiarRol({ usuario, enviando, error, onConfirmar, onCerrar }) {
  const [rol, setRol] = useState(usuario.rol);

  return (
    <ModalBase
      titulo="Cambiar rol"
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCerrar} disabled={enviando}>
            Volver
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onConfirmar(rol)}
            disabled={enviando || rol === usuario.rol}
          >
            {enviando ? "Guardando..." : "Guardar rol"}
          </button>
        </>
      }
    >
      <p>
        Cuenta de <strong>{usuario.nombre}</strong> ({usuario.correo}).
      </p>
      <label htmlFor="nuevoRol" className="form-label">Rol</label>
      <select id="nuevoRol" className="form-select" value={rol} onChange={(e) => setRol(e.target.value)}>
        {ROLES.map((opcion) => (
          <option key={opcion} value={opcion}>
            {ETIQUETAS_ROL[opcion].texto}
          </option>
        ))}
      </select>
      <p className="small text-muted mt-2 mb-0">El cambio se aplica la próxima vez que la persona inicie sesión.</p>
      {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
    </ModalBase>
  );
}
