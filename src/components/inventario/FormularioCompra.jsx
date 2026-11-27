"use client";

import { useState } from "react";
import ModalBase from "@/components/reservas/ModalBase";
import Campo from "@/components/formularios/Campo";
import { validarCompra, armarCompra } from "@/lib/inventario";

// Registrar la compra de un material (si llega materialInicial, ese material ya viene elegido)
export default function FormularioCompra({ materiales, materialInicial, enviando, error, onGuardar, onCerrar }) {
  const [valores, setValores] = useState({
    materialId: materialInicial ? String(materialInicial.id) : "",
    cantidad: "",
    costoTotal: "",
  });
  const [intento, setIntento] = useState(false);
  const errores = validarCompra(valores);

  function cambiar(e) {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value }));
  }

  function guardar() {
    setIntento(true);
    if (Object.keys(errores).length > 0) return;
    onGuardar(armarCompra(valores));
  }

  return (
    <ModalBase
      titulo="Registrar compra"
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
      <Campo
        id="materialId"
        label="Material"
        type="select"
        value={valores.materialId}
        onChange={cambiar}
        error={errores.materialId}
        tocado={intento}
        requerido
      >
        <option value="">Elige un material</option>
        {materiales.map((material) => (
          <option key={material.id} value={material.id}>
            {material.nombre} ({material.unidad})
          </option>
        ))}
      </Campo>
      <Campo id="cantidad" label="Cantidad" type="number" value={valores.cantidad} onChange={cambiar} error={errores.cantidad} tocado={intento} requerido />
      <Campo
        id="costoTotal"
        label="Costo total"
        type="number"
        value={valores.costoTotal}
        onChange={cambiar}
        error={errores.costoTotal}
        tocado={intento}
        requerido
      />
      <p className="text-muted small mb-0">Al guardar se suma el stock del material y se anota el gasto en Finanzas.</p>
      {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
    </ModalBase>
  );
}
