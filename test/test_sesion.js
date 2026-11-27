import {
  leerDatosToken,
  tokenVencido,
  puedeEntrarAlPanel,
  guardarSesion,
  leerSesion,
  borrarSesion,
  CLAVE_USUARIO,
  debeRenovar,
  renovarSesion,
} from "@/lib/sesion";
import { CLAVE_TOKEN } from "@/lib/api";

const { module, test } = QUnit;

// Arma un token falso con los datos que queramos (la firma no importa aquí)
function tokenFalso(datos) {
  const base64url = (objeto) =>
    btoa(JSON.stringify(objeto)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${base64url({ alg: "HS256" })}.${base64url(datos)}.firma`;
}

const AHORA = 1_800_000_000_000; // una fecha fija en milisegundos
const usuario = { id: 1, nombre: "Ana", correo: "ana@gmail.com", rol: "ADMIN" };

module("sesion: token", () => {
  test("lee el id, el rol y la expiración del token", (assert) => {
    const datos = leerDatosToken(tokenFalso({ id: 7, rol: "STAFF", exp: 123 }));

    assert.equal(datos.id, 7);
    assert.equal(datos.rol, "STAFF");
    assert.equal(datos.exp, 123);
  });

  test("un texto que no es token devuelve null", (assert) => {
    assert.equal(leerDatosToken("hola"), null);
  });

  test("token que vence en el futuro no está vencido", (assert) => {
    const token = tokenFalso({ exp: AHORA / 1000 + 3600 });
    assert.notOk(tokenVencido(token, AHORA));
  });

  test("token con exp en el pasado está vencido", (assert) => {
    const token = tokenFalso({ exp: AHORA / 1000 - 1 });
    assert.ok(tokenVencido(token, AHORA));
  });

  test("token sin exp se considera vencido", (assert) => {
    assert.ok(tokenVencido(tokenFalso({ id: 1 }), AHORA));
  });
});

module("sesion: roles", () => {
  test("ADMIN y STAFF pueden entrar al panel", (assert) => {
    assert.ok(puedeEntrarAlPanel("ADMIN"));
    assert.ok(puedeEntrarAlPanel("STAFF"));
  });

  test("CLIENTE no puede entrar al panel", (assert) => {
    assert.notOk(puedeEntrarAlPanel("CLIENTE"));
  });
});

module("sesion: guardar y leer", (hooks) => {
  hooks.afterEach(() => localStorage.clear());

  test("guarda la sesión y la recupera (como al recargar la página)", (assert) => {
    const token = tokenFalso({ exp: AHORA / 1000 + 3600 });

    guardarSesion(token, usuario);
    const sesion = leerSesion(AHORA);

    assert.equal(sesion.token, token);
    assert.deepEqual(sesion.usuario, usuario);
  });

  test("sin nada guardado devuelve null", (assert) => {
    assert.equal(leerSesion(AHORA), null);
  });

  test("con el token vencido devuelve null y borra todo", (assert) => {
    guardarSesion(tokenFalso({ exp: AHORA / 1000 - 10 }), usuario);

    assert.equal(leerSesion(AHORA), null);
    assert.equal(localStorage.getItem(CLAVE_TOKEN), null);
    assert.equal(localStorage.getItem(CLAVE_USUARIO), null);
  });

  test("borrarSesion elimina el token y el usuario", (assert) => {
    guardarSesion(tokenFalso({ exp: AHORA / 1000 + 3600 }), usuario);

    borrarSesion();

    assert.equal(localStorage.getItem(CLAVE_TOKEN), null);
    assert.equal(localStorage.getItem(CLAVE_USUARIO), null);
  });
});


module("sesion: renovar token", () => {
  const AHORA = Date.UTC(2026, 10, 26, 12, 0, 0);
  const enMinutos = (minutos) => Math.floor((AHORA + minutos * 60 * 1000) / 1000);

  test("renueva cuando al token le queda menos de 1 hora", (assert) => {
    assert.ok(debeRenovar(tokenFalso({ exp: enMinutos(30) }), AHORA));
  });

  test("no renueva si al token le queda harto tiempo", (assert) => {
    assert.notOk(debeRenovar(tokenFalso({ exp: enMinutos(600) }), AHORA));
  });

  test("no renueva un token vencido ni uno inválido", (assert) => {
    assert.notOk(debeRenovar(tokenFalso({ exp: enMinutos(-5) }), AHORA));
    assert.notOk(debeRenovar("esto-no-es-un-token", AHORA));
  });

  test("renovarSesion pide un token nuevo con POST a /api/auth/refresh", async (assert) => {
    const pedidos = [];
    const pedirFalso = async (ruta, opciones) => {
      pedidos.push({ ruta, metodo: opciones.method });
      return { token: "token-nuevo", usuario: { id: 5, nombre: "Administrador", rol: "ADMIN" } };
    };

    const nueva = await renovarSesion(pedirFalso);

    assert.deepEqual(pedidos, [{ ruta: "/api/auth/refresh", metodo: "POST" }]);
    assert.equal(nueva.token, "token-nuevo");
    assert.equal(nueva.usuario.rol, "ADMIN");
  });
});
