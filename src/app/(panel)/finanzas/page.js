"use client";

import { useEffect, useState } from "react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import TarjetasResumen from "@/components/finanzas/TarjetasResumen";
import FiltrosFinanzas from "@/components/finanzas/FiltrosFinanzas";
import ResumenCategorias from "@/components/finanzas/ResumenCategorias";
import ResumenPeluqueros from "@/components/finanzas/ResumenPeluqueros";
import TablaMovimientos from "@/components/finanzas/TablaMovimientos";
import FormularioMovimiento from "@/components/finanzas/FormularioMovimiento";
import ModalEliminarMovimiento from "@/components/finanzas/ModalEliminarMovimiento";
import { pedir } from "@/lib/api";
import { cargarFinanzas, crearMovimiento, eliminarMovimiento, mesActual, mesValido } from "@/lib/finanzas";

export default function Finanzas() {
  const [filtros, setFiltros] = useState({ mes: mesActual(), tipo: "" });
  const [datos, setDatos] = useState({ movimientos: [], resumen: null, porPeluquero: [], porCategoria: [], peluqueros: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // cada vez que le sumamos 1 se vuelve a pedir todo (lo usamos después de guardar o eliminar)
  const [recargas, setRecargas] = useState(0);

  // aquí guardamos qué modal está abierto: { tipo: "nuevo" | "eliminar", movimiento } o null si no hay ninguno
  const [accion, setAccion] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");
  const [aviso, setAviso] = useState("");

  // Volvemos a pedir todo cuando cambia el mes, el tipo o después de una acción
  useEffect(() => {
    if (!mesValido(filtros.mes)) return;
    let vigente = true; // con esto evitamos mostrar una respuesta vieja si alguien cambia el filtro muy rápido

    async function cargar() {
      setCargando(true);
      setError("");
      try {
        const respuesta = await cargarFinanzas(pedir, filtros.mes, filtros.tipo);
        if (vigente) setDatos(respuesta);
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
  }, [filtros.mes, filtros.tipo, recargas]);

  function cambiarFiltro(campo, valor) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  }

  function abrirAccion(tipo, movimiento = null) {
    setAccion({ tipo, movimiento });
    setErrorAccion("");
    setAviso("");
  }

  function cerrarAccion() {
    if (!enviando) setAccion(null);
  }

  // Mandamos la acción al backend; si sale bien cerramos el modal y recargamos todo
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

  // Después de registrar nos movemos al mes del movimiento y quitamos el filtro de tipo,
  // así el movimiento nuevo aparece altiro en la tabla
  function guardar(movimiento) {
    return ejecutar(async () => {
      await crearMovimiento(pedir, movimiento);
      setFiltros({ mes: movimiento.fecha.slice(0, 7), tipo: "" });
    }, "Movimiento registrado.");
  }

  return (
    <>
      <EncabezadoPagina titulo="Finanzas" descripcion="Ingresos, egresos y ganancia de la peluquería por mes" />

      <div className="d-flex justify-content-end mb-3">
        <button type="button" className="btn btn-primary" onClick={() => abrirAccion("nuevo")}>
          <i className="bi bi-plus-lg"></i> Registrar movimiento
        </button>
      </div>

      <FiltrosFinanzas filtros={filtros} onCambiar={cambiarFiltro} />

      {aviso && (
        <div className="alert alert-success alert-dismissible">
          {aviso}
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setAviso("")}></button>
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      {!mesValido(filtros.mes) ? (
        <div className="alert alert-info">Elige un mes para ver las finanzas.</div>
      ) : cargando && !error ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <>
          <TarjetasResumen resumen={datos.resumen} />

          <div className="row g-3 mb-4">
            <div className="col-lg-7">
              <ResumenCategorias categorias={datos.porCategoria} />
            </div>
            <div className="col-lg-5">
              <ResumenPeluqueros resumen={datos.porPeluquero} peluqueros={datos.peluqueros} />
            </div>
          </div>

          <h2 className="h5">Movimientos</h2>
          <TablaMovimientos movimientos={datos.movimientos} onEliminar={(movimiento) => abrirAccion("eliminar", movimiento)} />
        </>
      )}

      {accion?.tipo === "nuevo" && (
        <FormularioMovimiento enviando={enviando} error={errorAccion} onGuardar={guardar} onCerrar={cerrarAccion} />
      )}

      {accion?.tipo === "eliminar" && (
        <ModalEliminarMovimiento
          movimiento={accion.movimiento}
          enviando={enviando}
          error={errorAccion}
          onConfirmar={() => ejecutar(() => eliminarMovimiento(pedir, accion.movimiento.id), "Movimiento eliminado.")}
          onCerrar={cerrarAccion}
        />
      )}
    </>
  );
}
