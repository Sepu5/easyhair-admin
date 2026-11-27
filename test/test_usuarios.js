import {
  listarUsuarios,
  crearUsuario,
  cambiarRol,
  eliminarUsuario,
  filtrarUsuarios,
  contarPorRol,
  esCuentaPropia,
  validarUsuario,
  armarUsuario,
} from "@/lib/usuarios";

const { module, test } = QUnit;

const usuarios = [
  { id: 1, nombre: "Valeria Soto", correo: "valeria@easyhair.cl", rol: "STAFF" },
  { id: 2, nombre: "Pedro Rojas", correo: "pedro@gmail.com", rol: "CLIENTE" },
  { id: 5, nombre: "Administrador", correo: "admin@easyhair.cl", rol: "ADMIN" },
  { id: 6, nombre: "Camila Díaz", correo: "camila@gmail.com", rol: "CLIENTE" },
];

// pedir falso que anota la ruta, el método y el body
function crearPedirFalso(respuesta = null) {
  const pedidos = [];
  const pedirFalso = async (ruta, opciones = {}) => {
    pedidos.push({ ruta, metodo: opciones.method || "GET", body: opciones.body });
    return respuesta;
  };
  return { pedirFalso, pedidos };
}

const valido = { nombre: "Martina López", correo: "Martina@EasyHair.cl ", password: "secreta1", rol: "STAFF" };

module("usuarios: llamadas al backend", () => {
  test("listar pide GET /api/usuarios", async (assert) => {
    const { pedirFalso, pedidos } = crearPedirFalso(usuarios);
    const lista = await listarUsuarios(pedirFalso);
    assert.deepEqual(pedidos[0], { ruta: "/api/usuarios", metodo: "GET", body: undefined });
    assert.equal(lista.length, 4);
  });

  test("crear manda POST con los datos", async (assert) => {
    const { pedirFalso, pedidos } = crearPedirFalso();
    await crearUsuario(pedirFalso, armarUsuario(valido));
    assert.equal(pedidos[0].ruta, "/api/usuarios");
    assert.equal(pedidos[0].metodo, "POST");
    assert.equal(pedidos[0].body.correo, "martina@easyhair.cl");
  });

  test("cambiar rol manda PUT a /rol con el rol nuevo", async (assert) => {
    const { pedirFalso, pedidos } = crearPedirFalso();
    await cambiarRol(pedirFalso, 2, "STAFF");
    assert.deepEqual(pedidos[0], { ruta: "/api/usuarios/2/rol", metodo: "PUT", body: { rol: "STAFF" } });
  });

  test("eliminar manda DELETE con el id", async (assert) => {
    const { pedirFalso, pedidos } = crearPedirFalso();
    await eliminarUsuario(pedirFalso, 6);
    assert.equal(pedidos[0].ruta, "/api/usuarios/6");
    assert.equal(pedidos[0].metodo, "DELETE");
  });
});

module("usuarios: filtros", () => {
  test("sin filtros devuelve todos", (assert) => {
    assert.equal(filtrarUsuarios(usuarios).length, 4);
  });

  test("busca por nombre o correo sin importar mayúsculas", (assert) => {
    assert.deepEqual(filtrarUsuarios(usuarios, { texto: "VALERIA" }).map((u) => u.id), [1]);
    assert.deepEqual(filtrarUsuarios(usuarios, { texto: "gmail" }).map((u) => u.id), [2, 6]);
  });

  test("filtra por rol y se puede combinar con el texto", (assert) => {
    assert.deepEqual(filtrarUsuarios(usuarios, { rol: "CLIENTE" }).map((u) => u.id), [2, 6]);
    assert.deepEqual(filtrarUsuarios(usuarios, { texto: "camila", rol: "CLIENTE" }).map((u) => u.id), [6]);
    assert.equal(filtrarUsuarios(usuarios, { texto: "camila", rol: "STAFF" }).length, 0);
  });

  test("cuenta los usuarios de cada rol", (assert) => {
    assert.deepEqual(contarPorRol(usuarios), { ADMIN: 1, STAFF: 1, CLIENTE: 2 });
  });

  test("reconoce la cuenta del admin que inició sesión", (assert) => {
    assert.ok(esCuentaPropia(usuarios[2], 5));
    assert.notOk(esCuentaPropia(usuarios[0], 5));
  });
});

module("usuarios: validaciones", () => {
  test("datos correctos no tienen errores", (assert) => {
    assert.deepEqual(validarUsuario(valido), {});
  });

  test("campos vacíos muestran todos los errores", (assert) => {
    const errores = validarUsuario({ nombre: " ", correo: "", password: "", rol: "" });
    assert.deepEqual(Object.keys(errores).sort(), ["correo", "nombre", "password", "rol"]);
  });

  test("nombre muy corto y contraseña de menos de 6", (assert) => {
    const errores = validarUsuario({ ...valido, nombre: "Al", password: "123" });
    assert.ok(errores.nombre.includes("3 letras"));
    assert.ok(errores.password.includes("6 caracteres"));
  });

  test("correo sin formato y rol inventado", (assert) => {
    const errores = validarUsuario({ ...valido, correo: "martina", rol: "JEFE" });
    assert.ok(errores.correo);
    assert.ok(errores.rol);
  });

  test("armarUsuario limpia el nombre y deja el correo en minúsculas", (assert) => {
    assert.deepEqual(armarUsuario({ ...valido, nombre: "  Martina López " }), {
      nombre: "Martina López",
      correo: "martina@easyhair.cl",
      password: "secreta1",
      rol: "STAFF",
    });
  });
});
