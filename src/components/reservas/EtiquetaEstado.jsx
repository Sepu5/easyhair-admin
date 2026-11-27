import { ESTADOS } from "@/lib/reservas";

// Badge de color según el estado de la reserva
export default function EtiquetaEstado({ estado }) {
  const info = ESTADOS[estado] || { texto: estado, color: "light" };
  return <span className={`badge text-bg-${info.color}`}>{info.texto}</span>;
}
