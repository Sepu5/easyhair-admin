import {
  accionesDisponibles,
  validarMotivo,
  validarReprogramacion,
  atenderReserva,
  marcarNoAsistio,
  cancelarReserva,
  reprogramarReserva,
  cargarHorasLibres,
} from "@/lib/reservas";

const { module, test } = QUnit;

const HOY = "2026-11-21";

// pedir falso que anota la ruta y las opciones de cada llamada
function crearPedirFalso(respuesta = {}) {
  const llamadas = [];
  const pedirFalso = async (ruta, opciones) => {
    llamadas.push({ ruta, opciones });
    return respuesta;
  };
  return { pedirFalso, llamadas };
}

module("acciones: qué botones se muestran", () => {
  test("pendiente de hoy: se puede hacer todo, incluso atender", (assert) => {
    const acciones = accionesDisponibles({ estado: "PENDIENTE", fecha: HOY }, HOY);
    assert.deepEqual(acciones, { atender: true, noAsistio: true, cancelar: true, reprogramar: true });
  });

  test("pendiente de otro día: no se puede atender (el QR es solo del día)", (assert) => {
    const acciones = accionesDisponibles({ estado: "PENDIENTE", fecha: "2026-11-25" }, HOY);
    assert.notOk(acciones.atender);
    assert.ok(acciones.cancelar);
  });

  test("atendida o cancelada: no se puede hacer nada", (assert) => {
    const acciones = accionesDisponibles({ estado: "CANCELADA", fecha: HOY }, HOY);
    assert.deepEqual(acciones, { atender: false, noAsistio: false, cancelar: false, reprogramar: false });
  });
});

module("acciones: validaciones", () => {
  test("el motivo de cancelación es obligatorio", (assert) => {
    assert.equal(validarMotivo("   "), "Indica el motivo de la cancelación.");
    assert.equal(validarMotivo("Peluquero enfermo"), "");
  });

  test("el motivo no puede pasar los 200 caracteres", (assert) => {
    assert.equal(validarMotivo("a".repeat(201)), "El motivo no puede superar los 200 caracteres.");
  });

  test("reprogramar pide fecha y hora, y no acepta fechas pasadas", (assert) => {
    assert.deepEqual(validarReprogramacion({ fecha: "", hora: "" }, HOY), {
      fecha: "Elige una fecha.",
      hora: "Elige una hora disponible.",
    });
    assert.equal(validarReprogramacion({ fecha: "2026-11-01", hora: "10:00" }, HOY).fecha, "No se puede usar una fecha pasada.");
    assert.deepEqual(validarReprogramacion({ fecha: HOY, hora: "10:00" }, HOY), {});
  });
});

module("acciones: llamadas al backend", () => {
  test("atender y no asistió usan PUT a su ruta", async (assert) => {
    const { pedirFalso, llamadas } = crearPedirFalso();

    await atenderReserva(pedirFalso, 5);
    await marcarNoAsistio(pedirFalso, 6);

    assert.equal(llamadas[0].ruta, "/api/reservas/5/atender");
    assert.equal(llamadas[0].opciones.method, "PUT");
    assert.equal(llamadas[1].ruta, "/api/reservas/6/no-asistio");
  });

  test("cancelar manda el motivo sin espacios de sobra", async (assert) => {
    const { pedirFalso, llamadas } = crearPedirFalso();

    await cancelarReserva(pedirFalso, 7, "  Local cerrado  ");

    assert.equal(llamadas[0].ruta, "/api/reservas/7/cancelar");
    assert.deepEqual(llamadas[0].opciones.body, { motivo: "Local cerrado" });
  });

  test("reprogramar manda la nueva fecha y hora", async (assert) => {
    const { pedirFalso, llamadas } = crearPedirFalso();

    await reprogramarReserva(pedirFalso, 8, "2026-11-25", "12:00");

    assert.equal(llamadas[0].ruta, "/api/reservas/8/reprogramar");
    assert.deepEqual(llamadas[0].opciones.body, { fecha: "2026-11-25", hora: "12:00" });
  });

  test("cargarHorasLibres devuelve las horas disponibles del peluquero", async (assert) => {
    const { pedirFalso, llamadas } = crearPedirFalso({ horasDisponibles: ["10:00", "11:00"] });

    const horas = await cargarHorasLibres(pedirFalso, "2026-11-25", 1);

    assert.equal(llamadas[0].ruta, "/api/reservas/disponibilidad?fecha=2026-11-25&peluqueroId=1");
    assert.deepEqual(horas, ["10:00", "11:00"]);
  });
});
