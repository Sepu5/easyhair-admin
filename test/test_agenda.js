import { cargarAgenda, cargarPeluqueros } from "@/lib/reservas";

const { module, test } = QUnit;

// pedir falso: responde según la ruta y anota las rutas que se pidieron
function crearPedirFalso(respuestas) {
  const rutas = [];
  const pedirFalso = async (ruta) => {
    rutas.push(ruta);
    return respuestas[ruta] || [];
  };
  return { pedirFalso, rutas };
}

const peluqueros = [
  { id: 1, nombre: "Valeria" },
  { id: 2, nombre: "Pedro" },
];

module("agenda: llamadas al backend", () => {
  test("cargarPeluqueros deja fuera a los inactivos", async (assert) => {
    const { pedirFalso } = crearPedirFalso({
      "/api/peluqueros": [
        { id: 1, nombre: "Valeria", activo: true },
        { id: 2, nombre: "Pedro", activo: false },
      ],
    });

    const lista = await cargarPeluqueros(pedirFalso);

    assert.deepEqual(lista.map((p) => p.nombre), ["Valeria"]);
  });

  test("con un peluquero elegido pide solo su agenda", async (assert) => {
    const { pedirFalso, rutas } = crearPedirFalso({});

    await cargarAgenda(pedirFalso, "2026-11-12", peluqueros, "2");

    assert.deepEqual(rutas, ["/api/reservas/agenda?fecha=2026-11-12&peluqueroId=2"]);
  });

  test("con 'Todos' pide la agenda de cada peluquero y las junta ordenadas por hora", async (assert) => {
    const { pedirFalso, rutas } = crearPedirFalso({
      "/api/reservas/agenda?fecha=2026-11-12&peluqueroId=1": [{ id: 10, hora: "15:00", nombrePeluquero: "Valeria" }],
      "/api/reservas/agenda?fecha=2026-11-12&peluqueroId=2": [{ id: 20, hora: "10:00", nombrePeluquero: "Pedro" }],
    });

    const reservas = await cargarAgenda(pedirFalso, "2026-11-12", peluqueros, "");

    assert.equal(rutas.length, 2);
    assert.deepEqual(reservas.map((r) => r.id), [20, 10]);
  });
});
