import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import AccionesReserva from "@/components/reservas/AccionesReserva";
import ModalCancelar from "@/components/reservas/ModalCancelar";
import ModalReprogramar from "@/components/reservas/ModalReprogramar";

const { module, test } = QUnit;

const HOY = "2026-11-21";
const reserva = {
  id: 3,
  fecha: "2099-01-10",
  hora: "10:00",
  nombreCliente: "Ana",
  nombrePeluquero: "Valeria",
  servicios: "Corte",
  total: 6000,
  estado: "PENDIENTE",
  peluqueroId: 1,
};

module("AccionesReserva", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("pendiente de hoy muestra Atender y avisa la acción elegida", (assert) => {
    const elegidas = [];
    render(<AccionesReserva reserva={{ ...reserva, fecha: HOY }} hoy={HOY} onAccion={(tipo) => elegidas.push(tipo)} />);

    fireEvent.click(screen.getByRole("button", { name: /Atender/ }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    assert.deepEqual(elegidas, ["atender", "cancelar"]);
  });

  test("pendiente de otro día no muestra Atender", (assert) => {
    render(<AccionesReserva reserva={reserva} hoy={HOY} onAccion={() => {}} />);

    assert.equal(screen.queryByRole("button", { name: /Atender/ }), null);
    assert.ok(screen.getByRole("button", { name: "Reprogramar" }));
  });

  test("una reserva atendida no tiene botones", (assert) => {
    render(<AccionesReserva reserva={{ ...reserva, estado: "ATENDIDA" }} hoy={HOY} onAccion={() => {}} />);

    assert.equal(screen.queryAllByRole("button").length, 0);
  });
});

module("ModalCancelar", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("sin motivo muestra el error y no cancela", (assert) => {
    let cancelada = false;
    render(<ModalCancelar reserva={reserva} onConfirmar={() => (cancelada = true)} onCerrar={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar reserva" }));

    assert.ok(screen.getByText("Indica el motivo de la cancelación."));
    assert.notOk(cancelada);
  });

  test("con motivo llama a onConfirmar con el texto escrito", (assert) => {
    let motivoRecibido = null;
    render(<ModalCancelar reserva={reserva} onConfirmar={(m) => (motivoRecibido = m)} onCerrar={() => {}} />);

    fireEvent.change(screen.getByLabelText("Motivo de la cancelación"), { target: { value: "Local cerrado" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar reserva" }));

    assert.equal(motivoRecibido, "Local cerrado");
  });

  test("muestra el error que manda el backend", (assert) => {
    render(<ModalCancelar reserva={reserva} error="Solo se pueden modificar reservas pendientes" onConfirmar={() => {}} onCerrar={() => {}} />);

    assert.ok(screen.getByText("Solo se pueden modificar reservas pendientes"));
  });
});

module("ModalReprogramar", (hooks) => {
  hooks.afterEach(() => cleanup());

  test("carga las horas libres de la fecha y manda la elegida", async (assert) => {
    const fechasPedidas = [];
    const cargarHoras = async (fecha) => {
      fechasPedidas.push(fecha);
      return ["11:00", "12:00"];
    };
    let resultado = null;
    render(
      <ModalReprogramar
        reserva={reserva}
        cargarHoras={cargarHoras}
        onConfirmar={(fecha, hora) => (resultado = { fecha, hora })}
        onCerrar={() => {}}
      />
    );

    await screen.findByRole("option", { name: "12:00" });
    fireEvent.change(screen.getByLabelText("Nueva hora"), { target: { value: "12:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Reprogramar" }));

    assert.deepEqual(fechasPedidas, ["2099-01-10"]);
    assert.deepEqual(resultado, { fecha: "2099-01-10", hora: "12:00" });
  });

  test("sin hora elegida no deja reprogramar", async (assert) => {
    let llamado = false;
    render(
      <ModalReprogramar reserva={reserva} cargarHoras={async () => ["11:00"]} onConfirmar={() => (llamado = true)} onCerrar={() => {}} />
    );

    await screen.findByRole("option", { name: "11:00" });
    fireEvent.click(screen.getByRole("button", { name: "Reprogramar" }));

    assert.ok(screen.getByText("Elige una hora disponible."));
    assert.notOk(llamado);
  });
});
