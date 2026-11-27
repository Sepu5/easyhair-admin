import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import TablaUsuarios from "@/components/usuarios/TablaUsuarios";
import FiltrosUsuarios from "@/components/usuarios/FiltrosUsuarios";
import EtiquetaRol from "@/components/usuarios/EtiquetaRol";

const { module, test } = QUnit;

const usuarios = [
  { id: 1, nombre: "Valeria Soto", correo: "valeria@easyhair.cl", rol: "STAFF" },
  { id: 2, nombre: "Pedro Rojas", correo: "pedro@gmail.com", rol: "CLIENTE" },
  { id: 5, nombre: "Administrador", correo: "admin@easyhair.cl", rol: "ADMIN" },
];

module("TablaUsuarios", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("dibuja una fila por usuario con su correo y rol", (assert) => {
    render(<TablaUsuarios usuarios={usuarios} idSesion={5} />);

    assert.equal(screen.getAllByRole("row").length, 4); // encabezado + 3
    assert.ok(screen.getByText("pedro@gmail.com"));
    assert.ok(screen.getByText("Staff"));
    assert.ok(screen.getByText("Cliente"));
  });

  test("marca la cuenta propia con (tú)", (assert) => {
    render(<TablaUsuarios usuarios={usuarios} idSesion={5} />);
    assert.equal(screen.getAllByText("(tú)").length, 1);
  });

  test("sin usuarios muestra un aviso en vez de la tabla", (assert) => {
    render(<TablaUsuarios usuarios={[]} idSesion={5} />);
    assert.ok(screen.getByText(/No hay usuarios/));
    assert.equal(screen.queryByRole("table"), null);
  });
});

module("FiltrosUsuarios", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("muestra el total y cuántos hay de cada rol", (assert) => {
    render(<FiltrosUsuarios filtros={{ texto: "", rol: "" }} usuarios={usuarios} onCambiar={() => {}} />);

    assert.ok(screen.getByText("Total: 3"));
    assert.ok(screen.getByText("Administrador: 1"));
    assert.ok(screen.getByText("Staff: 1"));
    assert.ok(screen.getByText("Cliente: 1"));
  });

  test("avisa qué filtro cambió", (assert) => {
    const cambios = [];
    render(
      <FiltrosUsuarios
        filtros={{ texto: "", rol: "" }}
        usuarios={usuarios}
        onCambiar={(campo, valor) => cambios.push([campo, valor])}
      />
    );

    fireEvent.change(screen.getByLabelText("Buscar"), { target: { value: "pedro" } });
    fireEvent.change(screen.getByLabelText("Rol"), { target: { value: "STAFF" } });

    assert.deepEqual(cambios, [
      ["texto", "pedro"],
      ["rol", "STAFF"],
    ]);
  });
});

module("EtiquetaRol", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("muestra el nombre del rol en español", (assert) => {
    render(<EtiquetaRol rol="ADMIN" />);
    assert.ok(screen.getByText("Administrador"));
  });
});
