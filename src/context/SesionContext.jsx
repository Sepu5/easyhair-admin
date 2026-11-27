"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { leerSesion, guardarSesion, borrarSesion, debeRenovar, renovarSesion, puedeEntrarAlPanel } from "@/lib/sesion";
import { EVENTO_SESION_EXPIRADA, pedir } from "@/lib/api";

// Cada cuánto se revisa si el token está por vencer (5 minutos)
const CADA_CUANTO_REVISAR = 5 * 60 * 1000;

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

  // Si el backend rechaza el token (401), se cierra la sesión en todo el panel
  useEffect(() => {
    function alExpirar() {
      borrarSesion();
      setUsuario(null);
    }
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
  }, []);

  // Mientras haya sesión, cada 5 minutos se revisa si el token está por vencer.
  // Si le queda menos de 1 hora se pide uno nuevo, así la sesión no se corta
  // mientras alguien está usando el panel.
  const haySesion = usuario !== null;
  useEffect(() => {
    if (!haySesion) return;

    async function revisar() {
      const sesion = leerSesion();
      if (!sesion || !debeRenovar(sesion.token)) return;
      try {
        const nueva = await renovarSesion(pedir);
        if (puedeEntrarAlPanel(nueva.usuario.rol)) {
          guardarSesion(nueva.token, nueva.usuario);
          setUsuario(nueva.usuario);
        } else {
          // si le quitaron el acceso al panel, se cierra la sesión
          borrarSesion();
          setUsuario(null);
        }
      } catch {
        // si falla (por ejemplo sin internet) se intenta de nuevo en la próxima revisión
      }
    }

    revisar();
    const intervalo = setInterval(revisar, CADA_CUANTO_REVISAR);
    return () => clearInterval(intervalo);
  }, [haySesion]);

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
    haySesion,
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
