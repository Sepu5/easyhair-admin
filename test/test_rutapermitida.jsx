import { render, screen, cleanup } from "@testing-library/react";
import RutaPermitida from "@/components/layout/RutaPermitida";
import { SesionProvider } from "@/context/SesionContext";
import { guardarSesion } from "@/lib/sesion";

const { module, test } = QUnit;

function iniciarComo(rol) {
  const token = `x.${btoa(JSON.stringify({ id: 1, rol, exp: Math.floor(Date.now() / 1000) + 3600 }))}.firma`;
  guardarSesion(token, { id: 1, nombre: "Prueba", correo: "prueba@easyhair.cl", rol });
}

function dibujar(ruta) {
  return render(
    <SesionProvider>
      <RutaPermitida ruta={ruta}>
        <p>Contenido de la página</p>
      </RutaPermitida>
    </SesionProvider>
  );
}

module("RutaPermitida", (hooks) => {
  hooks.afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  test("el staff ve las secciones de la peluquería", (assert) => {
    iniciarComo("STAFF");
    dibujar("/reservas");
    assert.ok(screen.getByText("Contenido de la página"));
  });

  test("el staff ve 'Sin permisos' en finanzas", (assert) => {
    iniciarComo("STAFF");
    dibujar("/finanzas");
    assert.ok(screen.getByText("Sin permisos"));
    assert.notOk(screen.queryByText("Contenido de la página"));
    assert.ok(screen.getByRole("link", { name: "Volver al inicio" }));
  });

  test("el admin puede entrar a finanzas", (assert) => {
    iniciarComo("ADMIN");
    dibujar("/finanzas");
    assert.ok(screen.getByText("Contenido de la página"));
  });
});
