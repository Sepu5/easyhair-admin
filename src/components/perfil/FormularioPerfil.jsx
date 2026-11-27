"use client";

import { useState } from "react";
import Campo from "@/components/formularios/Campo";
import { validarPerfil, armarPerfil } from "@/lib/perfil";

// Formulario con los datos de la cuenta (la contraseña nueva es opcional)
export default function FormularioPerfil({ perfil, enviando, error, onGuardar }) {
  const [valores, setValores] = useState({
    nombre: perfil.nombre,
    correo: perfil.correo,
    password: "",
    confirmar: "",
  });
  const [intento, setIntento] = useState(false);
  const errores = validarPerfil(valores);

  function cambiar(e) {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value }));
  }

  function enviar(e) {
    e.preventDefault();
    setIntento(true);
    if (Object.keys(errores).length > 0) return;
    onGuardar(armarPerfil(valores));
  }

  return (
    <form onSubmit={enviar} noValidate className="card card-body border-0 shadow-sm">
      <div className="mb-3">
        <span className="form-label d-block">Rol</span>
        <span className="badge text-bg-secondary">{perfil.rol}</span>
        <div className="form-text">El rol lo define el sistema y no se puede cambiar.</div>
      </div>

      <Campo id="nombre" label="Nombre" value={valores.nombre} onChange={cambiar} error={errores.nombre} tocado={intento} requerido />
      <Campo
        id="correo"
        label="Correo"
        type="email"
        autoComplete="email"
        value={valores.correo}
        onChange={cambiar}
        error={errores.correo}
        tocado={intento}
        requerido
      />

      <hr />
      <p className="text-muted small">Si no quieres cambiar tu contraseña, deja estos campos vacíos.</p>
      <Campo
        id="password"
        label="Nueva contraseña (opcional)"
        type="password"
        autoComplete="new-password"
        value={valores.password}
        onChange={cambiar}
        error={errores.password}
        tocado={intento}
      />
      <Campo
        id="confirmar"
        label="Confirmar nueva contraseña"
        type="password"
        autoComplete="new-password"
        value={valores.confirmar}
        onChange={cambiar}
        error={errores.confirmar}
        tocado={intento}
      />

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-grid">
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
