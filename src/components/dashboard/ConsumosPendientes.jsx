"use client";

import { useState } from "react";
import ModalBase from "@/components/reservas/ModalBase";
import { pedir } from "@/lib/api";
import { aprobarConsumo, rechazarConsumo, formatearFechaHora } from "@/lib/dashboard";

// Consumos de materiales que registró el staff y que la administración tiene que revisar.
// Al aprobar se descuenta el stock; al rechazar no pasa nada con el inventario.
// alCambiar() avisa al dashboard para que recargue los números.
export default function ConsumosPendientes({ consumos, alCambiar, pedirFn = pedir }) {
  // { tipo: "aprobar" | "rechazar", consumo } o null
  const [accion, setAccion] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  function abrir(tipo, consumo) {
    setAccion({ tipo, consumo });
    setError("");
    setAviso("");
  }

  async function confirmar() {
    setEnviando(true);
    setError("");
    try {
      if (accion.tipo === "aprobar") {
        await aprobarConsumo(pedirFn, accion.consumo.id);
        setAviso(`Consumo aprobado: se descontaron ${accion.consumo.cantidad} de ${accion.consumo.nombreMaterial}.`);
      } else {
        await rechazarConsumo(pedirFn, accion.consumo.id);
        setAviso("Consumo rechazado.");
      }
      setAccion(null);
      if (alCambiar) alCambiar();
    } catch (e) {
      // ej: "No hay stock suficiente de Tintura (quedan 1 unidades)"
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  }

  const esAprobar = accion?.tipo === "aprobar";

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-3">
          <i className="bi bi-clipboard-check me-2"></i>Consumos por revisar
        </h5>

        {aviso && <div className="alert alert-success">{aviso}</div>}

        {consumos.length === 0 ? (
          <p className="text-muted mb-0">No hay consumos pendientes de revisión.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Fecha</th>
                  <th>Staff</th>
                  <th>Material</th>
                  <th>Cantidad</th>
                  <th>Comentario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {consumos.map((consumo) => (
                  <tr key={consumo.id}>
                    <td className="small">{formatearFechaHora(consumo.fechaRegistro)}</td>
                    <td>{consumo.nombreStaff}</td>
                    <td>{consumo.nombreMaterial}</td>
                    <td>{consumo.cantidad}</td>
                    <td className="small text-muted">{consumo.comentario || "—"}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button type="button" className="btn btn-sm btn-success" onClick={() => abrir("aprobar", consumo)}>
                          Aprobar
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => abrir("rechazar", consumo)}>
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {accion && (
        <ModalBase
          titulo={esAprobar ? "Aprobar consumo" : "Rechazar consumo"}
          onCerrar={() => !enviando && setAccion(null)}
          pie={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setAccion(null)} disabled={enviando}>
                Volver
              </button>
              <button
                type="button"
                className={`btn ${esAprobar ? "btn-success" : "btn-danger"}`}
                onClick={confirmar}
                disabled={enviando}
              >
                {enviando ? "Guardando..." : esAprobar ? "Aprobar y descontar stock" : "Rechazar consumo"}
              </button>
            </>
          }
        >
          <p className="mb-0">
            {accion.consumo.nombreStaff} registró <strong>{accion.consumo.cantidad}</strong> de{" "}
            <strong>{accion.consumo.nombreMaterial}</strong>.{" "}
            {esAprobar
              ? "Al aprobarlo se descuenta del inventario."
              : "Al rechazarlo el inventario no cambia."}
          </p>
          {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
        </ModalBase>
      )}
    </div>
  );
}
