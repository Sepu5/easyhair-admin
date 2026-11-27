import { ETIQUETAS_ROL } from "@/lib/usuarios";

// Badge de color con el rol del usuario
export default function EtiquetaRol({ rol }) {
  const etiqueta = ETIQUETAS_ROL[rol] || { texto: rol, color: "text-bg-light" };
  return <span className={`badge ${etiqueta.color}`}>{etiqueta.texto}</span>;
}
