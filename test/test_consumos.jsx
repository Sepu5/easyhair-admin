import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import ConsumosPendientes from "@/components/dashboard/ConsumosPendientes";
import { aprobarConsumo, rechazarConsumo, formatearFechaHora } from "@/lib/dashboard";

const { module, test } = QUnit;

const consumo = {
  id: 8,
  nombreStaff: "Valeria Soto",
  nombreMaterial: "Tintura",
  cantidad: 2,
  comentario: "Para un color completo",
  fechaRegistro: "2026-11-24T15:30:12",
};

// pedir falso que anota las llamadas y puede fallar con un mensaje
function crearPedirFalso(errorMensaje = null) {
  const llamadas = [];
  const pedirFalso = async (ruta, opciones) => {
    llamadas.push({ ruta, metodo: opciones?.method });
    if (errorMensaje) throw new Error(errorMensaje);
    return {};
  };
  return { pedirFalso, llamadas };
}

module("consumos: lógica", () => {
  test("aprobar y rechazar usan PUT a su ruta", async (assert) => {
    const { pedirFalso, llamadas } = crearPedirFalso();

    await aprobarConsumo(pedirFalso, 8);
    await rechazarConsumo(pedirFalso, 9);

    assert.deepEqual(llamadas, [
      { ruta: "/api/consumos/8/aprobar", metodo: "PUT" },
      { ruta: "/api/consumos/9/rechazar", metodo: "PUT" },
    ]);
  });

  test("formatearFechaHora muestra día-mes-año y la hora sin segundos", (assert) => {
    assert.equal(formatearFechaHora("2026-11-24T15:30:12"), "24-11-2026 15:30");
    assert.equal(formatearFechaHora(null), "");
  });
});

module("ConsumosPendientes", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("lista los consumos con staff, material y cantidad", (assert) => {
    render(<ConsumosPendientes consumos={[consumo]} />);

    assert.ok(screen.getByText("Valeria Soto"));
    assert.ok(screen.getByText("Tintura"));
    assert.ok(screen.getByText("24-11-2026 15:30"));
  });

  test("sin consumos muestra un aviso", (assert) => {
    render(<ConsumosPendientes consumos={[]} />);
    assert.ok(screen.getByText("No hay consumos pendientes de revisión."));
  });

  test("aprobar pide confirmación, llama al backend y avisa al dashboard", async (assert) => {
    const { pedirFalso, llamadas } = crearPedirFalso();
    let recargado = false;
    render(<ConsumosPendientes consumos={[consumo]} pedirFn={pedirFalso} alCambiar={() => (recargado = true)} />);

    fireEvent.click(screen.getByRole("button", { name: "Aprobar" }));
    fireEvent.click(screen.getByRole("button", { name: "Aprobar y descontar stock" }));

    assert.ok(await screen.findByText(/Consumo aprobado/));
    assert.equal(llamadas[0].ruta, "/api/consumos/8/aprobar");
    assert.ok(recargado);
  });

  test("si no hay stock suficiente muestra el error del backend", async (assert) => {
    const { pedirFalso } = crearPedirFalso("No hay stock suficiente de Tintura (quedan 1 unidades)");
    render(<ConsumosPendientes consumos={[consumo]} pedirFn={pedirFalso} />);

    fireEvent.click(screen.getByRole("button", { name: "Aprobar" }));
    fireEvent.click(screen.getByRole("button", { name: "Aprobar y descontar stock" }));

    assert.ok(await screen.findByText("No hay stock suficiente de Tintura (quedan 1 unidades)"));
  });

  test("rechazar no descuenta stock y llama a la ruta de rechazar", async (assert) => {
    const { pedirFalso, llamadas } = crearPedirFalso();
    render(<ConsumosPendientes consumos={[consumo]} pedirFn={pedirFalso} />);

    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
    assert.ok(screen.getByText(/el inventario no cambia/));
    fireEvent.click(screen.getByRole("button", { name: "Rechazar consumo" }));

    assert.ok(await screen.findByText("Consumo rechazado."));
    assert.equal(llamadas[0].ruta, "/api/consumos/8/rechazar");
  });
});
