"use client";

import { useState } from "react";
import ModalBase from "@/components/reservas/ModalBase";
import Campo from "@/components/formularios/Campo";
import { TIPOS, CATEGORIAS, validarMovimiento, armarMovimiento } from "@/lib/finanzas";
import { fechaHoy } from "@/lib/reservas";

// Formulario para registrar a mano un ingreso o un egreso
export default function FormularioMovimiento({ enviando, error, onGuardar, onCerrar }) {
  const [valores, setValores] = useState({
    tipo: "",
    categoria: "",
    monto: "",
    fecha: fechaHoy(),
    descripcion: "",
  });
  const [intento, setIntento] = useState(false);
  const errores = validarMovimiento(valores);

  function cambiar(e) {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value }));
  }

  function guardar() {
    setIntento(true);
    if (Object.keys(errores).length > 0) return;
    onGuardar(armarMovimiento(valores));
  }

  return (
    <ModalBase
      titulo="Registrar movimiento"
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
      <Campo id="tipo" label="Tipo" type="select" value={valores.tipo} onChange={cambiar} error={errores.tipo} tocado={intento} requerido>
        <option value="">Elige una opción</option>
        {Object.entries(TIPOS).map(([clave, tipo]) => (
          <option key={clave} value={clave}>
            {tipo.texto}
          </option>
        ))}
      </Campo>
      <Campo
        id="categoria"
        label="Categoría"
        type="select"
        value={valores.categoria}
        onChange={cambiar}
        error={errores.categoria}
        tocado={intento}
        requerido
      >
        <option value="">Elige una opción</option>
        {Object.entries(CATEGORIAS).map(([clave, texto]) => (
          <option key={clave} value={clave}>
            {texto}
          </option>
        ))}
      </Campo>
      <Campo id="monto" label="Monto" type="number" value={valores.monto} onChange={cambiar} error={errores.monto} tocado={intento} requerido />
      <Campo id="fecha" label="Fecha" type="date" value={valores.fecha} onChange={cambiar} error={errores.fecha} tocado={intento} requerido />
      <Campo
        id="descripcion"
        label="Descripción (opcional)"
        type="textarea"
        rows={2}
        value={valores.descripcion}
        onChange={cambiar}
        error={errores.descripcion}
        tocado={intento}
      />
      {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
    </ModalBase>
  );
}
