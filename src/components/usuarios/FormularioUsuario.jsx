"use client";

import { useState } from "react";
import ModalBase from "@/components/reservas/ModalBase";
import Campo from "@/components/formularios/Campo";
import { ETIQUETAS_ROL, ROLES, validarUsuario, armarUsuario } from "@/lib/usuarios";

// Formulario para crear una cuenta nueva con su rol o editar una que ya existe
// (si nos llega "usuario" estamos editando: el rol se cambia aparte y la contraseña es opcional)
export default function FormularioUsuario({ usuario, enviando, error, onGuardar, onCerrar }) {
  const editando = Boolean(usuario);
  const [valores, setValores] = useState({
    nombre: usuario?.nombre ?? "",
    correo: usuario?.correo ?? "",
    password: "",
    rol: usuario?.rol ?? "STAFF",
  });
  const [intento, setIntento] = useState(false);
  const errores = validarUsuario(valores, editando);

  function cambiar(e) {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value }));
  }

  function guardar() {
    setIntento(true);
    if (Object.keys(errores).length > 0) return;
    onGuardar(armarUsuario(valores, editando));
  }

  return (
    <ModalBase
      titulo={editando ? "Editar usuario" : "Nuevo usuario"}
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCerrar} disabled={enviando}>
            Volver
          </button>
          <button type="button" className="btn btn-primary" onClick={guardar} disabled={enviando}>
            {enviando ? "Guardando..." : editando ? "Guardar cambios" : "Crear usuario"}
          </button>
        </>
      }
    >
      <Campo id="nombre" label="Nombre" value={valores.nombre} onChange={cambiar} error={errores.nombre} tocado={intento} requerido />
      <Campo
        id="correo"
        label="Correo"
        type="email"
        value={valores.correo}
        onChange={cambiar}
        error={errores.correo}
        tocado={intento}
        placeholder="nombre@easyhair.cl"
        requerido
      />
      <Campo
        id="password"
        label={editando ? "Nueva contraseña (opcional)" : "Contraseña"}
        type="password"
        value={valores.password}
        onChange={cambiar}
        error={errores.password}
        tocado={intento}
        autoComplete="new-password"
        placeholder={editando ? "Déjala vacía para no cambiarla" : undefined}
        requerido={!editando}
      />
      {!editando && (
        <Campo id="rol" label="Rol" type="select" value={valores.rol} onChange={cambiar} error={errores.rol} tocado={intento} requerido>
          {ROLES.map((rol) => (
            <option key={rol} value={rol}>
              {ETIQUETAS_ROL[rol].texto}
            </option>
          ))}
        </Campo>
      )}
      {!editando && valores.rol === "STAFF" && (
        <p className="small text-muted mb-0">
          Para que vea su agenda, crea también el peluquero con el mismo correo en la sección Peluqueros.
        </p>
      )}
      {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
    </ModalBase>
  );
}
