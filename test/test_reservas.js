import {
  ESTADOS,
  fechaHoy,
  ordenarPorHora,
  filtrarPorEstado,
  contarPorEstado,
  puedeModificarse,
} from "@/lib/reservas";
import { formatearPrecio, formatearFecha } from "@/lib/formato";

const { module, test } = QUnit;

const reservas = [
  { id: 1, hora: "12:00", nombrePeluquero: "Carla", estado: "PENDIENTE" },
  { id: 2, hora: "10:00", nombrePeluquero: "Pedro", estado: "ATENDIDA" },
  { id: 3, hora: "10:00", nombrePeluquero: "Ana", estado: "CANCELADA" },
  { id: 4, hora: "15:00", nombrePeluquero: "Ana", estado: "PENDIENTE" },
];

module("reservas", () => {
  test("todos los estados tienen texto y color", (assert) => {
    Object.values(ESTADOS).forEach((estado) => {
      assert.ok(estado.texto && estado.color);
    });
  });

  test("fechaHoy devuelve AAAA-MM-DD con ceros", (assert) => {
    assert.equal(fechaHoy(new Date(2026, 0, 5)), "2026-01-05");
  });

  test("ordena por hora y después por peluquero", (assert) => {
    const ids = ordenarPorHora(reservas).map((reserva) => reserva.id);
    assert.deepEqual(ids, [3, 2, 1, 4]);
  });

  test("ordenar no cambia el arreglo original", (assert) => {
    ordenarPorHora(reservas);
    assert.equal(reservas[0].id, 1);
  });

  test("filtra por estado y sin estado devuelve todas", (assert) => {
    assert.equal(filtrarPorEstado(reservas, "PENDIENTE").length, 2);
    assert.equal(filtrarPorEstado(reservas, "").length, 4);
  });

  test("cuenta cuántas reservas hay de cada estado", (assert) => {
    assert.deepEqual(contarPorEstado(reservas), {
      PENDIENTE: 2,
      ATENDIDA: 1,
      CANCELADA: 1,
      NO_ASISTIO: 0,
    });
  });

  test("solo las pendientes se pueden modificar", (assert) => {
    assert.ok(puedeModificarse({ estado: "PENDIENTE" }));
    assert.notOk(puedeModificarse({ estado: "ATENDIDA" }));
    assert.notOk(puedeModificarse({ estado: "CANCELADA" }));
  });
});

module("formato", () => {
  test("precio con signo peso y punto de miles", (assert) => {
    assert.equal(formatearPrecio(25000), "$25.000");
    assert.equal(formatearPrecio(0), "$0");
  });

  test("fecha de AAAA-MM-DD a DD-MM-AAAA", (assert) => {
    assert.equal(formatearFecha("2026-11-21"), "21-11-2026");
  });
});
