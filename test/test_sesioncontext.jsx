import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { SesionProvider, useSesion } from "@/context/SesionContext";
import { guardarSesion, CLAVE_USUARIO } from "@/lib/sesion";
import { CLAVE_TOKEN, EVENTO_SESION_EXPIRADA } from "@/lib/api";

const { module, test } = QUnit;

// Token falso que vence en una hora
function tokenFalso() {
  const datos = { id: 1, rol: "ADMIN", exp: Math.floor(Date.now() / 1000) + 3600 };
  return `x.${btoa(JSON.stringify(datos))}.firma`;
}

const ana = { id: 1, nombre: "Ana", correo: "ana@gmail.com", rol: "ADMIN" };

// Componente de prueba que muestra lo que tiene el contexto
function MostrarSesion() {
  const { usuario, haySesion, iniciarSesion, cerrarSesion } = useSesion();
  return (
    <div>
      <p>{haySesion ? `Hola ${usuario.nombre}` : "Sin sesión"}</p>
      <button onClick={() => iniciarSesion(tokenFalso(), ana)}>Entrar</button>
      <button onClick={cerrarSesion}>Salir</button>
    </div>
  );
}

function dibujar() {
  return render(
    <SesionProvider>
      <MostrarSesion />
    </SesionProvider>
  );
}

module("SesionContext", (hooks) => {
  hooks.afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  test("sin sesión guardada muestra que no hay sesión", (assert) => {
    dibujar();
    assert.ok(screen.getByText("Sin sesión"));
  });

  test("recupera la sesión guardada al cargar (como al recargar la página)", (assert) => {
    guardarSesion(tokenFalso(), ana);

    dibujar();

    assert.ok(screen.getByText("Hola Ana"));
  });

  test("iniciarSesion guarda en localStorage y muestra al usuario", (assert) => {
    dibujar();

    fireEvent.click(screen.getByText("Entrar"));

    assert.ok(screen.getByText("Hola Ana"));
    assert.ok(localStorage.getItem(CLAVE_TOKEN));
    assert.deepEqual(JSON.parse(localStorage.getItem(CLAVE_USUARIO)), ana);
  });

  test("cerrarSesion borra la sesión", (assert) => {
    guardarSesion(tokenFalso(), ana);
    dibujar();

    fireEvent.click(screen.getByText("Salir"));

    assert.ok(screen.getByText("Sin sesión"));
    assert.equal(localStorage.getItem(CLAVE_TOKEN), null);
  });

  test("si el backend avisa que el token expiró, se cierra la sesión", (assert) => {
    guardarSesion(tokenFalso(), ana);
    dibujar();

    act(() => {
      window.dispatchEvent(new window.Event(EVENTO_SESION_EXPIRADA));
    });

    assert.ok(screen.getByText("Sin sesión"));
    assert.equal(localStorage.getItem(CLAVE_TOKEN), null);
  });
});
