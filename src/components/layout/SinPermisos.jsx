import Link from "next/link";

// Esto lo mostramos cuando alguien entra a una sección que su rol no puede ver
export default function SinPermisos() {
  return (
    <div className="text-center my-5">
      <i className="bi bi-shield-lock text-danger" style={{ fontSize: "4rem" }}></i>
      <h4 className="mt-3">Sin permisos</h4>
      <p className="text-muted">
        Tu cuenta no tiene acceso a esta sección. Si crees que es un error, habla con el administrador.
      </p>
      <Link href="/" className="btn btn-primary">
        Volver al inicio
      </Link>
    </div>
  );
}
