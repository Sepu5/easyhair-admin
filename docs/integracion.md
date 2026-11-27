# Documento de integración – EasyHair Admin

**Asignatura:** DSY1104 Desarrollo Fullstack II – Evaluación Parcial 3
**Integrantes:** Franco Sepúlveda (Sepu5) y Luis Grossolli (lugrossolli-ux)
**Frontend:** https://github.com/Sepu5/easyhair-admin
**Backend:** https://github.com/Sepu5/easyhair-backend (rama `fullstack`)
**Web publicada:** https://54-152-113-142.sslip.io
**Swagger del backend:** http://54.152.113.142/swagger-ui.html

En este documento explicamos cómo conectamos la web de administración (Next.js) con el backend de EasyHair (microservicios en Spring Boot), cómo funcionan el inicio de sesión con JWT, la sesión en el navegador y los permisos por rol, y cómo probamos que todo se comunica bien.

---

## 1. Arquitectura

```
 Navegador (web admin)                App Android (clientes y staff)
        │ HTTPS                                │ HTTP
        ▼                                      ▼
 ┌───────────────────── EC2 en AWS (54.152.113.142) ─────────────────────┐
 │  Caddy :443  ── /api/* ──►  API Gateway :80  ◄───────────────────────  │
 │     │                         │  (valida el JWT y agrega             │
 │     └── resto ──► Web Next.js │   X-Usuario-Id y X-Usuario-Rol)      │
 │                  :3000        ▼                                      │
 │        auth  ·  catálogo  ·  reservas  ·  inventario  ·  finanzas      │
 └─────────────────────────────────┬──────────────────────────────────────┘
                                   ▼
                     Supabase (PostgreSQL, un schema por servicio)
```

- **Frontend:** Next.js 16 (App Router), React 19 y Bootstrap 5. Todo lo que se pide al backend pasa por una sola función, `pedir()` en `src/lib/api.js`.
- **API Gateway:** Spring Cloud Gateway. Es la única puerta de entrada: revisa el token y reparte cada ruta a su microservicio.
- **Microservicios:** cada uno es un proyecto Spring Boot con su propio schema en Supabase.
- **Caddy:** pone HTTPS delante de la web y de la API, así el navegador habla con un solo dominio y el token viaja cifrado.

Elegimos reutilizar el backend que ya teníamos para la app Android en vez de hacer uno nuevo. Así la web y la app ven los mismos datos: si el admin crea un servicio en la web, aparece altiro en la app.

## 2. Base de datos

Cada microservicio tiene su propio schema en Supabase. Así ninguno puede tocar las tablas de otro, y si uno necesita datos de otro se los pide por su API.

| Schema | Tablas | Microservicio |
| --- | --- | --- |
| `autenticacion` | `usuarios` (nombre, correo, contraseña con BCrypt, rol) | auth-service |
| `catalogo` | `servicios`, `peluqueros` | catalogo-service |
| `reservas` | `reservas`, `bloqueos` | reservas-service |
| `inventario` | `materiales`, `compras`, `consumos` | inventario-service |
| `finanzas` | `movimientos` | finanzas-service |

Algunas acciones cruzan servicios. Por ejemplo, al atender una reserva, reservas-service le avisa a finanzas-service para que anote el ingreso, y al registrar una compra, inventario-service suma el stock y anota el egreso.

## 3. API REST y Swagger

El backend expone endpoints REST con JSON y todos los errores con el mismo formato: `{ "mensaje": "..." }`. Cada microservicio está documentado con springdoc, y el gateway junta todo en un solo Swagger con un selector por microservicio: **http://54.152.113.142/swagger-ui.html**.

Rutas del gateway:

| Ruta | Microservicio |
| --- | --- |
| `/api/auth/**`, `/api/usuarios/**` | auth-service |
| `/api/servicios/**`, `/api/peluqueros/**` | catalogo-service |
| `/api/reservas/**`, `/api/bloqueos/**` | reservas-service |
| `/api/materiales/**`, `/api/compras/**`, `/api/consumos/**` | inventario-service |
| `/api/movimientos/**` | finanzas-service |

Para la web agregamos al backend (rama `fullstack`, con permiso de la profesora para no tocar `main`):

- El rol **ADMIN** (antes solo existían CLIENTE y STAFF). Registrarse nunca da ADMIN; la cuenta de administración se crea aparte.
- El CRUD de usuarios: `GET/POST /api/usuarios`, `PUT /api/usuarios/{id}`, `PUT /api/usuarios/{id}/rol` y `DELETE /api/usuarios/{id}`.
- La renovación del token: `POST /api/auth/refresh`.
- Los permisos por rol en cada microservicio (respuesta 403 si no corresponde).
- 81 pruebas JUnit en total en el backend.

## 4. Cómo se comunican la web y el backend

Todas las llamadas usan `pedir(ruta, opciones)` de `src/lib/api.js`:

```js
const servicios = await pedir("/api/servicios");
await pedir("/api/servicios", { method: "POST", body: servicio });
```

`pedir()` se encarga de:

1. Armar la URL con `NEXT_PUBLIC_API_URL` (en producción, `https://54-152-113-142.sslip.io`).
2. Agregar `Content-Type: application/json` y, si hay sesión, `Authorization: Bearer <token>`.
3. Convertir el body a JSON y la respuesta de vuelta a objeto (algunas, como DELETE, vienen vacías).
4. Si la respuesta no es 2xx, lanzar un `Error` con el `mensaje` que mandó el backend, para mostrarlo tal cual en pantalla.
5. Si el backend responde **401** y habíamos mandado un token, avisar al resto del panel con el evento `easyhair:sesion-expirada` para cerrar la sesión.

Cómo mostramos los errores:

| Código | Cuándo pasa | Qué hace la web |
| --- | --- | --- |
| 400 | Datos inválidos | Muestra el mensaje del backend en el formulario |
| 401 | Token vencido o inválido | Cierra la sesión y vuelve al login |
| 403 | El rol no puede usar ese endpoint | Muestra el mensaje (normalmente no se ve, porque la web oculta esas opciones) |
| 404 | No existe | Muestra el mensaje |
| 409 | Conflicto (correo repetido, borrarse a sí mismo, hora ocupada) | Muestra el mensaje en el modal |
| Sin respuesta | Learner Lab apagado o sin internet | "No se pudo conectar con el servidor" |

**Para que el flujo sea eficiente:**

- Cuando una pantalla necesita varias cosas, las pedimos **en paralelo con `Promise.all`**. Por ejemplo, el dashboard pide el resumen del mes, la agenda, el stock bajo y los consumos al mismo tiempo, así carga en lo que tarda la más lenta y no en la suma de todas.
- Los filtros que se pueden resolver en el navegador (como el estado de las reservas o el buscador de usuarios) no vuelven a llamar al backend.
- Al cambiar un filtro rápido usamos una variable `vigente` para ignorar respuestas viejas que lleguen tarde.
- Después de guardar no armamos la lista a mano: la volvemos a pedir, así lo que se ve es siempre lo que quedó en la base de datos.

### Endpoints que usa cada pantalla

| Pantalla | Endpoints | Rol |
| --- | --- | --- |
| Login | `POST /api/auth/login` | Público |
| Sesión (automático) | `POST /api/auth/refresh` | ADMIN, STAFF |
| Dashboard | `GET /api/movimientos/resumen`, `GET /api/peluqueros`, `GET /api/reservas/agenda`, `GET /api/materiales/stock-bajo`, `GET /api/consumos?estado=PENDIENTE`, `PUT /api/consumos/{id}/aprobar`, `PUT /api/consumos/{id}/rechazar` | ADMIN (el STAFF solo pide peluqueros y agenda) |
| Reservas | `GET /api/peluqueros`, `GET /api/reservas/agenda`, `PUT /api/reservas/{id}/atender`, `PUT /api/reservas/{id}/no-asistio`, `PUT /api/reservas/{id}/cancelar`, `PUT /api/reservas/{id}/reprogramar`, `GET /api/reservas/disponibilidad`, `GET/POST /api/bloqueos`, `DELETE /api/bloqueos/{id}` | ADMIN, STAFF |
| Servicios | `GET /api/servicios`, `POST /api/servicios`, `PUT /api/servicios/{id}`, `DELETE /api/servicios/{id}` | Ver: todos. Editar: ADMIN |
| Peluqueros | `GET /api/peluqueros`, `POST /api/peluqueros`, `PUT /api/peluqueros/{id}` | Ver: todos. Editar: ADMIN |
| Inventario | `GET /api/materiales`, `GET /api/materiales/stock-bajo`, `GET /api/compras`, `POST /api/materiales`, `PUT /api/materiales/{id}`, `POST /api/compras` | ADMIN |
| Finanzas | `GET /api/movimientos`, `GET /api/movimientos/resumen`, `GET /api/movimientos/resumen/peluqueros`, `GET /api/movimientos/resumen/categorias`, `POST /api/movimientos`, `DELETE /api/movimientos/{id}` | ADMIN |
| Usuarios | `GET /api/usuarios`, `POST /api/usuarios`, `PUT /api/usuarios/{id}`, `PUT /api/usuarios/{id}/rol`, `DELETE /api/usuarios/{id}` | ADMIN |
| Perfil | `GET /api/usuarios/{id}`, `PUT /api/usuarios/{id}` | La propia cuenta (o ADMIN) |

## 5. Autenticación con JWT y roles (backend)

**Inicio de sesión:**

1. La web manda `POST /api/auth/login` con correo y contraseña.
2. auth-service busca el usuario y compara la contraseña con **BCrypt** (en la base de datos nunca se guarda en texto plano).
3. Si está bien, genera un **JWT firmado con HMAC-SHA** con una clave secreta que solo conoce el backend. Adentro van el id, el rol y la fecha de vencimiento (`exp`, **24 horas**).
4. Responde `{ token, usuario: { id, nombre, correo, rol } }`.

**En cada petición:**

1. La web manda `Authorization: Bearer <token>`.
2. El **gateway** (`JwtFiltro`) revisa la firma y el vencimiento. Si el token no sirve, responde **401** y la petición ni siquiera llega al microservicio.
3. Si sirve, el gateway agrega los headers `X-Usuario-Id` y `X-Usuario-Rol` con lo que dice el token. En las rutas públicas borra esos headers, para que nadie pueda mandarlos a mano y hacerse pasar por ADMIN.
4. Cada microservicio revisa el rol con la clase `Permisos` (`soloAdmin`, `soloPeluqueria`). Si no corresponde, responde **403** con `{ "mensaje": "Solo la administración puede hacer esto" }`.

Ejemplos de lo que exige el backend:

| Acción | Rol necesario |
| --- | --- |
| Ver servicios y peluqueros | Público |
| Crear, editar o eliminar servicios y peluqueros | ADMIN |
| Agenda, atender, no asistió, bloqueos | STAFF o ADMIN |
| Materiales: stock bajo, crear, editar, compras | ADMIN |
| Revisar consumos (aprobar o rechazar) | ADMIN |
| Finanzas completas | ADMIN |
| Listar, crear, cambiar rol o eliminar usuarios | ADMIN |
| Ver o editar un usuario | La misma persona o ADMIN |

Además, el ADMIN no puede quitarse su propio rol ni borrar su propia cuenta (409), para que nunca quede el sistema sin administrador.

**Renovación del token:** `POST /api/auth/refresh` recibe el token actual y, si todavía es válido, vuelve a leer el usuario de la base de datos y entrega un token nuevo por otras 24 horas. Como vuelve a leer el usuario, si le cambiaron el rol, el token nuevo ya trae el rol actualizado. Si la cuenta se eliminó, responde 401.

## 6. Gestión de la sesión en el frontend

Todo está en `src/lib/sesion.js` (lógica sin React, con pruebas) y `src/context/SesionContext.jsx` (comparte la sesión con todo el panel).

**Dónde guardamos la sesión:** en `localStorage`, con dos claves: `easyhair_token` (el JWT) y `easyhair_usuario` (nombre, correo y rol, para mostrarlos sin tener que leer el token).

Comparamos las opciones antes de elegir:

| Opción | Ventaja | Por qué no la usamos (o sí) |
| --- | --- | --- |
| Solo en memoria (estado de React) | Lo más seguro frente a scripts | Se pierde al recargar la página y la pauta pide que la sesión sobreviva a la recarga |
| `sessionStorage` | Se borra al cerrar la pestaña | Si se abre el panel en otra pestaña hay que iniciar sesión de nuevo |
| Cookie `httpOnly` | El JavaScript no puede leerla | Necesitaba cambiar el backend y el gateway para manejar cookies y CSRF, y la app Android ya usa el header `Authorization` |
| **`localStorage`** | Sobrevive a recargas y pestañas; funciona igual que la app | **La elegimos.** El riesgo es un script malicioso (XSS), así que lo bajamos así: React escapa todo lo que mostramos, no usamos `dangerouslySetInnerHTML`, el token vence a las 24 horas y la web va por HTTPS |

**Cómo funciona:**

1. **Al iniciar sesión** guardamos el token y el usuario, y el `SesionContext` actualiza el estado para que la barra de arriba y el menú cambien.
2. **Al recargar la página**, `SesionProvider` lee `localStorage` en un `useEffect` (en el servidor no existe). Antes de usar el token revisamos su fecha `exp`: si ya venció, borramos la sesión y vamos al login. Mientras revisa muestra un spinner, para que no se vea el panel por un instante sin sesión.
3. **Si el backend responde 401** en cualquier llamada, `pedir()` dispara el evento `easyhair:sesion-expirada` y el contexto cierra la sesión en todo el panel.
4. **Renovación automática:** mientras hay sesión, cada 5 minutos revisamos cuánto le queda al token. Si le queda menos de 1 hora, pedimos uno nuevo con `/api/auth/refresh`. Así alguien que está usando el panel no pierde la sesión en medio de un trabajo. Si la cuenta ya no tiene acceso al panel (por ejemplo, le cambiaron el rol a CLIENTE), cerramos la sesión.
5. **Cerrar sesión** borra las dos claves y vuelve al login.
6. **Los clientes no entran:** si el login responde con rol CLIENTE, no guardamos nada y mostramos "Esta cuenta es de cliente. Usa la app de EasyHair para reservar."

`PanelProtegido` envuelve todas las páginas del panel: si no hay sesión, manda a `/login`. La página de login hace lo contrario: si ya hay sesión, manda al dashboard.

## 7. Restricciones de acceso en el frontend

Las reglas están en un solo archivo, `src/lib/permisos.js`, para no repetirlas en cada página:

```js
export const RUTAS_POR_ROL = {
  ADMIN: ["/", "/reservas", "/servicios", "/peluqueros", "/inventario", "/finanzas", "/usuarios", "/perfil"],
  STAFF: ["/", "/reservas", "/servicios", "/peluqueros", "/perfil"],
};
export const ACCIONES_ADMIN = ["editarServicios", "editarPeluqueros", "verResumenAdmin"];
```

Las usamos en cuatro niveles:

1. **Menú lateral:** `menuDelRol(rol)` filtra las opciones. Al STAFF no le aparecen Inventario, Finanzas ni Usuarios.
2. **Páginas:** `RutaPermitida` (en el layout del panel) revisa la URL con `puedeVerRuta(rol, ruta)`. Si un STAFF escribe a mano `/finanzas`, ve la página **"Sin permisos"** con un botón para volver al inicio.
3. **Botones:** con `puedeHacer(rol, accion)` ocultamos "Nuevo", "Editar" y "Eliminar" en Servicios y Peluqueros para el STAFF, que solo ve la lista.
4. **Contenido de una página:** el Dashboard del STAFF muestra solo las reservas de hoy y no pide los datos de plata ni de inventario.

Además, en Usuarios el admin no puede editar, cambiar de rol ni eliminar su propia cuenta (los botones aparecen desactivados), y el título del panel cambia entre "EasyHair Admin" y "EasyHair Staff".

**Importante:** esto es para que la web sea cómoda y clara, pero **la seguridad de verdad está en el backend**. Aunque alguien modificara el JavaScript del navegador para ver un botón oculto, el backend respondería 403. Por eso pusimos las mismas reglas en los dos lados.

Ejemplos de pantallas restringidas (los pantallazos están en el manual de usuario, sección 10):

| Pantalla | ADMIN | STAFF |
| --- | --- | --- |
| Menú | 7 opciones | Dashboard, Reservas, Servicios y Peluqueros |
| `/finanzas` | Reportes del mes | "Sin permisos" |
| `/servicios` | Lista con "Nuevo servicio", "Editar" y "Eliminar" | Solo la lista |
| `/` | 4 tarjetas, stock bajo y consumos por revisar | Solo "Reservas de hoy" |

## 8. Pruebas y resultado de la comunicación

**Pruebas automáticas del frontend (QUnit):** 264 pruebas, todas pasan (`npm test`). Las funciones que llaman al backend reciben `pedir` como parámetro, así en las pruebas les pasamos una función falsa que anota qué ruta, método y body se pidió, y devuelve datos de ejemplo. Probamos, entre otras cosas:

- Que cada función llama al endpoint correcto con el método y los datos correctos.
- `pedir()`: headers, token, errores con `mensaje` y el evento de sesión expirada con 401.
- La sesión: leer el `exp` del token, tokens vencidos o inválidos, guardar, leer y borrar, y cuándo renovar.
- Los permisos: qué rutas y acciones tiene cada rol, el menú del STAFF y la página "Sin permisos".
- Las validaciones de los formularios y los componentes (tablas, modales, filtros) con React Testing Library.

Las páginas de `src/app` las probamos a mano contra el backend real (tabla de más abajo).

**Pruebas del backend (JUnit):** 81 pruebas, todas pasan (`mvnw test`), incluidas las de permisos, usuarios y renovación del token.

**Pruebas contra el backend real en AWS:**

| Prueba | Resultado esperado | Resultado |
| --- | --- | --- |
| Login con ADMIN y con STAFF | 200 con token y rol | ✅ |
| Login con una cuenta CLIENTE en la web | No entra, aviso para usar la app | ✅ |
| `POST /api/auth/refresh` sin token | 401 | ✅ |
| `POST /api/auth/refresh` con token válido | 200 con token nuevo | ✅ |
| STAFF pide `GET /api/usuarios` | 403 | ✅ |
| STAFF pide `GET /api/movimientos/resumen` | 403 | ✅ |
| STAFF pide `GET /api/consumos` | 403 | ✅ |
| STAFF pide `GET /api/materiales` y la agenda | 200 | ✅ |
| `GET /api/servicios` sin token | 200 (público) | ✅ |
| Recargar la página con sesión iniciada | Sigue logueado | ✅ |
| Web publicada pide `/api/servicios` por HTTPS | 200 con los 12 servicios | ✅ |
| CRUD de usuarios desde la web | Crear, editar, cambiar rol y eliminar funcionan | ✅ |

Para revisar las peticiones en el navegador: F12 → pestaña **Red (Network)** → filtrar por `api`. Ahí se ve cada llamada con su método, el código de respuesta y el header `Authorization: Bearer ...`.

## 9. Despliegue

- La web corre en el mismo EC2 del backend con Docker (`Dockerfile` en dos etapas y `docker-compose.yml`).
- **Caddy** pone HTTPS con un certificado de Let's Encrypt en `https://54-152-113-142.sslip.io`. `/api/*` va al gateway y el resto a la web.
- La app Android sigue usando `http://54.152.113.142` (puerto 80), que no tocamos.
- Todos los contenedores tienen `restart: unless-stopped`: al encender el Learner Lab todo se levanta solo.
- Security Group: 80 (gateway), 443 (HTTPS), 3000 (web directa, de respaldo) y 22 (SSH).

## 10. Limitaciones conocidas

- **Cambio de rol:** el rol va dentro del token, así que si el admin le cambia el rol a alguien, el cambio se aplica cuando esa persona vuelve a iniciar sesión o cuando su token se renueva. El modal de "Cambiar rol" lo avisa.
- **IP del Learner Lab:** la web y el certificado dependen de la IP elástica `54.152.113.142`. Si cambiara, hay que volver a construir la imagen con la URL nueva (está explicado en el README).
- **CORS:** el backend todavía acepta cualquier origen. Como la web llama a la API por el mismo dominio (gracias a Caddy), en producción no hace falta CORS, pero lo dejamos así para poder desarrollar desde `localhost`.
