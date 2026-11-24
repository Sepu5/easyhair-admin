"use client";

import { useState } from "react";
import ModalBase from "@/components/reservas/ModalBase";
import Campo from "@/components/formularios/Campo";
import { validarServicio, armarServicio } from "@/lib/servicios";

// Formulario para crear o editar un servicio (si llega "servicio" es editar)
export default function FormularioServicio({ servicio, enviando, error, onGuardar, onCerrar }) {
  const [valores, setValores] = useState({
    nombre: servicio?.nombre ?? "",
    descripcion: servicio?.descripcion ?? "",
    duracion: servicio ? String(servicio.duracion) : "",
    precio: servicio ? String(servicio.precio) : "",
  });
  const [intento, setIntento] = useState(false);
  const errores = validarServicio(valores);

  function cambiar(e) {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value }));
  }

  function guardar() {
    setIntento(true);
    if (Object.keys(errores).length > 0) return;
    onGuardar(armarServicio(valores));
  }

  return (
    <ModalBase
      titulo={servicio ? "Editar servicio" : "Nuevo servicio"}
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
        id="descripcion"
        label="Descripción"
        type="textarea"
        value={valores.descripcion}
        onChange={cambiar}
        error={errores.descripcion}
        tocado={intento}
      />
      <Campo
        id="duracion"
        label="Duración (minutos)"
        type="number"
        value={valores.duracion}
        onChange={cambiar}
        error={errores.duracion}
        tocado={intento}
        requerido
      />
      <Campo id="precio" label="Precio" type="number" value={valores.precio} onChange={cambiar} error={errores.precio} tocado={intento} requerido />
      {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
    </ModalBase>
  );
}