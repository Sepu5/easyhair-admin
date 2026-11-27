import PanelProtegido from "@/components/layout/PanelProtegido";
import RutaPermitida from "@/components/layout/RutaPermitida";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

// Este es el molde de todas las páginas del panel: barra arriba, menú a la izquierda y contenido al centro.
// Pusimos la carpeta (panel) entre paréntesis para que Next no la agregue a la URL.
// PanelProtegido no deja ver nada sin sesión y RutaPermitida revisa si el rol puede ver la página.
export default function PanelLayout({ children }) {
  return (
    <PanelProtegido>
      <Topbar />
      <div className="container-fluid">
        <div className="row">
          <Sidebar />
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 mb-3">
            <RutaPermitida>{children}</RutaPermitida>
          </main>
        </div>
      </div>
    </PanelProtegido>
  );
}
