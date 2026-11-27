# EasyHair Admin

Panel web de administración de la peluquería **EasyHair**, hecho para la Evaluación Parcial 3 de **DSY1104 Desarrollo Fullstack II**. Es la parte web del mismo proyecto de la app Android EasyHair: usa el mismo backend de microservicios en Spring Boot (con Supabase como base de datos) que ya teníamos desplegado en AWS, y le agregamos lo que faltaba para administrar la peluquería desde el computador.

Lo armamos con la misma estructura que usamos en **mi-tienda** (Next.js + Bootstrap + QUnit), pero esta vez conectado a una API REST real con inicio de sesión por **JWT**, roles y permisos.

**Web publicada:** https://54-152-113-142.sslip.io

## Integrantes

| Integrante | Usuario de GitHub |
| --- | --- |
| Franco Sepúlveda | [Sepu5](https://github.com/Sepu5) |
| Luis Grossolli | [lugrossolli-ux](https://github.com/lugrossolli-ux) |

- **Frontend (este repo):** https://github.com/Sepu5/easyhair-admin
- **Backend:** https://github.com/Sepu5/easyhair-backend (rama `fullstack`)

## Qué se puede hacer

- **Iniciar sesión** con correo y contraseña. La sesión se mantiene al recargar la página y el token se renueva solo antes de vencer.
- **Dashboard** con las reservas de hoy, los ingresos del mes, el stock bajo y los consumos de materiales por revisar.
- **Reservas:** agenda del día por peluquero y estado; atender, marcar que no asistió, cancelar con motivo, reprogramar y bloquear horas.
- **Servicios, peluqueros e inventario:** listar, crear, editar y (cuando corresponde) eliminar. En inventario también se registran compras.
- **Finanzas:** movimientos del mes, resumen por categoría y por peluquero, y registro de movimientos a mano.
- **Usuarios:** crear cuentas, editarlas, cambiar el rol y eliminarlas.
- **Perfil:** cambiar el nombre, el correo o la contraseña.

## Roles

| Sección | ADMIN | STAFF | CLIENTE |
| --- | --- | --- | --- |
| Dashboard | Completo | Solo reservas de hoy | No entra al panel |
| Reservas | Sí | Sí | No |
| Servicios / Peluqueros | Ver y editar | Solo ver | No |
| Inventario, Finanzas, Usuarios | Sí | No (página "Sin permisos") | No |
| Perfil | Sí | Sí | No |

Los clientes usan la app Android. El menú, los botones y las páginas se ocultan según el rol, y además el backend responde **403** si alguien intenta usar un endpoint que no le corresponde.

## Tecnologías

| Tecnología | Versión | Para qué la usamos |
| --- | --- | --- |
| [Next.js](https://nextjs.org/) (App Router) | 16.4.3 | Framework, rutas y layouts |
| [React](https://react.dev/) / React DOM | 19.3.0 | Componentes, estado, hooks y Context |
| [Bootstrap](https://getbootstrap.com/) | ^5.3.3 | Estilos, tablas, modales y menú lateral |
| [Bootstrap Icons](https://icons.getbootstrap.com/) | ^1.13.2 | Íconos |
| [QUnit](https://qunitjs.com/) | 2.24.1 | Pruebas unitarias (la herramienta vista en clase) |
| jsdom + global-jsdom | 30.1.3 / 30.0.0 | Navegador falso para probar componentes en Node |
| React Testing Library | 16.3.3 | Dibujar componentes y simular clics en las pruebas |
| tsx + cross-env | 4.23.15 / 10.1.0 | Que Node entienda el JSX de las pruebas y que `npm test` funcione igual en Windows, Linux y Mac |
| [c8](https://github.com/bcoe/c8) | 12.0.0 | Cobertura de código de las pruebas |
| ESLint + eslint-config-next | ^9 / 16.4.3 | Revisión del código |
| Docker + [Caddy](https://caddyserver.com/) | Caddy 2 | Despliegue en AWS EC2 con HTTPS |

**Backend que consume:** Spring Boot (microservicios auth, catálogo, reservas, inventario, finanzas y gateway), Supabase (PostgreSQL) y JWT, desplegado con Docker en el mismo EC2.

## Requisitos

- **Node.js 22** o más nuevo (las pruebas usan `global-jsdom`, que pide Node 22).
- **npm** y **Git**.

## Instalación

```bash
git clone https://github.com/Sepu5/easyhair-admin.git
cd easyhair-admin
npm install
```

La web usa el backend que está en AWS. La URL se configura con la variable `NEXT_PUBLIC_API_URL` (hay un ejemplo en `.env.example`). Si no se define, usa `http://54.152.113.142`, que es la IP elástica del EC2.

## Cómo ejecutar

```bash
npm run dev
```

Abrir http://localhost:3000. Para entrar hace falta una cuenta con rol **ADMIN** o **STAFF**. El **Learner Lab tiene que estar encendido**, porque ahí corre el backend.

### Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en http://localhost:3000 |
| `npm run build` | Genera la versión de producción |
| `npm start` | Sirve la versión generada con `npm run build` |
| `npm run lint` | Revisa el código con ESLint (0 errores) |
| `npm test` | Corre las pruebas con QUnit |
| `npm run coverage` | Corre las pruebas midiendo la cobertura con c8 (reporte en la terminal y en `coverage/index.html`) |

## Pruebas

```bash
npm test
```

Al final aparece un resumen como este:

```
1..264
# pass 264
# skip 0
# todo 0
# fail 0
```

Las funciones que llaman al backend reciben la función `pedir` como parámetro, así en las pruebas le pasamos una falsa y no dependemos de que AWS esté encendido. Probamos la lógica de `src/lib` (validaciones, permisos, sesión, filtros, armado de datos) y los componentes con React Testing Library.

## Estructura de carpetas

```
easyhair-admin/
├── Dockerfile               # Imagen de la web (compila Next.js en modo standalone)
├── docker-compose.yml       # Web + Caddy en el EC2
├── Caddyfile                # HTTPS con Let's Encrypt; /api va al gateway y el resto a la web
├── next.config.mjs          # output: "standalone" para Docker
├── .env.example             # Ejemplo de NEXT_PUBLIC_API_URL
├── docs/
│   ├── manual-usuario.md    # Manual de usuario con pantallazos (y su versión .docx)
│   ├── integracion.md       # Documento de integración frontend ↔ backend (y su versión .docx)
│   └── img/                 # Pantallazos del manual
├── src/
│   ├── app/
│   │   ├── layout.js        # Molde de todas las páginas (Bootstrap y SesionProvider)
│   │   ├── login/           # /login (fuera del panel, sin menú)
│   │   └── (panel)/         # Páginas con menú; el paréntesis hace que no aparezca en la URL
│   │       ├── layout.js    # PanelProtegido + Topbar + Sidebar + RutaPermitida
│   │       ├── page.js      # / (dashboard)
│   │       ├── reservas/  servicios/  peluqueros/  inventario/
│   │       └── finanzas/  usuarios/  perfil/
│   ├── components/          # Componentes agrupados por sección
│   │   ├── layout/          # Topbar, Sidebar, NavLink, PanelProtegido, RutaPermitida, SinPermisos...
│   │   ├── dashboard/  reservas/  servicios/  peluqueros/  inventario/
│   │   ├── finanzas/  usuarios/  perfil/  auth/
│   │   └── formularios/     # Campo (el mismo de mi-tienda)
│   ├── context/
│   │   └── SesionContext.jsx  # Sesión compartida, cierre por 401 y renovación del token
│   └── lib/                 # Lógica sin React (fácil de probar)
│       ├── api.js           # pedir(): todas las llamadas al backend pasan por aquí
│       ├── sesion.js        # Guardar, leer y renovar la sesión (JWT)
│       ├── permisos.js      # Qué rutas y acciones puede usar cada rol
│       ├── menu.js          # Opciones del menú lateral
│       └── reservas.js  servicios.js  peluqueros.js  inventario.js
│           finanzas.js  usuarios.js  perfil.js  dashboard.js  formato.js  validaciones.js
└── test/                    # 31 archivos de pruebas QUnit + setup.js
```

## Páginas

| Ruta | Descripción | Roles |
| --- | --- | --- |
| `/login` | Inicio de sesión | Todos (el cliente recibe un aviso y no entra) |
| `/` | Dashboard | ADMIN completo, STAFF solo reservas de hoy |
| `/reservas` | Agenda, acciones sobre reservas y bloqueos de horario | ADMIN, STAFF |
| `/servicios` | Mantenedor de servicios | ADMIN edita, STAFF solo ve |
| `/peluqueros` | Mantenedor de peluqueros | ADMIN edita, STAFF solo ve |
| `/inventario` | Materiales, stock bajo y compras | ADMIN |
| `/finanzas` | Movimientos y reportes del mes | ADMIN |
| `/usuarios` | Mantenedor de cuentas y roles | ADMIN |
| `/perfil` | Datos de la propia cuenta | ADMIN, STAFF |

## Despliegue

La web corre en el **mismo EC2** del backend (AWS Academy Learner Lab), con Docker:

```bash
git clone https://github.com/Sepu5/easyhair-admin.git
cd easyhair-admin
docker compose up -d --build
```

- **Caddy** pone HTTPS con un certificado gratis de Let's Encrypt. Usamos [sslip.io](https://sslip.io) para tener un dominio a partir de la IP: `54-152-113-142.sslip.io` apunta a `54.152.113.142`.
- `https://54-152-113-142.sslip.io/api/...` va al gateway del backend y todo lo demás a la web, así la web y la API quedan en el mismo dominio y el token viaja cifrado.
- La app Android sigue usando el gateway por `http://54.152.113.142` (puerto 80), que no se tocó.
- Los contenedores tienen `restart: unless-stopped`, así que al encender el Learner Lab todo se levanta solo.
- En el Security Group están abiertos los puertos 443 (HTTPS) y 3000 (acceso directo sin HTTPS, de respaldo).
- Si algún día cambia la IP, hay que construir de nuevo con la URL nueva: `NEXT_PUBLIC_API_URL=https://<nueva-ip-con-guiones>.sslip.io docker compose up -d --build`.

## Ramas y tareas

Trabajamos con `main` ← `Desarrollo` ← `tarea/<nombre>`: cada tarea en su rama, con un PR hacia `Desarrollo` que revisa el compañero. Las tareas están en el tablero de Trello "pagina administrador easyhair".

| Rama | Responsable | Qué tiene |
| --- | --- | --- |
| `tarea/configuracion-inicial` | Franco | Proyecto base, layout del panel, cliente de la API y pruebas |
| `tarea/sesion` | Franco | Login, SesionContext, persistencia y cierre de sesión |
| `tarea/reservas` | Franco | Agenda, acciones sobre reservas y bloqueos de horario |
| `tarea/dashboard` | Franco | Dashboard y consumos por revisar |
| `tarea/permisos-rol` | Franco | Menú y botones por rol, página "Sin permisos" y renovación del token |
| `tarea/usuarios` | Franco | Mantenedor de usuarios |
| `tarea/despliegue` | Franco | Docker, Caddy y HTTPS en AWS |
| `tarea/documentacion` | Franco | README, documento de integración y comentarios del código |
| `tarea/servicios` | Luis | Mantenedor de servicios |
| `tarea/peluqueros` | Luis | Mantenedor de peluqueros |
| `tarea/inventario` | Luis | Materiales, stock bajo y compras |
| `tarea/finanzas` | Luis | Finanzas y perfil |
| `tarea/manual-usuario` | Luis | Manual de usuario con pantallazos |

En el backend (`easyhair-backend`), los cambios para la web (rol ADMIN, endpoints de usuarios, renovación del token y permisos por rol) están en la rama `fullstack`, con autorización de la profesora para no tocar `main`.

## Documentos

- [Manual de usuario](docs/manual-usuario.md) (también en Word)
- [Documento de integración](docs/integracion.md) (también en Word)
