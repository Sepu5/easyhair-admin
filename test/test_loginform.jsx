import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "@/components/auth/LoginForm";
import { SesionProvider } from "@/context/SesionContext";
import { CLAVE_TOKEN } from "@/lib/api";

const { module, test } = QUnit;

// Token falso que vence en una hora
const token = `x.${btoa(JSON.stringify({ id: 1, rol: "ADMIN", exp: Math.floor(Date.now() / 1000) + 3600 }))}.firma`;

// fetch falso (mock) que responde lo que le digamos
function fetchFalso(status, cuerpo) {
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(cuerpo),
  });
}

function dibujar(alEntrar = () => {}) {
  return render(
    <SesionProvider>
      <LoginForm alEntrar={alEntrar} />
    </SesionProvider>
  );
}

function escribir(correo, contrasena) {
  fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: correo } });
  fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: contrasena } });
}

module("LoginForm", (hooks) => {
  const fetchOriginal = globalThis.fetch;

  hooks.afterEach(() => {
    cleanup();
    localStorage.clear();
    globalThis.fetch = fetchOriginal;
  });

  test("enviar vacío muestra los errores y no llama al backend", (assert) => {
    let llamado = false;
    globalThis.fetch = async () => {
      llamado = true;
    };
    dibujar();

    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    assert.ok(screen.getByText("Debes escribir tu correo."));
    assert.ok(screen.getByText("Debes escribir tu contraseña."));
    assert.notOk(llamado);
  });

  test("login correcto de ADMIN guarda la sesión y entra al panel", async (assert) => {
    globalThis.fetch = fetchFalso(200, {
      token,
      usuario: { id: 1, nombre: "Ana", correo: "ana@gmail.com", rol: "ADMIN" },
    });
    let entro = false;
    dibujar(() => {
      entro = true;
    });

    escribir("ana@gmail.com", "1234");
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    // espera a que termine el login (sin anotar asserts mientras reintenta)
    await waitFor(() => {
      if (!entro) throw new Error("todavía no entra");
    });
    assert.ok(entro);
    assert.equal(localStorage.getItem(CLAVE_TOKEN), token);
  });

  test("una cuenta CLIENTE no puede entrar", async (assert) => {
    globalThis.fetch = fetchFalso(200, {
      token,
      usuario: { id: 2, nombre: "Pepe", correo: "pepe@gmail.com", rol: "CLIENTE" },
    });
    dibujar();

    escribir("pepe@gmail.com", "1234");
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    assert.ok(await screen.findByText(/Esta cuenta es de cliente/));
    assert.equal(localStorage.getItem(CLAVE_TOKEN), null);
  });

  test("muestra el mensaje del backend si la contraseña es incorrecta", async (assert) => {
    globalThis.fetch = fetchFalso(401, { mensaje: "Correo o contraseña incorrectos" });
    dibujar();

    escribir("ana@gmail.com", "malaclave");
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    assert.ok(await screen.findByText("Correo o contraseña incorrectos"));
  });
});
