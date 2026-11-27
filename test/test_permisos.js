import { menuDelRol, puedeHacer, puedeVerRuta, tituloPanel } from "@/lib/permisos";

const { module, test } = QUnit;

module("permisos", () => {
  test("el admin puede ver todas las secciones", (assert) => {
    ["/", "/reservas", "/inventario", "/finanzas", "/usuarios", "/perfil"].forEach((ruta) => {
      assert.ok(puedeVerRuta("ADMIN", ruta), ruta);
    });
  });

  test("el staff ve su agenda, servicios, peluqueros y perfil", (assert) => {
    ["/", "/reservas", "/servicios", "/peluqueros", "/perfil"].forEach((ruta) => {
      assert.ok(puedeVerRuta("STAFF", ruta), ruta);
    });
  });

  test("el staff no puede entrar a inventario, finanzas ni usuarios", (assert) => {
    ["/inventario", "/finanzas", "/usuarios"].forEach((ruta) => {
      assert.notOk(puedeVerRuta("STAFF", ruta), ruta);
    });
  });

  test("las subpáginas siguen la regla de su sección", (assert) => {
    assert.ok(puedeVerRuta("STAFF", "/reservas/5"));
    assert.notOk(puedeVerRuta("STAFF", "/finanzas/movimientos"));
  });

  test("un rol desconocido o el cliente no ven nada", (assert) => {
    assert.notOk(puedeVerRuta("CLIENTE", "/"));
    assert.notOk(puedeVerRuta(undefined, "/reservas"));
  });

  test("el menú del admin tiene todas las opciones", (assert) => {
    assert.equal(menuDelRol("ADMIN").length, 7);
  });

  test("el menú del staff no muestra inventario, finanzas ni usuarios", (assert) => {
    const textos = menuDelRol("STAFF").map((opcion) => opcion.texto);
    assert.deepEqual(textos, ["Dashboard", "Reservas", "Servicios", "Peluqueros"]);
  });

  test("el admin puede hacer cualquier acción", (assert) => {
    assert.ok(puedeHacer("ADMIN", "editarServicios"));
    assert.ok(puedeHacer("ADMIN", "editarPeluqueros"));
  });

  test("el staff no puede editar servicios ni peluqueros", (assert) => {
    assert.notOk(puedeHacer("STAFF", "editarServicios"));
    assert.notOk(puedeHacer("STAFF", "editarPeluqueros"));
    assert.notOk(puedeHacer("STAFF", "verResumenAdmin"));
  });

  test("el staff sí puede hacer las acciones de la peluquería", (assert) => {
    assert.ok(puedeHacer("STAFF", "atenderReserva"));
    assert.ok(puedeHacer("STAFF", "crearBloqueo"));
  });

  test("el título del panel cambia según el rol", (assert) => {
    assert.equal(tituloPanel("ADMIN"), "EasyHair Admin");
    assert.equal(tituloPanel("STAFF"), "EasyHair Staff");
  });
});
