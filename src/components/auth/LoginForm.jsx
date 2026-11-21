"use client";

import { useState } from "react";
import Campo from "@/components/formularios/Campo";
import { validarLogin } from "@/lib/validaciones";
import { pedir } from "@/lib/api";
import { puedeEntrarAlPanel } from "@/lib/sesion";
import { useSesion } from "@/context/SesionContext";

const INICIAL = { correo: "", contrasena: "" };

// Formulario de inicio de sesión.
// alEntrar es la función que se llama cuando el login sale bien (la página redirige al panel).
export default function LoginForm({ alEntrar }) {
  const { iniciarSesion } = useSesion();
  const [valores, setValores] = useState(INICIAL);
  const [tocados, setTocados] = useState({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [errorServidor, setErrorServidor] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Los errores se calculan a partir de los valores en cada render
  const errores = validarLogin(valores);

  function handleChange(e) {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value }));
    setErrorServidor("");
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTocados((prev) => ({ ...prev, [name]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIntentoEnvio(true);
    if (Object.keys(errores).length > 0) return; // no deja enviar datos inválidos

    setEnviando(true);
    try {
      const respuesta = await pedir("/api/auth/login", {
        method: "POST",
        body: { correo: valores.correo.trim(), password: valores.contrasena },
      });

      // el panel es solo para la administración, no para clientes
      if (!puedeEntrarAlPanel(respuesta.usuario.rol)) {
        setErrorServidor("Esta cuenta es de cliente. Usa la app de EasyHair para reservar.");
        return;
      }

      iniciarSesion(respuesta.token, respuesta.usuario);
      if (alEntrar) alEntrar();
    } catch (error) {
      setErrorServidor(error.message);
    } finally {
      setEnviando(false);
    }
  }

  const mostrar = (campo) => tocados[campo] || intentoEnvio;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errorServidor && (
        <div className="alert alert-danger" role="alert">
          {errorServidor}
        </div>
      )}

      <Campo
        id="correo"
        label="Correo electrónico"
        type="email"
        placeholder="correo@ejemplo.com"
        autoComplete="email"
        value={valores.correo}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errores.correo}
        tocado={mostrar("correo")}
      />

      <Campo
        id="contrasena"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        value={valores.contrasena}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errores.contrasena}
        tocado={mostrar("contrasena")}
      />

      <div className="d-grid mt-4">
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </div>
    </form>
  );
}
