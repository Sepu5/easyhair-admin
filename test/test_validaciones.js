import { validarLogin, validarCorreo } from "@/lib/validaciones";

const { module, test } = QUnit;

module("validaciones: login", () => {
  test("datos correctos no tienen errores", (assert) => {
    assert.deepEqual(validarLogin({ correo: "ana@gmail.com", contrasena: "1234" }), {});
  });

  test("campos vacíos muestran los dos errores", (assert) => {
    const errores = validarLogin({ correo: "", contrasena: "" });
    assert.equal(errores.correo, "Debes escribir tu correo.");
    assert.equal(errores.contrasena, "Debes escribir tu contraseña.");
  });

  test("correo sin formato válido", (assert) => {
    assert.equal(validarCorreo("ana.gmail.com"), "El correo no tiene un formato válido.");
  });

  test("correo de más de 100 caracteres", (assert) => {
    const largo = "a".repeat(95) + "@gmail.com";
    assert.equal(validarCorreo(largo), "El correo no puede superar los 100 caracteres.");
  });
});
