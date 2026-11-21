import { render, screen, cleanup } from "@testing-library/react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";

const { module, test } = QUnit;

module("EncabezadoPagina", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("muestra el título y la descripción", (assert) => {
    render(<EncabezadoPagina titulo="Servicios" descripcion="Lista de servicios" />);

    assert.ok(screen.getByRole("heading", { name: "Servicios" }));
    assert.ok(screen.getByText("Lista de servicios"));
  });

  test("sin descripción no dibuja el párrafo", (assert) => {
    const { container } = render(<EncabezadoPagina titulo="Perfil" />);

    assert.equal(container.querySelectorAll("p").length, 0);
  });
});
