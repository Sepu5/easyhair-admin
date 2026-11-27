import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import TablaUsuarios from "@/components/usuarios/TablaUsuarios";
import FiltrosUsuarios from "@/components/usuarios/FiltrosUsuarios";
import EtiquetaRol from "@/components/usuarios/EtiquetaRol";
import FormularioUsuario from "@/components/usuarios/FormularioUsuario";
import ModalCambiarRol from "@/components/usuarios/ModalCambiarRol";
import ModalEliminarUsuario from "@/components/usuarios/ModalEliminarUsuario";

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


module("TablaUsuarios: acciones", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("cambiar rol y eliminar avisan qué usuario se eligió", (assert) => {
    const roles = [];
    const eliminados = [];
    render(
      <TablaUsuarios
        usuarios={usuarios}
        idSesion={5}
        onCambiarRol={(u) => roles.push(u.id)}
        onEliminar={(u) => eliminados.push(u.id)}
      />
    );

    fireEvent.click(screen.getAllByRole("button", { name: /Cambiar rol/ })[1]);
    fireEvent.click(screen.getAllByRole("button", { name: /Eliminar/ })[0]);

    assert.deepEqual(roles, [2]);
    assert.deepEqual(eliminados, [1]);
  });

  test("la cuenta propia tiene los botones desactivados", (assert) => {
    render(<TablaUsuarios usuarios={usuarios} idSesion={5} onEditar={() => {}} onCambiarRol={() => {}} onEliminar={() => {}} />);

    assert.ok(screen.getAllByRole("button", { name: /Editar/ })[2].disabled);
    assert.ok(screen.getAllByRole("button", { name: /Cambiar rol/ })[2].disabled);
    assert.ok(screen.getAllByRole("button", { name: /Eliminar/ })[2].disabled);
    assert.notOk(screen.getAllByRole("button", { name: /Eliminar/ })[0].disabled);
  });
});

module("FormularioUsuario", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("no guarda si faltan datos y muestra los errores", (assert) => {
    const guardados = [];
    render(<FormularioUsuario enviando={false} error="" onGuardar={(d) => guardados.push(d)} onCerrar={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Crear usuario" }));

    assert.equal(guardados.length, 0);
    assert.ok(screen.getByText("Escribe el nombre."));
    assert.ok(screen.getByText("Escribe una contraseña."));
  });

  test("con datos válidos manda el usuario listo para el backend", (assert) => {
    const guardados = [];
    render(<FormularioUsuario enviando={false} error="" onGuardar={(d) => guardados.push(d)} onCerrar={() => {}} />);

    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: " Martina López " } });
    fireEvent.change(screen.getByLabelText(/Correo/), { target: { value: "Martina@EasyHair.cl" } });
    fireEvent.change(screen.getByLabelText(/Contraseña/), { target: { value: "secreta1" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear usuario" }));

    assert.deepEqual(guardados, [
      { nombre: "Martina López", correo: "martina@easyhair.cl", password: "secreta1", rol: "STAFF" },
    ]);
  });
});

module("ModalCambiarRol", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("no deja guardar si el rol es el mismo y avisa el rol nuevo", (assert) => {
    const elegidos = [];
    render(
      <ModalCambiarRol
        usuario={usuarios[1]}
        enviando={false}
        error=""
        onConfirmar={(rol) => elegidos.push(rol)}
        onCerrar={() => {}}
      />
    );

    const guardar = screen.getByRole("button", { name: "Guardar rol" });
    assert.ok(guardar.disabled);

    fireEvent.change(screen.getByLabelText("Rol"), { target: { value: "STAFF" } });
    fireEvent.click(guardar);

    assert.deepEqual(elegidos, ["STAFF"]);
  });
});

module("ModalEliminarUsuario", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("pide confirmación con el nombre y muestra el error del backend", (assert) => {
    let confirmado = false;
    render(
      <ModalEliminarUsuario
        usuario={usuarios[1]}
        enviando={false}
        error="No puedes eliminar tu propia cuenta"
        onConfirmar={() => (confirmado = true)}
        onCerrar={() => {}}
      />
    );

    assert.ok(screen.getByText("Pedro Rojas"));
    assert.ok(screen.getByText("No puedes eliminar tu propia cuenta"));
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    assert.ok(confirmado);
  });
});


module("FormularioUsuario: editar", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("carga los datos, no pide rol y deja la contraseña vacía", (assert) => {
    const guardados = [];
    render(
      <FormularioUsuario
        usuario={usuarios[1]}
        enviando={false}
        error=""
        onGuardar={(d) => guardados.push(d)}
        onCerrar={() => {}}
      />
    );

    assert.ok(screen.getByText("Editar usuario"));
    assert.equal(screen.getByLabelText(/Nombre/).value, "Pedro Rojas");
    assert.equal(screen.queryByLabelText(/^Rol/), null);

    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    assert.deepEqual(guardados, [{ nombre: "Pedro Rojas", correo: "pedro@gmail.com" }]);
  });
});
