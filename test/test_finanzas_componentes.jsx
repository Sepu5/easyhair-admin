import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import TarjetasResumen from "@/components/finanzas/TarjetasResumen";
import FiltrosFinanzas from "@/components/finanzas/FiltrosFinanzas";
import ResumenCategorias from "@/components/finanzas/ResumenCategorias";
import ResumenPeluqueros from "@/components/finanzas/ResumenPeluqueros";
import TablaMovimientos from "@/components/finanzas/TablaMovimientos";
import ModalEliminarMovimiento from "@/components/finanzas/ModalEliminarMovimiento";
import FormularioMovimiento from "@/components/finanzas/FormularioMovimiento";

const { module, test } = QUnit;

const movimientos = [
  { id: 1, tipo: "INGRESO", categoria: "SERVICIO", descripcion: "Corte", monto: 8000, fecha: "2026-11-20", reservaId: 5, peluqueroId: 1 },
  { id: 2, tipo: "EGRESO", categoria: "ARRIENDO", descripcion: "", monto: 300000, fecha: "2026-11-01" },
];

module("TarjetasResumen", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("muestra los ingresos, egresos y la ganancia del mes", (assert) => {
    render(<TarjetasResumen resumen={{ totalIngresos: 50000, totalEgresos: 20000, ganancia: 30000 }} />);

    assert.ok(screen.getByText("Ingresos"));
    assert.ok(screen.getByText("$50.000"));
    assert.ok(screen.getByText("Egresos"));
    assert.ok(screen.getByText("$20.000"));
    assert.ok(screen.getByText("Ganancia"));
    assert.ok(screen.getByText("$30.000"));
  });

  test("sin resumen no dibuja nada", (assert) => {
    render(<TarjetasResumen resumen={null} />);

    assert.equal(screen.queryByText("Ganancia"), null);
  });
});

module("FiltrosFinanzas", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("muestra el mes elegido y avisa qué filtro cambió", (assert) => {
    const cambios = [];
    render(<FiltrosFinanzas filtros={{ mes: "2026-11", tipo: "" }} onCambiar={(campo, valor) => cambios.push([campo, valor])} />);

    assert.equal(screen.getByLabelText("Mes").value, "2026-11");

    fireEvent.change(screen.getByLabelText("Mes"), { target: { value: "2026-10" } });
    fireEvent.change(screen.getByLabelText("Tipo"), { target: { value: "EGRESO" } });

    assert.deepEqual(cambios, [
      ["mes", "2026-10"],
      ["tipo", "EGRESO"],
    ]);
  });
});

module("ResumenCategorias", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("muestra el total de cada categoría con su tipo", (assert) => {
    const categorias = [
      { categoria: "SERVICIO", tipo: "INGRESO", total: 8000 },
      { categoria: "ARRIENDO", tipo: "EGRESO", total: 300000 },
    ];
    render(<ResumenCategorias categorias={categorias} />);

    assert.ok(screen.getByText("Servicio"));
    assert.ok(screen.getByText("Ingreso"));
    assert.ok(screen.getByText("$8.000"));
    assert.ok(screen.getByText("Arriendo"));
    assert.ok(screen.getByText("$300.000"));
  });

  test("sin datos muestra un aviso", (assert) => {
    render(<ResumenCategorias categorias={[]} />);

    assert.ok(screen.getByText("Sin movimientos este mes."));
  });
});

module("ResumenPeluqueros", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("muestra el nombre del peluquero o su número si ya no está en la lista", (assert) => {
    const resumen = [
      { peluqueroId: 1, totalIngresos: 8000 },
      { peluqueroId: 9, totalIngresos: 2000 },
    ];
    render(<ResumenPeluqueros resumen={resumen} peluqueros={[{ id: 1, nombre: "Valeria" }]} />);

    assert.ok(screen.getByText("Valeria"));
    assert.ok(screen.getByText("$8.000"));
    assert.ok(screen.getByText("Peluquero #9"));
  });

  test("sin datos muestra un aviso", (assert) => {
    render(<ResumenPeluqueros resumen={[]} peluqueros={[]} />);

    assert.ok(screen.getByText("Sin ingresos por servicios este mes."));
  });
});

module("TablaMovimientos", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("dibuja una fila por movimiento con su tipo, categoría y monto", (assert) => {
    render(<TablaMovimientos movimientos={movimientos} onEliminar={() => {}} />);

    assert.equal(screen.getAllByRole("row").length, 3); // encabezado + 2 movimientos
    assert.ok(screen.getByText("20-11-2026"));
    assert.ok(screen.getByText("Ingreso"));
    assert.ok(screen.getByText("Servicio"));
    assert.ok(screen.getByText("$8.000"));
    assert.ok(screen.getByText("Egreso"));
    assert.ok(screen.getByText("$300.000"));
    assert.ok(screen.getByText("—")); // el arriendo no tiene descripción
  });

  test("sin movimientos muestra un aviso en vez de la tabla", (assert) => {
    render(<TablaMovimientos movimientos={[]} onEliminar={() => {}} />);

    assert.ok(screen.getByText(/No hay movimientos/));
    assert.equal(screen.queryByRole("table"), null);
  });

  test("eliminar avisa qué movimiento se eligió", (assert) => {
    const eliminados = [];
    render(<TablaMovimientos movimientos={movimientos} onEliminar={(m) => eliminados.push(m.id)} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[1]);

    assert.deepEqual(eliminados, [2]);
  });
});

module("ModalEliminarMovimiento", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("muestra el monto, avisa si viene de una reserva y confirma", (assert) => {
    let confirmado = false;
    render(<ModalEliminarMovimiento movimiento={movimientos[0]} onConfirmar={() => (confirmado = true)} onCerrar={() => {}} />);

    assert.ok(screen.getByText("$8.000"));
    assert.ok(screen.getByText(/atender una reserva/));

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    assert.ok(confirmado);
  });

  test("un movimiento sin reserva no muestra ese aviso", (assert) => {
    render(<ModalEliminarMovimiento movimiento={movimientos[1]} onConfirmar={() => {}} onCerrar={() => {}} />);

    assert.equal(screen.queryByText(/atender una reserva/), null);
  });
});

module("FormularioMovimiento", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("enviar vacío muestra los errores y no guarda", (assert) => {
    const guardados = [];
    render(<FormularioMovimiento onGuardar={(d) => guardados.push(d)} onCerrar={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    assert.ok(screen.getByText("Elige si es un ingreso o un egreso."));
    assert.ok(screen.getByText("Elige la categoría."));
    assert.ok(screen.getByText("El monto debe ser un número entero mayor a 0."));
    assert.equal(guardados.length, 0);
  });

  test("con datos correctos manda el movimiento con el monto como número", (assert) => {
    const guardados = [];
    render(<FormularioMovimiento onGuardar={(d) => guardados.push(d)} onCerrar={() => {}} />);

    fireEvent.change(screen.getByLabelText("Tipo"), { target: { value: "INGRESO" } });
    fireEvent.change(screen.getByLabelText("Categoría"), { target: { value: "OTRO" } });
    fireEvent.change(screen.getByLabelText("Monto"), { target: { value: "5000" } });
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2026-11-20" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    assert.deepEqual(guardados, [
      { tipo: "INGRESO", categoria: "OTRO", monto: 5000, fecha: "2026-11-20", descripcion: "" },
    ]);
  });

  test("muestra el error que manda el backend", (assert) => {
    render(<FormularioMovimiento error="El monto debe ser mayor a 0" onGuardar={() => {}} onCerrar={() => {}} />);

    assert.ok(screen.getByText("El monto debe ser mayor a 0"));
  });
});
