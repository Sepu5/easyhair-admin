"use client";

import { useState } from "react";
import ModalBase from "@/components/reservas/ModalBase";
import Campo from "@/components/formularios/Campo";
import { validarPeluquero, armarPeluquero } from "@/lib/peluqueros";

// Formulario para crear o editar un peluquero (si nos llega "peluquero" es porque estamos editando)
export default function FormularioPeluquero({ peluquero, enviando, error, onGuardar, onCerrar }) {
  const [valores, setValores] = useState({
    nombre: peluquero?.nombre ?? "",
    correo: peluquero?.correo ?? "",
    activo: peluquero ? peluquero.activo : true,
  });
  const [intento, setIntento] = useState(false);
  const errores = validarPeluquero(valores);

  function cambiar(e) {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value }));
  }

  function guardar() {
    setIntento(true);
    if (Object.keys(errores).length > 0) return;
    onGuardar(armarPeluquero(valores));
  }

  return (
    <ModalBase
      titulo={peluquero ? "Editar peluquero" : "Nuevo peluquero"}
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCerrar} disabled={enviando}>
            Volver
          </button>
          <button type="button" className="btn btn-primary" onClick={guardar} disabled={enviando}>
            {enviando ? "Guardando..." : "Guardar"}
          </button>
        </>
      }
    >
      <Campo id="nombre" label="Nombre" value={valores.nombre} onChange={cambiar} error={errores.nombre} tocado={intento} requerido />
      <Campo
        id="correo"
        label="Correo"
        type="email"
        value={valores.correo}
        onChange={cambiar}
        error={errores.correo}
        tocado={intento}
        placeholder="nombre@easyhair.cl"
        requerido
      />
      {peluquero && (
        <div className="form-check form-switch">
          <input
            id="activo"
            type="checkbox"
            className="form-check-input"
            checked={valores.activo}
            onChange={(e) => setValores((prev) => ({ ...prev, activo: e.target.checked }))}
          />
          <label htmlFor="activo" className="form-check-label">
            Peluquero activo
          </label>
          <div className="form-text">Si lo desactivas, deja de aparecer en la lista y en la agenda.</div>
        </div>
      )}
      {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
    </ModalBase>
  );
}