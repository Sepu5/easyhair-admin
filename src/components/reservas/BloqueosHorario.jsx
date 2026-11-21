"use client";

import { useEffect, useState } from "react";
import ModalBase from "@/components/reservas/ModalBase";
import { pedir } from "@/lib/api";
import { formatearFecha } from "@/lib/formato";
import {
  cargarBloqueos,
  cargarHorasLibres,
  crearBloqueo,
  eliminarBloqueo,
  validarBloqueo,
} from "@/lib/reservas";

// Bloqueos de horario de un peluquero en una fecha (ej. tiene un trámite a las 15:00).
// Una hora bloqueada ya no aparece para reservar en la app.
// pedirFn se puede cambiar en las pruebas por uno falso.
export default function BloqueosHorario({ fecha, peluquero, hoy, pedirFn = pedir }) {
  const [bloqueos, setBloqueos] = useState([]);
  const [horasLibres, setHorasLibres] = useState([]);
  const [form, setForm] = useState({ hora: "", motivo: "" });
  const [intento, setIntento] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [aEliminar, setAEliminar] = useState(null);
  const [recargas, setRecargas] = useState(0);

  const esPasada = fecha < hoy;

  // bloqueos y horas libres se piden juntos (en paralelo)
  useEffect(() => {
    if (!peluquero) return;
    let vigente = true;

    async function cargar() {
      setCargando(true);
      setError("");
      try {
        const [lista, libres] = await Promise.all([
          cargarBloqueos(pedirFn, fecha, peluquero.id),
          fecha < hoy ? Promise.resolve([]) : cargarHorasLibres(pedirFn, fecha, peluquero.id),
        ]);
        if (vigente) {
          setBloqueos(lista);
          setHorasLibres(libres);
        }
      } catch (e) {
        if (vigente) setError(e.message);
      } finally {
        if (vigente) setCargando(false);
      }
    }

    cargar();
    return () => {
      vigente = false;
    };
  }, [fecha, peluquero, hoy, pedirFn, recargas]);

  if (!peluquero) {
    return (
      <div className="alert alert-light border">
        Elige un peluquero en el filtro para ver y crear bloqueos de horario.
      </div>
    );
  }

  const errores = validarBloqueo(form);

  async function bloquear(e) {
    e.preventDefault();
    setIntento(true);
    if (Object.keys(errores).length > 0) return;

    setEnviando(true);
    setError("");
    try {
      await crearBloqueo(pedirFn, { peluqueroId: peluquero.id, fecha, ...form });
      setForm({ hora: "", motivo: "" });
      setIntento(false);
      setRecargas((n) => n + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarEliminar() {
    setEnviando(true);
    setError("");
    try {
      await eliminarBloqueo(pedirFn, aEliminar.id);
      setAEliminar(null);
      setRecargas((n) => n + 1);
    } catch (err) {
      setError(err.message);
      setAEliminar(null);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h5 className="card-title">
          <i className="bi bi-slash-circle me-2"></i>
          Bloqueos de horario
        </h5>
        <p className="text-muted small">
          {peluquero.nombre} · {formatearFecha(fecha)}. Las horas bloqueadas no se pueden reservar en la app.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        {cargando ? (
          <p className="text-muted">Cargando bloqueos...</p>
        ) : bloqueos.length === 0 ? (
          <p className="text-muted">No hay horas bloqueadas este día.</p>
        ) : (
          <ul className="list-group mb-3">
            {bloqueos.map((bloqueo) => (
              <li key={bloqueo.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <strong>{bloqueo.hora}</strong>
                  {bloqueo.motivo && <span className="text-muted ms-2">{bloqueo.motivo}</span>}
                </span>
                {!esPasada && (
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setAEliminar(bloqueo)}>
                    Quitar bloqueo
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {esPasada ? (
          <p className="small text-muted mb-0">No se pueden bloquear horas de días que ya pasaron.</p>
        ) : (
          <form className="row g-2 align-items-start" onSubmit={bloquear} noValidate>
            <div className="col-12 col-md-3">
              <label htmlFor="horaBloqueo" className="form-label small">Hora</label>
              <select
                id="horaBloqueo"
                className={`form-select ${intento && errores.hora ? "is-invalid" : ""}`}
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
              >
                <option value="">Elige una hora</option>
                {horasLibres.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>
              {intento && errores.hora && <div className="invalid-feedback">{errores.hora}</div>}
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="motivoBloqueo" className="form-label small">Motivo (opcional)</label>
              <input
                id="motivoBloqueo"
                className={`form-control ${intento && errores.motivo ? "is-invalid" : ""}`}
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                placeholder="Ej: hora médica"
              />
              {intento && errores.motivo && <div className="invalid-feedback">{errores.motivo}</div>}
            </div>
            <div className="col-12 col-md-3 d-grid">
              <label className="form-label small invisible">Bloquear</label>
              <button type="submit" className="btn btn-dark" disabled={enviando}>
                {enviando ? "Guardando..." : "Bloquear hora"}
              </button>
            </div>
          </form>
        )}
      </div>

      {aEliminar && (
        <ModalBase
          titulo="Quitar bloqueo"
          onCerrar={() => !enviando && setAEliminar(null)}
          pie={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setAEliminar(null)} disabled={enviando}>
                Volver
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmarEliminar} disabled={enviando}>
                {enviando ? "Quitando..." : "Quitar bloqueo"}
              </button>
            </>
          }
        >
          ¿Quieres liberar las <strong>{aEliminar.hora}</strong> del {formatearFecha(fecha)}? Esa hora volverá a estar disponible para reservar.
        </ModalBase>
      )}
    </div>
  );
}
