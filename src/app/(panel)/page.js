"use client";

import { useEffect, useState } from "react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import TarjetaResumen from "@/components/dashboard/TarjetaResumen";
import ProximasReservas from "@/components/dashboard/ProximasReservas";
import StockBajo from "@/components/dashboard/StockBajo";
import { useSesion } from "@/context/SesionContext";
import { pedir } from "@/lib/api";
import { cargarDashboard, armarTarjetas, proximasReservas, nombreMes } from "@/lib/dashboard";
import { formatearPrecio, formatearFecha } from "@/lib/formato";
import { fechaHoy } from "@/lib/reservas";

// Dashboard: resumen del día de la peluquería
export default function Dashboard() {
  const { usuario } = useSesion();
  const hoy = fechaHoy();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let vigente = true;
    cargarDashboard(pedir, hoy)
      .then((respuesta) => vigente && setDatos(respuesta))
      .catch((e) => vigente && setError(e.message));
    return () => {
      vigente = false;
    };
  }, [hoy]);

  const saludo = usuario ? `Hola ${usuario.nombre.split(" ")[0]}, este es el resumen del ${formatearFecha(hoy)}` : "";

  if (error) {
    return (
      <>
        <EncabezadoPagina titulo="Dashboard" descripcion={saludo} />
        <div className="alert alert-danger">{error}</div>
      </>
    );
  }

  if (!datos) {
    return (
      <>
        <EncabezadoPagina titulo="Dashboard" descripcion={saludo} />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </>
    );
  }

  const tarjetas = armarTarjetas(datos);

  return (
    <>
      <EncabezadoPagina titulo="Dashboard" descripcion={saludo} />

      <div className="row g-3 mb-4">
        <TarjetaResumen
          titulo="Reservas de hoy"
          valor={tarjetas.reservasHoy}
          detalle={`${tarjetas.pendientesHoy} por atender`}
          icono="bi-calendar-check"
          color="primary"
        />
        <TarjetaResumen
          titulo={`Ingresos de ${nombreMes(hoy)}`}
          valor={formatearPrecio(tarjetas.ingresosMes)}
          detalle={`Ganancia: ${formatearPrecio(tarjetas.gananciaMes)}`}
          icono="bi-cash-coin"
          color="success"
        />
        <TarjetaResumen
          titulo="Stock bajo"
          valor={tarjetas.stockBajo}
          detalle="materiales por comprar"
          icono="bi-box-seam"
          color="warning"
        />
        <TarjetaResumen
          titulo="Consumos por revisar"
          valor={tarjetas.consumosPendientes}
          detalle="registrados por el staff"
          icono="bi-clipboard-check"
          color="danger"
        />
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <ProximasReservas reservas={proximasReservas(datos.reservasHoy)} />
        </div>
        <div className="col-12 col-lg-6">
          <StockBajo materiales={datos.stockBajo} />
        </div>
      </div>
    </>
  );
}
