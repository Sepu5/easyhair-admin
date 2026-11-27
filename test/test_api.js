import { armarHeaders, mensajeDeError, pedir, CLAVE_TOKEN, EVENTO_SESION_EXPIRADA } from "@/lib/api";

const { module, test } = QUnit;

module("api: armarHeaders", () => {
  test("sin token solo manda JSON", (assert) => {
    const headers = armarHeaders(null);
    assert.equal(headers["Content-Type"], "application/json");
    assert.notOk(headers.Authorization);
  });

  test("con token agrega Authorization Bearer", (assert) => {
    const headers = armarHeaders("abc123");
    assert.equal(headers.Authorization, "Bearer abc123");
  });
});

module("api: mensajeDeError", () => {
  test("usa el mensaje que manda el backend", (assert) => {
    assert.equal(mensajeDeError(409, { mensaje: "El horario ya está ocupado" }), "El horario ya está ocupado");
  });

  test("401 sin mensaje pide iniciar sesión", (assert) => {
    assert.equal(mensajeDeError(401, null), "Debes iniciar sesión");
  });

  test("403 sin mensaje avisa que no tiene permiso", (assert) => {
    assert.equal(mensajeDeError(403, null), "No tienes permiso para hacer esto");
  });
});

// fetch falso (mock) para no depender del backend
module("api: pedir", (hooks) => {
  const fetchOriginal = globalThis.fetch;
  let ultimaPeticion;

  function fetchFalso(status, cuerpo) {
    return async (url, opciones) => {
      ultimaPeticion = { url, opciones };
      return {
        ok: status >= 200 && status < 300,
        status,
        text: async () => (cuerpo === null ? "" : JSON.stringify(cuerpo)),
      };
    };
  }

  hooks.afterEach(() => {
    globalThis.fetch = fetchOriginal;
    localStorage.clear();
  });

  test("devuelve los datos cuando la respuesta es correcta", async (assert) => {
    globalThis.fetch = fetchFalso(200, [{ id: 1, nombre: "Corte" }]);

    const datos = await pedir("/api/servicios");

    assert.deepEqual(datos, [{ id: 1, nombre: "Corte" }]);
    assert.ok(ultimaPeticion.url.endsWith("/api/servicios"));
  });

  test("manda el token guardado y el body en JSON", async (assert) => {
    localStorage.setItem(CLAVE_TOKEN, "tokenDePrueba");
    globalThis.fetch = fetchFalso(201, { id: 5 });

    await pedir("/api/servicios", { method: "POST", body: { nombre: "Tintura" } });

    assert.equal(ultimaPeticion.opciones.headers.Authorization, "Bearer tokenDePrueba");
    assert.equal(ultimaPeticion.opciones.body, JSON.stringify({ nombre: "Tintura" }));
  });

  test("respuesta vacía devuelve null", async (assert) => {
    globalThis.fetch = fetchFalso(204, null);
    assert.equal(await pedir("/api/servicios/1", { method: "DELETE" }), null);
  });

  test("401 con token avisa que la sesión expiró", async (assert) => {
    localStorage.setItem(CLAVE_TOKEN, "tokenVencido");
    globalThis.fetch = fetchFalso(401, { mensaje: "Sesión inválida o expirada, inicia sesión de nuevo" });
    let avisado = false;
    const escuchar = () => {
      avisado = true;
    };
    window.addEventListener(EVENTO_SESION_EXPIRADA, escuchar);

    await assert.rejects(pedir("/api/materiales"), /Sesión inválida o expirada/);
    assert.ok(avisado);

    window.removeEventListener(EVENTO_SESION_EXPIRADA, escuchar);
  });

  test("401 sin token (ej. login con clave mala) no avisa nada", async (assert) => {
    globalThis.fetch = fetchFalso(401, { mensaje: "Correo o contraseña incorrectos" });
    let avisado = false;
    const escuchar = () => {
      avisado = true;
    };
    window.addEventListener(EVENTO_SESION_EXPIRADA, escuchar);

    await assert.rejects(pedir("/api/auth/login", { method: "POST", body: {} }));
    assert.notOk(avisado);

    window.removeEventListener(EVENTO_SESION_EXPIRADA, escuchar);
  });

  test("lanza error con el mensaje del backend", async (assert) => {
    globalThis.fetch = fetchFalso(404, { mensaje: "Servicio no encontrado" });

    await assert.rejects(pedir("/api/servicios/99"), /Servicio no encontrado/);
  });
});
