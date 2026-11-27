import { render, screen, cleanup } from "@testing-library/react";
import TarjetaResumen from "@/components/dashboard/TarjetaResumen";
import ProximasReservas from "@/components/dashboard/ProximasReservas";
import StockBajo from "@/components/dashboard/StockBajo";

const { module, test } = QUnit;

module("TarjetaResumen", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("muestra el título, el valor y el detalle", (assert) => {
    render(<TarjetaResumen titulo="Reservas de hoy" valor={4} detalle="2 por atender" icono="bi-calendar" color="primary" />);

    assert.ok(screen.getByText("Reservas de hoy"));
    assert.ok(screen.getByText("4"));
    assert.ok(screen.getByText("2 por atender"));
  });
});

module("ProximasReservas", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("lista las reservas con hora, cliente y total", (assert) => {
    render(
      <ProximasReservas
        reservas={[{ id: 1, hora: "15:00", nombreCliente: "Ana", nombrePeluquero: "Valeria", total: 7000 }]}
      />
    );

    assert.ok(screen.getByText("15:00"));
    assert.ok(screen.getByText("Ana"));
    assert.ok(screen.getByText("$7.000"));
    assert.ok(screen.getByRole("link", { name: "Ver agenda" }));
  });

  test("sin reservas pendientes muestra un aviso", (assert) => {
    render(<ProximasReservas reservas={[]} />);
    assert.ok(screen.getByText("No quedan reservas pendientes para hoy."));
  });
});

module("StockBajo", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("muestra cuánto queda y cuánto comprar de cada material", (assert) => {
    render(<StockBajo materiales={[{ id: 1, nombre: "Tintura", stock: 1, stockMinimo: 3, unidad: "unidades" }]} />);

    assert.ok(screen.getByText("Tintura"));
    assert.ok(screen.getByText("quedan 1 unidades"));
    assert.ok(screen.getByText("comprar 3 unidades"));
  });

  test("sin materiales bajo el mínimo muestra que está todo bien", (assert) => {
    render(<StockBajo materiales={[]} />);
    assert.ok(screen.getByText("Todo el inventario está sobre el stock mínimo."));
  });
});
