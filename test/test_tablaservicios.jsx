import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import TablaServicios from "@/components/servicios/TablaServicios";
import FormularioServicio from "@/components/servicios/FormularioServicio";
import ModalEliminarServicio from "@/components/servicios/ModalEliminarServicio";

const { module, test } = QUnit;

const servicios = [
  { id: 1, nombre: "Corte", descripcion: "Corte clásico", duracion: 45, precio: 8000, activo: true },
  { id: 2, nombre: "Tinte", descripcion: "", duracion: 90, precio: 25000, activo: false },
];

module("TablaServicios", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("dibuja una fila por servicio con precio, duración y estado", (assert) => {
    render(<TablaServicios servicios={servicios} onEditar={() => {}} onEliminar={() => {}} />);

    assert.equal(screen.getAllByRole("row").length, 3); // encabezado + 2 servicios
    assert.ok(screen.getByText("$8.000"));
    assert.ok(screen.getByText("45 min"));
    assert.ok(screen.getByText("Activo"));
    assert.ok(screen.getByText("Inactivo"));
  });

  test("sin servicios muestra un aviso en vez de la tabla", (assert) => {
    render(<TablaServicios servicios={[]} onEditar={() => {}} onEliminar={() => {}} />);

    assert.ok(screen.getByText(/Aún no hay servicios/));
    assert.equal(screen.queryByRole("table"), null);
  });

  test("editar y eliminar avisan qué servicio se eligió", (assert) => {
    const editados = [];
    const eliminados = [];
    render(
      <TablaServicios
        servicios={servicios}
        onEditar={(s) => editados.push(s.id)}
        onEliminar={(s) => eliminados.push(s.id)}
      />
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Editar" })[1]);
    fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);

    assert.deepEqual(editados, [2]);
    assert.deepEqual(eliminados, [1]);
  });
});

module("FormularioServicio", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("enviar vacío muestra los errores y no guarda", (assert) => {
    const guardados = [];
    render(<FormularioServicio onGuardar={(d) => guardados.push(d)} onCerrar={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    assert.ok(screen.getByText("Escribe el nombre del servicio."));
    assert.ok(screen.getByText("La duración debe ser un número entero mayor a 0."));
    assert.ok(screen.getByText("El precio debe ser un número entero mayor a 0."));
    assert.equal(guardados.length, 0);
  });

  test("con datos correctos manda el servicio con números", (assert) => {
    const guardados = [];
    render(<FormularioServicio onGuardar={(d) => guardados.push(d)} onCerrar={() => {}} />);

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Corte" } });
    fireEvent.change(screen.getByLabelText("Duración (minutos)"), { target: { value: "30" } });
    fireEvent.change(screen.getByLabelText("Precio"), { target: { value: "8000" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    assert.deepEqual(guardados, [{ nombre: "Corte", descripcion: "", duracion: 30, precio: 8000 }]);
  });

  test("al editar muestra los datos del servicio", (assert) => {
    render(<FormularioServicio servicio={servicios[1]} onGuardar={() => {}} onCerrar={() => {}} />);

    assert.ok(screen.getByText("Editar servicio"));
    assert.ok(screen.getByDisplayValue("Tinte"));
    assert.ok(screen.getByDisplayValue("90"));
  });

  test("muestra el error que manda el backend", (assert) => {
    render(<FormularioServicio error="El precio debe ser mayor a 0" onGuardar={() => {}} onCerrar={() => {}} />);

    assert.ok(screen.getByText("El precio debe ser mayor a 0"));
  });
});

module("ModalEliminarServicio", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("pide confirmación con el nombre del servicio y avisa al confirmar", (assert) => {
    let confirmado = false;
    render(
      <ModalEliminarServicio servicio={servicios[0]} onConfirmar={() => (confirmado = true)} onCerrar={() => {}} />
    );

    assert.ok(screen.getByText("Corte"));
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    assert.ok(confirmado);
  });
});