import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import BootstrapClient from "@/components/BootstrapClient";
import { SesionProvider } from "@/context/SesionContext";

export const metadata = {
  title: "EasyHair | Administrador",
  description: "Panel de administración de la peluquería EasyHair",
};

// Molde de todas las páginas (también del login).
// El menú lateral está en (panel)/layout.js para que el login no lo tenga.
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {/* SesionProvider comparte el usuario logueado con todas las páginas */}
        <SesionProvider>{children}</SesionProvider>
        <BootstrapClient />
      </body>
    </html>
  );
}
