"use client";

import { useEffect, useState } from "react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import FiltrosUsuarios from "@/components/usuarios/FiltrosUsuarios";
import TablaUsuarios from "@/components/usuarios/TablaUsuarios";
import FormularioUsuario from "@/components/usuarios/FormularioUsuario";
import ModalCambiarRol from "@/components/usuarios/ModalCambiarRol";
import ModalEliminarUsuario from "@/components/usuarios/ModalEliminarUsuario";
import { useSesion } from "@/context/SesionContext";
import { pedir } from "@/lib/api";
import {
  listarUsuarios,
  filtrarUsuarios,
  crearUsuario,
  editarUsuario,
  cambiarRol,
  eliminarUsuario,
} from "@/lib/usuarios";

// Mantenedor de usuarios. Es solo para el ADMIN: el menú y RutaPermitida no dejan entrar al staff
export default function Usuarios() {
  const { usuario } = useSesion();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState({ texto: "", rol: "" });
  // cada vez que le sumamos 1 se vuelve a pedir la lista (después de crear, cambiar rol o eliminar)
  const [recargas, setRecargas] = useState(0);

  // aquí guardamos qué modal está abierto: { tipo: "nuevo" | "editar" | "rol" | "eliminar", usuario } o null
  const [accion, setAccion] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let vigente = true;
    listarUsuarios(pedir)
      .then((datos) => vigente && setUsuarios(datos))
      .catch((e) => vigente && setError(e.message))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [recargas]);

  function cambiarFiltro(campo, valor) {
    setFiltros((anteriores) => ({ ...anteriores, [campo]: valor }));
  }

  function abrirAccion(tipo, elegido = null) {
    setAccion({ tipo, usuario: elegido });
    setErrorAccion("");
    setAviso("");
  }

  function cerrarAccion() {
    if (!enviando) setAccion(null);
  }

  // Mandamos la acción al backend; si sale bien cerramos el modal y recargamos la lista
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
      return ejecutar(() => editarUsuario(pedir, accion.usuario.id, datos), "Usuario actualizado.");
    }
    return ejecutar(() => crearUsuario(pedir, datos), "Usuario creado.");
  }

  return (
    <>
      <EncabezadoPagina titulo="Usuarios" descripcion="Cuentas de clientes, staff y administradores" />

      <div className="d-flex justify-content-end mb-3">
        <button type="button" className="btn btn-primary" onClick={() => abrirAccion("nuevo")}>
          <i className="bi bi-person-plus"></i> Nuevo usuario
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
          <FiltrosUsuarios filtros={filtros} usuarios={usuarios} onCambiar={cambiarFiltro} />
          <TablaUsuarios
            usuarios={filtrarUsuarios(usuarios, filtros)}
            idSesion={usuario?.id}
            onEditar={(elegido) => abrirAccion("editar", elegido)}
            onCambiarRol={(elegido) => abrirAccion("rol", elegido)}
            onEliminar={(elegido) => abrirAccion("eliminar", elegido)}
          />
        </>
      )}

      {(accion?.tipo === "nuevo" || accion?.tipo === "editar") && (
        <FormularioUsuario
          usuario={accion.usuario}
          enviando={enviando}
          error={errorAccion}
          onGuardar={guardar}
          onCerrar={cerrarAccion}
        />
      )}

      {accion?.tipo === "rol" && (
        <ModalCambiarRol
          usuario={accion.usuario}
          enviando={enviando}
          error={errorAccion}
          onConfirmar={(rol) => ejecutar(() => cambiarRol(pedir, accion.usuario.id, rol), "Rol actualizado.")}
          onCerrar={cerrarAccion}
        />
      )}

      {accion?.tipo === "eliminar" && (
        <ModalEliminarUsuario
          usuario={accion.usuario}
          enviando={enviando}
          error={errorAccion}
          onConfirmar={() => ejecutar(() => eliminarUsuario(pedir, accion.usuario.id), "Usuario eliminado.")}
          onCerrar={cerrarAccion}
        />
      )}
    </>
  );
}
