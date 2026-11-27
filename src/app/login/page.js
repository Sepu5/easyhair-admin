"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { useSesion } from "@/context/SesionContext";

// Inicio de sesión. Lo dejamos fuera de la carpeta (panel) para que no tenga menú
export default function Login() {
  const router = useRouter();
  const { haySesion, cargando } = useSesion();

  // si ya había una sesión guardada lo mandamos directo al panel
  useEffect(() => {
    if (!cargando && haySesion) {
      router.replace("/");
    }
  }, [cargando, haySesion, router]);

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <i className="bi bi-scissors fs-1 text-primary"></i>
                <h4 className="mt-2 mb-0">EasyHair Admin</h4>
                <p className="text-muted">Inicia sesión para administrar la peluquería</p>
              </div>
              <LoginForm alEntrar={() => router.replace("/")} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
