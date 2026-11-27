import { render, screen, cleanup } from "@testing-library/react";
import UsuarioActual from "@/components/layout/UsuarioActual";
import { SesionProvider } from "@/context/SesionContext";
import { guardarSesion } from "@/lib/sesion";

const { module, test } = QUnit;

const token = `x.${btoa(JSON.stringify({ id: 3, rol: "STAFF", exp: Math.floor(Date.now() / 1000) + 3600 }))}.firma`;

function dibujar() {
  return render(
    <SesionProvider>
      <UsuarioActual />
    </SesionProvider>
  );
}

module("UsuarioActual", (hooks) => {
  hooks.afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  test("muestra el nombre y el rol del usuario logueado", (assert) => {
    guardarSesion(token, { id: 3, nombre: "Valeria", correo: "valeria@gmail.com", rol: "STAFF" });

    dibujar();

    assert.ok(screen.getByText("Valeria"));
    assert.ok(screen.getByText("STAFF"));
  });

  test("sin sesión no muestra nada", (assert) => {
    const { container } = dibujar();
    assert.equal(container.innerHTML, "");
  });
});
