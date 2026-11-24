"use client";

import { useEffect, useState } from "react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import TablaServicios from "@/components/servicios/TablaServicios";
import FormularioServicio from "@/components/servicios/FormularioServicio";
import ModalEliminarServicio from "@/components/servicios/ModalEliminarServicio";
import { pedir } from "@/lib/api";
import { cargarServicios, crearServicio, editarServicio, eliminarServicio } from "@/lib/servicios";

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // al sumarle 1 se vuelve a pedir la lista (después de guardar o eliminar)
  const [recargas, setRecargas] = useState(0);

  // acción abierta en un modal: { tipo: "nuevo" | "editar" | "eliminar", servicio } o null
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
        const datos = await cargarServicios(pedir);
        if (vigente) setServicios(datos);
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

  function abrirAccion(tipo, servicio = null) {
    setAccion({ tipo, servicio });
    setErrorAccion("");
    setAviso("");
  }

  function cerrarAccion() {
    if (!enviando) setAccion(null);
  }

  // Ejecuta la acción en el backend; si sale bien cierra el modal y recarga la lista
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

  function guardar(datos) {
    if (accion.tipo === "editar") {
      return ejecutar(() => editarServicio(pedir, accion.servicio.id, datos), "Servicio actualizado.");
    }
    return ejecutar(() => crearServicio(pedir, datos), "Servicio creado.");
  }

  return (
    <>
      <EncabezadoPagina titulo="Servicios" descripcion="Servicios que ofrece la peluquería, con su duración y precio" />

      <div className="d-flex justify-content-end mb-3">
        <button type="button" className="btn btn-primary" onClick={() => abrirAccion("nuevo")}>
          <i className="bi bi-plus-lg"></i> Nuevo servicio
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
        <TablaServicios
          servicios={servicios}
          onEditar={(servicio) => abrirAccion("editar", servicio)}
          onEliminar={(servicio) => abrirAccion("eliminar", servicio)}
        />
      )}

      {(accion?.tipo === "nuevo" || accion?.tipo === "editar") && (
        <FormularioServicio
          servicio={accion.servicio}
          enviando={enviando}
          error={errorAccion}
          onGuardar={guardar}
          onCerrar={cerrarAccion}
        />
      )}

      {accion?.tipo === "eliminar" && (
        <ModalEliminarServicio
          servicio={accion.servicio}
          enviando={enviando}
          error={errorAccion}
          onConfirmar={() => ejecutar(() => eliminarServicio(pedir, accion.servicio.id), "Servicio eliminado.")}
          onCerrar={cerrarAccion}
        />
      )}
    </>
  );
}