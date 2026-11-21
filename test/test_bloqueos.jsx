import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import BloqueosHorario from "@/components/reservas/BloqueosHorario";
import { validarBloqueo, crearBloqueo, cargarBloqueos } from "@/lib/reservas";

const { module, test } = QUnit;

const HOY = "2026-11-21";
const valeria = { id: 1, nombre: "Valeria" };

// Backend falso en memoria: guarda los bloqueos y anota cada llamada
function crearBackendFalso(bloqueosIniciales = []) {
  let bloqueos = [...bloqueosIniciales];
  const llamadas = [];
  const pedirFalso = async (ruta, opciones = {}) => {
    llamadas.push({ ruta, metodo: opciones.method || "GET", body: opciones.body });
    if (ruta.startsWith("/api/reservas/disponibilidad")) {
      return { horasDisponibles: ["10:00", "11:00", "12:00"] };
    }
    if (ruta.startsWith("/api/bloqueos?")) return bloqueos;
    if (opciones.method === "POST") {
      const nuevo = { id: 99, ...opciones.body };
      bloqueos.push(nuevo);
      return nuevo;
    }
    if (opciones.method === "DELETE") {
      const id = Number(ruta.split("/").pop());
      bloqueos = bloqueos.filter((b) => b.id !== id);
      return null;
    }
    return null;
  };
  return { pedirFalso, llamadas };
}

module("bloqueos: lógica", () => {
  test("la hora es obligatoria y el motivo máximo 100 caracteres", (assert) => {
    assert.equal(validarBloqueo({ hora: "", motivo: "" }).hora, "Elige la hora que quieres bloquear.");
    assert.equal(validarBloqueo({ hora: "10:00", motivo: "a".repeat(101) }).motivo, "El motivo no puede superar los 100 caracteres.");
    assert.deepEqual(validarBloqueo({ hora: "10:00", motivo: "" }), {});
  });

  test("crearBloqueo manda el peluquero como número y el motivo sin espacios", async (assert) => {
    const { pedirFalso, llamadas } = crearBackendFalso();

    await crearBloqueo(pedirFalso, { peluqueroId: "1", fecha: HOY, hora: "15:00", motivo: " trámite " });

    assert.equal(llamadas[0].ruta, "/api/bloqueos");
    assert.deepEqual(llamadas[0].body, { peluqueroId: 1, fecha: HOY, hora: "15:00", motivo: "trámite" });
  });

  test("cargarBloqueos los devuelve ordenados por hora", async (assert) => {
    const { pedirFalso } = crearBackendFalso([
      { id: 1, hora: "16:00" },
      { id: 2, hora: "11:00" },
    ]);

    const lista = await cargarBloqueos(pedirFalso, HOY, 1);

    assert.deepEqual(lista.map((b) => b.hora), ["11:00", "16:00"]);
  });
});

module("BloqueosHorario", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("sin peluquero elegido pide elegir uno", (assert) => {
    render(<BloqueosHorario fecha={HOY} peluquero={null} hoy={HOY} />);
    assert.ok(screen.getByText(/Elige un peluquero/));
  });

  test("muestra los bloqueos del día y las horas libres para bloquear", async (assert) => {
    const { pedirFalso } = crearBackendFalso([{ id: 1, hora: "15:00", motivo: "Hora médica" }]);

    render(<BloqueosHorario fecha={HOY} peluquero={valeria} hoy={HOY} pedirFn={pedirFalso} />);

    assert.ok(await screen.findByText("Hora médica"));
    assert.ok(screen.getByRole("option", { name: "12:00" }));
  });

  test("bloquear una hora la manda al backend y aparece en la lista", async (assert) => {
    const { pedirFalso, llamadas } = crearBackendFalso();
    render(<BloqueosHorario fecha={HOY} peluquero={valeria} hoy={HOY} pedirFn={pedirFalso} />);
    await screen.findByRole("option", { name: "11:00" });

    fireEvent.change(screen.getByLabelText("Hora"), { target: { value: "11:00" } });
    fireEvent.change(screen.getByLabelText("Motivo (opcional)"), { target: { value: "Trámite" } });
    fireEvent.click(screen.getByRole("button", { name: "Bloquear hora" }));

    assert.ok(await screen.findByText("Trámite"));
    assert.ok(llamadas.some((l) => l.metodo === "POST" && l.body.hora === "11:00"));
  });

  test("sin hora no deja bloquear", async (assert) => {
    const { pedirFalso, llamadas } = crearBackendFalso();
    render(<BloqueosHorario fecha={HOY} peluquero={valeria} hoy={HOY} pedirFn={pedirFalso} />);
    await screen.findByRole("option", { name: "11:00" });

    fireEvent.click(screen.getByRole("button", { name: "Bloquear hora" }));

    assert.ok(screen.getByText("Elige la hora que quieres bloquear."));
    assert.notOk(llamadas.some((l) => l.metodo === "POST"));
  });

  test("quitar un bloqueo pide confirmación y lo elimina", async (assert) => {
    const { pedirFalso, llamadas } = crearBackendFalso([{ id: 5, hora: "15:00", motivo: "Hora médica" }]);
    render(<BloqueosHorario fecha={HOY} peluquero={valeria} hoy={HOY} pedirFn={pedirFalso} />);
    await screen.findByText("Hora médica");

    fireEvent.click(screen.getByRole("button", { name: "Quitar bloqueo" }));
    // ahora hay dos botones "Quitar bloqueo": el de la lista y el del modal
    const botones = screen.getAllByRole("button", { name: "Quitar bloqueo" });
    fireEvent.click(botones[botones.length - 1]);

    await waitFor(() => {
      if (screen.queryByText("Hora médica")) throw new Error("todavía está");
    });
    assert.ok(llamadas.some((l) => l.metodo === "DELETE" && l.ruta === "/api/bloqueos/5"));
  });

  test("en un día pasado no deja crear bloqueos", (assert) => {
    const { pedirFalso } = crearBackendFalso();
    render(<BloqueosHorario fecha="2026-11-01" peluquero={valeria} hoy={HOY} pedirFn={pedirFalso} />);

    assert.ok(screen.getByText(/No se pueden bloquear horas de días que ya pasaron/));
    assert.equal(screen.queryByRole("button", { name: "Bloquear hora" }), null);
  });
});
