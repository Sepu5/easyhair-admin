import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import AlertaStockBajo from "@/components/inventario/AlertaStockBajo";
import TablaMateriales from "@/components/inventario/TablaMateriales";
import TablaCompras from "@/components/inventario/TablaCompras";
import FormularioMaterial from "@/components/inventario/FormularioMaterial";
import FormularioCompra from "@/components/inventario/FormularioCompra";

const { module, test } = QUnit;

const materiales = [
  { id: 1, nombre: "Tinte", unidad: "ml", stock: 2, stockMinimo: 5, precioUnitario: 12000, activo: true },
  { id: 2, nombre: "Shampoo", unidad: "unidades", stock: 20, stockMinimo: 4, precioUnitario: null, activo: true },
];

module("AlertaStockBajo", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("avisa cuántos materiales tienen stock bajo y cuáles son", (assert) => {
    render(<AlertaStockBajo materiales={[materiales[0]]} />);

    assert.ok(screen.getByText("Stock bajo en 1 material:"));
    assert.ok(screen.getByText(/Tinte \(2 ml\)/));
  });

  test("sin materiales con stock bajo no dibuja nada", (assert) => {
    render(<AlertaStockBajo materiales={[]} />);

    assert.equal(screen.queryByText(/Stock bajo en/), null);
  });
});

module("TablaMateriales", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("dibuja una fila por material y marca solo el de stock bajo", (assert) => {
    render(<TablaMateriales materiales={materiales} idsBajos={[1]} onEditar={() => {}} onComprar={() => {}} />);

    assert.equal(screen.getAllByRole("row").length, 3); // encabezado + 2 materiales
    assert.ok(screen.getByText("2 ml"));
    assert.ok(screen.getByText("$12.000"));
    assert.ok(screen.getByText("—")); // el shampoo no tiene precio
    assert.equal(screen.getAllByText("Stock bajo").length, 1);
    assert.equal(screen.getAllByText("Stock normal").length, 1);
  });

  test("sin materiales muestra un aviso en vez de la tabla", (assert) => {
    render(<TablaMateriales materiales={[]} idsBajos={[]} onEditar={() => {}} onComprar={() => {}} />);

    assert.ok(screen.getByText(/Aún no hay materiales/));
    assert.equal(screen.queryByRole("table"), null);
  });

  test("editar y comprar avisan qué material se eligió", (assert) => {
    const editados = [];
    const comprados = [];
    render(
      <TablaMateriales
        materiales={materiales}
        idsBajos={[]}
        onEditar={(m) => editados.push(m.id)}
        onComprar={(m) => comprados.push(m.id)}
      />
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Editar" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Comprar" })[1]);

    assert.deepEqual(editados, [1]);
    assert.deepEqual(comprados, [2]);
  });
});

module("TablaCompras", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("muestra la fecha, el material, la cantidad y el costo de cada compra", (assert) => {
    const compras = [{ id: 1, materialId: 1, nombreMaterial: "Tinte", cantidad: 10, costoTotal: 15000, fecha: "2026-11-20" }];
    render(<TablaCompras compras={compras} />);

    assert.ok(screen.getByText("20-11-2026"));
    assert.ok(screen.getByText("Tinte"));
    assert.ok(screen.getByText("10"));
    assert.ok(screen.getByText("$15.000"));
  });

  test("sin compras muestra un aviso en vez de la tabla", (assert) => {
    render(<TablaCompras compras={[]} />);

    assert.ok(screen.getByText(/Aún no hay compras/));
    assert.equal(screen.queryByRole("table"), null);
  });
});

module("FormularioMaterial", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("enviar vacío muestra los errores y no guarda", (assert) => {
    const guardados = [];
    render(<FormularioMaterial onGuardar={(d) => guardados.push(d)} onCerrar={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    assert.ok(screen.getByText("Escribe el nombre del material."));
    assert.ok(screen.getByText("Escribe la unidad (ej: ml, gr o unidades)."));
    assert.ok(screen.getByText("El stock debe ser un número entero de 0 o más."));
    assert.ok(screen.getByText("El stock mínimo debe ser un número entero de 0 o más."));
    assert.equal(guardados.length, 0);
  });

  test("con datos correctos manda el material con números y sin precio", (assert) => {
    const guardados = [];
    render(<FormularioMaterial onGuardar={(d) => guardados.push(d)} onCerrar={() => {}} />);

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Tinte" } });
    fireEvent.change(screen.getByLabelText("Unidad"), { target: { value: "ml" } });
    fireEvent.change(screen.getByLabelText("Stock actual"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Stock mínimo"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    assert.deepEqual(guardados, [
      { nombre: "Tinte", unidad: "ml", stock: 10, stockMinimo: 3, precioUnitario: null, activo: true },
    ]);
  });

  test("al crear no muestra el interruptor de activo", (assert) => {
    render(<FormularioMaterial onGuardar={() => {}} onCerrar={() => {}} />);

    assert.equal(screen.queryByLabelText("Material activo"), null);
  });

  test("al editar muestra los datos y permite desactivarlo", (assert) => {
    const guardados = [];
    render(<FormularioMaterial material={materiales[0]} onGuardar={(d) => guardados.push(d)} onCerrar={() => {}} />);

    assert.ok(screen.getByText("Editar material"));
    assert.ok(screen.getByDisplayValue("Tinte"));
    assert.ok(screen.getByDisplayValue("12000"));

    fireEvent.click(screen.getByLabelText("Material activo"));
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    assert.deepEqual(guardados, [
      { nombre: "Tinte", unidad: "ml", stock: 2, stockMinimo: 5, precioUnitario: 12000, activo: false },
    ]);
  });

  test("muestra el error que manda el backend", (assert) => {
    render(<FormularioMaterial error="El stock no puede ser negativo" onGuardar={() => {}} onCerrar={() => {}} />);

    assert.ok(screen.getByText("El stock no puede ser negativo"));
  });
});

module("FormularioCompra", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("enviar vacío muestra los errores y no guarda", (assert) => {
    const guardados = [];
    render(<FormularioCompra materiales={materiales} onGuardar={(d) => guardados.push(d)} onCerrar={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    assert.ok(screen.getByText("Elige el material comprado."));
    assert.ok(screen.getByText("La cantidad debe ser un número entero mayor a 0."));
    assert.ok(screen.getByText("El costo total debe ser un número entero mayor a 0."));
    assert.equal(guardados.length, 0);
  });

  test("con datos correctos manda la compra con números", (assert) => {
    const guardados = [];
    render(<FormularioCompra materiales={materiales} onGuardar={(d) => guardados.push(d)} onCerrar={() => {}} />);

    fireEvent.change(screen.getByLabelText("Material"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Cantidad"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Costo total"), { target: { value: "15000" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    assert.deepEqual(guardados, [{ materialId: 2, cantidad: 10, costoTotal: 15000 }]);
  });

  test("si viene de un material, ya lo trae elegido", (assert) => {
    render(<FormularioCompra materiales={materiales} materialInicial={materiales[0]} onGuardar={() => {}} onCerrar={() => {}} />);

    assert.equal(screen.getByLabelText("Material").value, "1");
  });

  test("muestra el error que manda el backend", (assert) => {
    render(<FormularioCompra materiales={materiales} error="Material no encontrado" onGuardar={() => {}} onCerrar={() => {}} />);

    assert.ok(screen.getByText("Material no encontrado"));
  });
});
