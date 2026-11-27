"use client";

import { useEffect, useState } from "react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import FormularioPerfil from "@/components/perfil/FormularioPerfil";
import { useSesion } from "@/context/SesionContext";
import { pedir, leerToken } from "@/lib/api";
import { cargarPerfil, guardarPerfil } from "@/lib/perfil";

export default function Perfil() {
  const { usuario, iniciarSesion } = useSesion();
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState("");
  const [aviso, setAviso] = useState("");
  // cada vez que le sumamos 1 el formulario se arma de nuevo (así quedan vacíos los campos de contraseña)
  const [version, setVersion] = useState(0);

  const id = usuario?.id;

  useEffect(() => {
    if (!id) return;
    let vigente = true; // con esto evitamos mostrar una respuesta vieja

    async function cargar() {
      setCargando(true);
      setError("");
      try {
        const datos = await cargarPerfil(pedir, id);
        if (vigente) setPerfil(datos);
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
  }, [id]);

  async function guardar(datos) {
    setEnviando(true);
    setErrorGuardar("");
    setAviso("");
    try {
      const actualizado = await guardarPerfil(pedir, perfil.id, datos);
      setPerfil(actualizado);
      // La barra de arriba muestra el nombre guardado en la sesión, así que la guardamos otra vez
      // con los datos nuevos (el token sigue siendo el mismo)
      iniciarSesion(leerToken(), actualizado);
      setVersion((n) => n + 1);
      setAviso("Perfil actualizado.");
    } catch (e) {
      setErrorGuardar(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <EncabezadoPagina titulo="Perfil" descripcion="Datos de tu cuenta" />

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
        perfil && (
          <div className="row">
            <div className="col-lg-6">
              <FormularioPerfil key={version} perfil={perfil} enviando={enviando} error={errorGuardar} onGuardar={guardar} />
            </div>
          </div>
        )
      )}
    </>
  );
}
