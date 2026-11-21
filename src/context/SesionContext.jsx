"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { leerSesion, guardarSesion, borrarSesion } from "@/lib/sesion";

// Context: comparte el usuario que inició sesión con todo el panel
const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  // true mientras todavía no revisamos si había una sesión guardada
  const [cargando, setCargando] = useState(true);

  // Al cargar o recargar la página: recuperar la sesión guardada (si no venció)
  useEffect(() => {
    const sesion = leerSesion();
    // localStorage solo existe en el navegador, por eso se lee aquí
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (sesion) setUsuario(sesion.usuario);
    setCargando(false);
  }, []);

  function iniciarSesion(token, datosUsuario) {
    guardarSesion(token, datosUsuario);
    setUsuario(datosUsuario);
  }

  function cerrarSesion() {
    borrarSesion();
    setUsuario(null);
  }

  const valor = {
    usuario,
    cargando,
    haySesion: usuario !== null,
    iniciarSesion,
    cerrarSesion,
  };

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

// Hook para usar la sesión desde cualquier componente cliente
export function useSesion() {
  const contexto = useContext(SesionContext);
  if (!contexto) {
    throw new Error("useSesion debe usarse dentro de un SesionProvider");
  }
  return contexto;
}
