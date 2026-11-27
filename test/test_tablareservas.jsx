import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import TablaReservas from "@/components/reservas/TablaReservas";
import FiltrosAgenda from "@/components/reservas/FiltrosAgenda";
import ResumenEstados from "@/components/reservas/ResumenEstados";

const { module, test } = QUnit;

const reservas = [
  { id: 1, hora: "10:00", nombreCliente: "Ana", correoCliente: "ana@gmail.com", nombrePeluquero: "Valeria", servicios: "Corte", total: 6000, estado: "ATENDIDA" },
  { id: 2, hora: "11:00", nombreCliente: "Pepe", correoCliente: "pepe@gmail.com", nombrePeluquero: "Valeria", servicios: "Lavado", total: 1500, estado: "PENDIENTE" },
];

module("TablaReservas", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("dibuja una fila por reserva con su precio y estado", (assert) => {
    render(<TablaReservas reservas={reservas} />);

    assert.equal(screen.getAllByRole("row").length, 3); // encabezado + 2 reservas
    assert.ok(screen.getByText("$6.000"));
    assert.ok(screen.getByText("Atendida"));
    assert.ok(screen.getByText("Pendiente"));
  });

  test("sin reservas muestra un aviso en vez de la tabla", (assert) => {
    render(<TablaReservas reservas={[]} />);

    assert.ok(screen.getByText(/No hay reservas/));
    assert.equal(screen.queryByRole("table"), null);
  });
});

module("ResumenEstados", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("muestra el total y cuántas hay de cada estado", (assert) => {
    render(<ResumenEstados reservas={reservas} />);

    assert.ok(screen.getByText("Total: 2"));
    assert.ok(screen.getByText("Atendida: 1"));
    assert.ok(screen.getByText("Cancelada: 0"));
  });
});

module("FiltrosAgenda", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("muestra los peluqueros y avisa qué filtro cambió", (assert) => {
    const cambios = [];
    render(
      <FiltrosAgenda
        filtros={{ fecha: "2026-11-12", peluqueroId: "", estado: "" }}
        peluqueros={[{ id: 1, nombre: "Valeria" }]}
        onCambiar={(campo, valor) => cambios.push([campo, valor])}
      />
    );

    fireEvent.change(screen.getByLabelText("Peluquero"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Estado"), { target: { value: "CANCELADA" } });

    assert.ok(screen.getByRole("option", { name: "Valeria" }));
    assert.deepEqual(cambios, [
      ["peluqueroId", "1"],
      ["estado", "CANCELADA"],
    ]);
  });
});
