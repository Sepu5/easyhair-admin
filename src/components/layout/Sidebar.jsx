import NavLink from "@/components/layout/NavLink";
import { opcionesMenu } from "@/lib/menu";

// Menú vertical del panel. En celular se transforma en offcanvas.
export default function Sidebar() {
  return (
    <div className="sidebar border border-right col-md-3 col-lg-2 p-0 bg-body-tertiary">
      <div className="offcanvas-md offcanvas-start bg-body-tertiary" tabIndex="-1" id="menuLateral" aria-labelledby="menuLateralTitulo">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="menuLateralTitulo">EasyHair Admin</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#menuLateral" aria-label="Cerrar"></button>
        </div>

        <div className="offcanvas-body d-md-flex flex-column p-0 pt-lg-3 overflow-y-auto">
          <ul className="nav flex-column">
            {opcionesMenu.map((opcion) => (
              <li key={opcion.href} className="nav-item mx-2">
                <NavLink href={opcion.href} icono={opcion.icono}>
                  {opcion.texto}
                </NavLink>
              </li>
            ))}
          </ul>

          <hr className="my-3" />

          <ul className="nav flex-column mb-auto">
            <li className="nav-item mx-2">
              <NavLink href="/perfil" icono="bi-person-circle">
                Perfil
              </NavLink>
            </li>
          </ul>

          <hr className="my-3" />

          {/* el cierre de sesión se conecta en la tarjeta 3 */}
          <ul className="nav flex-column mb-3">
            <li className="nav-item mx-2">
              <button type="button" className="btn btn-danger mx-4 d-flex gap-2 justify-content-center">
                <i className="bi bi-door-closed"></i>
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
