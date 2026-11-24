"use client";

import { useEffect, useState } from "react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import AlertaStockBajo from "@/components/inventario/AlertaStockBajo";
import TablaMateriales from "@/components/inventario/TablaMateriales";
import TablaCompras from "@/components/inventario/TablaCompras";
import FormularioMaterial from "@/components/inventario/FormularioMaterial";
import FormularioCompra from "@/components/inventario/FormularioCompra";
import { pedir } from "@/lib/api";
import { cargarInventario, crearMaterial, editarMaterial, registrarCompra } from "@/lib/inventario";

export default function Inventario() {
  const [inventario, setInventario] = useState({ materiales: [], bajos: [], compras: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // al sumarle 1 se vuelve a pedir todo (después de guardar)
  const [recargas, setRecargas] = useState(0);

  // acción abierta en un modal: { tipo: "nuevo" | "editar" | "compra", material } o null
  const [accion, setAccion] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let vigente = true; // evita mostrar una respuesta vieja si se cambia rápido

    async function cargar() {
      setCargando(true);
      setError("");
      try {
        const datos = await cargarInventario(pedir);
        if (vigente) setInventario(datos);
      } catch (e) {
        if (vigente) setError(e.message);
      } finally {
        if (vigente) setCargando(false);
      }
    }

    cargar();
    return () => {
      vigente = false;
    };
  }, [recargas]);

  function abrirAccion(tipo, material = null) {
    setAccion({ tipo, material });
    setErrorAccion("");
    setAviso("");
  }

  function cerrarAccion() {
    if (!enviando) setAccion(null);
  }

  // Ejecuta la acción en el backend; si sale bien cierra el modal y recarga todo
  async function ejecutar(llamada, mensajeExito) {
    setEnviando(true);
    setErrorAccion("");
    try {
      await llamada();
      setAccion(null);
      setAviso(mensajeExito);
      setRecargas((n) => n + 1);
    } catch (e) {
      setErrorAccion(e.message);
    } finally {
      setEnviando(false);
    }
  }

  function guardarMaterial(datos) {
    if (accion.tipo === "editar") {
      const mensaje = datos.activo ? "Material actualizado." : "Material desactivado.";
      return ejecutar(() => editarMaterial(pedir, accion.material.id, datos), mensaje);
    }
    return ejecutar(() => crearMaterial(pedir, datos), "Material creado.");
  }

  function guardarCompra(datos) {
    return ejecutar(() => registrarCompra(pedir, datos), "Compra registrada. El stock del material se actualizó.");
  }

  const idsBajos = inventario.bajos.map((material) => material.id);

  return (
    <>
      <EncabezadoPagina titulo="Inventario" descripcion="Materiales, alerta de stock bajo y compras" />

      <div className="d-flex justify-content-end gap-2 mb-3">
        <button type="button" className="btn btn-outline-success" onClick={() => abrirAccion("compra")}>
          <i className="bi bi-cart-plus"></i> Registrar compra
        </button>
        <button type="button" className="btn btn-primary" onClick={() => abrirAccion("nuevo")}>
          <i className="bi bi-plus-lg"></i> Nuevo material
        </button>
      </div>

      {aviso && (
        <div className="alert alert-success alert-dismissible">
          {aviso}
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setAviso("")}></button>
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      {cargando && !error ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <>
          <AlertaStockBajo materiales={inventario.bajos} />
          <TablaMateriales
            materiales={inventario.materiales}
            idsBajos={idsBajos}
            onEditar={(material) => abrirAccion("editar", material)}
            onComprar={(material) => abrirAccion("compra", material)}
          />

          <h2 className="h5 mt-4">Historial de compras</h2>
          <TablaCompras compras={inventario.compras} />
        </>
      )}

      {(accion?.tipo === "nuevo" || accion?.tipo === "editar") && (
        <FormularioMaterial
          material={accion.material}
          enviando={enviando}
          error={errorAccion}
          onGuardar={guardarMaterial}
          onCerrar={cerrarAccion}
        />
      )}

      {accion?.tipo === "compra" && (
        <FormularioCompra
          materiales={inventario.materiales}
          materialInicial={accion.material}
          enviando={enviando}
          error={errorAccion}
          onGuardar={guardarCompra}
          onCerrar={cerrarAccion}
        />
      )}
    </>
  );
}
