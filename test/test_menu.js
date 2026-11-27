import { estaActiva, opcionesMenu } from "@/lib/menu";

const { module, test } = QUnit;

module("menu", () => {
  test("el dashboard solo está activo en /", (assert) => {
    assert.ok(estaActiva("/", "/"));
    assert.notOk(estaActiva("/", "/servicios"));
  });

  test("una sección sigue activa en sus subpáginas", (assert) => {
    assert.ok(estaActiva("/servicios", "/servicios"));
    assert.ok(estaActiva("/servicios", "/servicios/3/editar"));
  });

  test("no confunde rutas que empiezan igual", (assert) => {
    assert.notOk(estaActiva("/servicios", "/serviciosviejos"));
  });

  test("todas las opciones tienen ruta, texto e ícono", (assert) => {
    opcionesMenu.forEach((opcion) => {
      assert.ok(opcion.href && opcion.texto && opcion.icono, opcion.texto);
    });
  });
});
