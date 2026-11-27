"use client";

import { useState } from "react";
import ModalBase from "@/components/reservas/ModalBase";
import Campo from "@/components/formularios/Campo";
import { validarMaterial, armarMaterial } from "@/lib/inventario";

// Formulario para crear o editar un material (si nos llega "material" es porque estamos editando)
export default function FormularioMaterial({ material, enviando, error, onGuardar, onCerrar }) {
  const [valores, setValores] = useState({
    nombre: material?.nombre ?? "",
    unidad: material?.unidad ?? "",
    stock: material ? String(material.stock) : "",
    stockMinimo: material ? String(material.stockMinimo) : "",
    precioUnitario: material?.precioUnitario != null ? String(material.precioUnitario) : "",
    activo: material ? material.activo : true,
  });
  const [intento, setIntento] = useState(false);
  const errores = validarMaterial(valores);

  function cambiar(e) {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value }));
  }

  function guardar() {
    setIntento(true);
    if (Object.keys(errores).length > 0) return;
    onGuardar(armarMaterial(valores));
  }

  return (
    <ModalBase
      titulo={material ? "Editar material" : "Nuevo material"}
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
        id="unidad"
        label="Unidad"
        value={valores.unidad}
        onChange={cambiar}
        error={errores.unidad}
        tocado={intento}
        placeholder="ml, gr o unidades"
        requerido
      />
      <Campo id="stock" label="Stock actual" type="number" value={valores.stock} onChange={cambiar} error={errores.stock} tocado={intento} requerido />
      <Campo
        id="stockMinimo"
        label="Stock mínimo"
        type="number"
        value={valores.stockMinimo}
        onChange={cambiar}
        error={errores.stockMinimo}
        tocado={intento}
        requerido
      />
      <Campo
        id="precioUnitario"
        label="Precio unitario (opcional)"
        type="number"
        value={valores.precioUnitario}
        onChange={cambiar}
        error={errores.precioUnitario}
        tocado={intento}
      />
      {material && (
        <div className="form-check form-switch">
          <input
            id="activo"
            type="checkbox"
            className="form-check-input"
            checked={valores.activo}
            onChange={(e) => setValores((prev) => ({ ...prev, activo: e.target.checked }))}
          />
          <label htmlFor="activo" className="form-check-label">
            Material activo
          </label>
          <div className="form-text">Si lo desactivas, deja de aparecer en el inventario.</div>
        </div>
      )}
      {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
    </ModalBase>
  );
}
