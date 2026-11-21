import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

// Molde de las páginas del panel: barra de arriba, menú a la izquierda y contenido al centro.
// La carpeta (panel) va entre paréntesis para que no aparezca en la URL.
export default function PanelLayout({ children }) {
  return (
    <>
      <Topbar />
      <div className="container-fluid">
        <div className="row">
          <Sidebar />
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 mb-3">{children}</main>
        </div>
      </div>
    </>
  );
}
