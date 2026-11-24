import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import TablaPeluqueros from "@/components/peluqueros/TablaPeluqueros";
import FormularioPeluquero from "@/components/peluqueros/FormularioPeluquero";

const { module, test } = QUnit;

const peluqueros = [
  { id: 1, nombre: "Valeria Soto", correo: "valeria@easyhair.cl", activo: true },
  { id: 2, nombre: "Ana Pérez", correo: "ana@easyhair.cl", activo: true },
];

module("TablaPeluqueros", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("dibuja una fila por peluquero con su correo", (assert) => {
    render(<TablaPeluqueros peluqueros={peluqueros} onEditar={() => {}} />);

    assert.equal(screen.getAllByRole("row").length, 3); // encabezado + 2 peluqueros
    assert.ok(screen.getByText("valeria@easyhair.cl"));
    assert.ok(screen.getByText("Ana Pérez"));
  });

  test("sin peluqueros muestra un aviso en vez de la tabla", (assert) => {
    render(<TablaPeluqueros peluqueros={[]} onEditar={() => {}} />);

    assert.ok(screen.getByText(/Aún no hay peluqueros/));
    assert.equal(screen.queryByRole("table"), null);
  });

  test("editar avisa qué peluquero se eligió", (assert) => {
    const editados = [];
    render(<TablaPeluqueros peluqueros={peluqueros} onEditar={(p) => editados.push(p.id)} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Editar" })[1]);

    assert.deepEqual(editados, [2]);
  });
});

module("FormularioPeluquero", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("enviar vacío muestra los errores y no guarda", (assert) => {
    const guardados = [];
    render(<FormularioPeluquero onGuardar={(d) => guardados.push(d)} onCerrar={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    assert.ok(screen.getByText("Escribe el nombre del peluquero."));
    assert.ok(screen.getByText("Escribe el correo del peluquero."));
    assert.equal(guardados.length, 0);
  });

  test("con datos correctos manda el peluquero activo", (assert) => {
    const guardados = [];
    render(<FormularioPeluquero onGuardar={(d) => guardados.push(d)} onCerrar={() => {}} />);

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Ana Pérez" } });
    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "Ana@EasyHair.cl" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    assert.deepEqual(guardados, [{ nombre: "Ana Pérez", correo: "ana@easyhair.cl", activo: true }]);
  });

  test("al crear no muestra el interruptor de activo", (assert) => {
    render(<FormularioPeluquero onGuardar={() => {}} onCerrar={() => {}} />);

    assert.equal(screen.queryByLabelText("Peluquero activo"), null);
  });

  test("al editar muestra los datos y permite desactivarlo", (assert) => {
    const guardados = [];
    render(<FormularioPeluquero peluquero={peluqueros[1]} onGuardar={(d) => guardados.push(d)} onCerrar={() => {}} />);

    assert.ok(screen.getByText("Editar peluquero"));
    assert.ok(screen.getByDisplayValue("Ana Pérez"));

    fireEvent.click(screen.getByLabelText("Peluquero activo"));
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    assert.deepEqual(guardados, [{ nombre: "Ana Pérez", correo: "ana@easyhair.cl", activo: false }]);
  });

  test("muestra el error que manda el backend", (assert) => {
    render(<FormularioPeluquero error="Ya existe un peluquero con ese correo" onGuardar={() => {}} onCerrar={() => {}} />);

    assert.ok(screen.getByText("Ya existe un peluquero con ese correo"));
  });
});