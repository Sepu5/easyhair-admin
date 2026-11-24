"use client";

import { useEffect, useState } from "react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import TablaPeluqueros from "@/components/peluqueros/TablaPeluqueros";
import FormularioPeluquero from "@/components/peluqueros/FormularioPeluquero";
import { pedir } from "@/lib/api";
import { listarPeluqueros, crearPeluquero, editarPeluquero } from "@/lib/peluqueros";

export default function Peluqueros() {
  const [peluqueros, setPeluqueros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // al sumarle 1 se vuelve a pedir la lista (después de guardar)
  const [recargas, setRecargas] = useState(0);

  // acción abierta en el modal: { tipo: "nuevo" | "editar", peluquero } o null
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
        const datos = await listarPeluqueros(pedir);
        if (vigente) setPeluqueros(datos);
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

  function abrirAccion(tipo, peluquero = null) {
    setAccion({ tipo, peluquero });
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
      const mensaje = datos.activo ? "Peluquero actualizado." : "Peluquero desactivado.";
      return ejecutar(() => editarPeluquero(pedir, accion.peluquero.id, datos), mensaje);
    }
    return ejecutar(() => crearPeluquero(pedir, datos), "Peluquero creado.");
  }

  return (
    <>
      <EncabezadoPagina titulo="Peluqueros" descripcion="Equipo de la peluquería y su correo de acceso" />

      <div className="d-flex justify-content-end mb-3">
        <button type="button" className="btn btn-primary" onClick={() => abrirAccion("nuevo")}>
          <i className="bi bi-plus-lg"></i> Nuevo peluquero
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
        <TablaPeluqueros peluqueros={peluqueros} onEditar={(peluquero) => abrirAccion("editar", peluquero)} />
      )}

      {accion && (
        <FormularioPeluquero
          peluquero={accion.peluquero}
          enviando={enviando}
          error={errorAccion}
          onGuardar={guardar}
          onCerrar={cerrarAccion}
        />
      )}
    </>
  );
}