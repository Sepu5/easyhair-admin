import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import FormularioPerfil from "@/components/perfil/FormularioPerfil";

const { module, test } = QUnit;

const perfil = { id: 3, nombre: "Valeria Soto", correo: "valeria@easyhair.cl", rol: "STAFF" };

module("FormularioPerfil", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("muestra los datos de la cuenta y el rol", (assert) => {
    render(<FormularioPerfil perfil={perfil} onGuardar={() => {}} />);

    assert.ok(screen.getByDisplayValue("Valeria Soto"));
    assert.ok(screen.getByDisplayValue("valeria@easyhair.cl"));
    assert.ok(screen.getByText("STAFF"));
  });

  test("sin escribir contraseña manda solo el nombre y el correo", (assert) => {
    const guardados = [];
    render(<FormularioPerfil perfil={perfil} onGuardar={(d) => guardados.push(d)} />);

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Valeria Soto Díaz" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    assert.deepEqual(guardados, [{ nombre: "Valeria Soto Díaz", correo: "valeria@easyhair.cl" }]);
  });

  test("con nombre vacío muestra el error y no guarda", (assert) => {
    const guardados = [];
    render(<FormularioPerfil perfil={perfil} onGuardar={(d) => guardados.push(d)} />);

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    assert.ok(screen.getByText("Escribe tu nombre."));
    assert.equal(guardados.length, 0);
  });

  test("si las contraseñas no coinciden avisa y no guarda", (assert) => {
    const guardados = [];
    render(<FormularioPerfil perfil={perfil} onGuardar={(d) => guardados.push(d)} />);

    fireEvent.change(screen.getByLabelText("Nueva contraseña (opcional)"), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText("Confirmar nueva contraseña"), { target: { value: "654321" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    assert.ok(screen.getByText("Las contraseñas no coinciden."));
    assert.equal(guardados.length, 0);
  });

  test("con contraseña nueva correcta la manda junto con los datos", (assert) => {
    const guardados = [];
    render(<FormularioPerfil perfil={perfil} onGuardar={(d) => guardados.push(d)} />);

    fireEvent.change(screen.getByLabelText("Nueva contraseña (opcional)"), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText("Confirmar nueva contraseña"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    assert.deepEqual(guardados, [{ nombre: "Valeria Soto", correo: "valeria@easyhair.cl", password: "123456" }]);
  });

  test("muestra el error que manda el backend", (assert) => {
    render(<FormularioPerfil perfil={perfil} error="Ese correo ya está en uso" onGuardar={() => {}} />);

    assert.ok(screen.getByText("Ese correo ya está en uso"));
  });
});
