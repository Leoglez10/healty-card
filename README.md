<div align="center">

# Tarjetas Sanas

### Aplicación web familiar para llevar el control de tarjetas de crédito y débito, ver cuánto se debe y evitar el sobreendeudamiento

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)

</div>

> Este README sirve tanto para quien solo quiere entender y usar la aplicación como para quien va a modificar el código.
> Si solo quieres ejecutarla, ve a [Instalación y ejecución](#instalación-y-ejecución).
> Si vas a tocar el código, ve a [Arquitectura](#arquitectura) y [Estructura del proyecto](#estructura-del-proyecto).

> ⚠️ **Aviso de seguridad antes de usar este repositorio**
> Las guías `GUIA_BACKEND.md`, `DEPLOY_LOCAL.md` y `DEPLOY_SERVER.md` incluyen una cadena de conexión de PostgreSQL con usuario y contraseña reales.
> Esa credencial debe considerarse comprometida y rotarse en Supabase. Ver [Seguridad](#seguridad).

---

## Índice

- [Qué es](#qué-es)
- [Relación con el repositorio tarjetas-sanas](#relación-con-el-repositorio-tarjetas-sanas)
- [Para quién es](#para-quién-es)
- [Qué hace hoy](#qué-hace-hoy)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [API](#api)
- [Reglas de negocio implementadas](#reglas-de-negocio-implementadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Cómo se usa la aplicación](#cómo-se-usa-la-aplicación)
- [Limitaciones conocidas](#limitaciones-conocidas)
- [Seguridad](#seguridad)
- [Solución de problemas](#solución-de-problemas)
- [Documentación relacionada](#documentación-relacionada)
- [Licencia](#licencia)
- [Autor](#autor)

---

## Qué es

**Tarjetas Sanas** es una aplicación web pensada para una familia que comparte varias tarjetas bancarias y quiere responder tres preguntas sencillas:

1. ¿Cuánto debemos en cada tarjeta?
2. ¿En qué se nos está yendo el dinero este mes?
3. ¿Estamos usando demasiado el crédito disponible?

La aplicación registra usuarios, tarjetas, compras, pagos e ingresos, y calcula un análisis financiero con un **semáforo por tarjeta** (verde, amarillo, rojo) según el porcentaje del límite de crédito utilizado.

No es una aplicación bancaria: no se conecta con ningún banco. Todos los datos se capturan manualmente y se guardan en una base de datos PostgreSQL propia.

---

## Relación con el repositorio tarjetas-sanas

Este repositorio y [`Leoglez10/tarjetas-sanas`](https://github.com/Leoglez10/tarjetas-sanas) son **dos implementaciones del mismo producto**, no dos proyectos distintos. Vale la pena saberlo antes de compararlos.

| | `tarjetas-sanas` | `healty-card` (este repositorio) |
|---|---|---|
| Primer commit | 5 dic 2025, 22:55 | 5 dic 2025, 23:49 |
| Cliente | JavaScript (JSX) | **TypeScript (TSX)** |
| Navegación | React Router 7 | Estado local con pestañas |
| Vite / Express | Vite 7 / Express 5 | Vite 6 / Express 4 |
| Estilos | Tailwind CSS v4 vía plugin de Vite | Tailwind desde CDN |
| API | Solo lectura y alta (`GET` / `POST`) | Alta, edición y borrado (`GET` / `POST` / `PUT` / `DELETE`) |
| Base del análisis | Tabla `ingresos` del mes en curso | Campo `presupuesto_mensual` del usuario |
| Extras del backend | Proyección de deuda, presupuesto, historial de 12 meses | Presupuesto editable desde el dashboard |
| Documentación | Seis guías extensas | Tres guías de backend y despliegue |

En resumen: **`healty-card` es la reescritura posterior**, con el cliente tipado en TypeScript y una API más completa (edición y borrado). `tarjetas-sanas` es la versión original en JavaScript y conserva la documentación más detallada del dominio y de la base de datos.

---

## Para quién es

| Rol | Qué puede hacer |
|---|---|
| Integrante de la familia | Registrar sus tarjetas, compras, pagos e ingresos; ver su dashboard y su semáforo |
| Persona que administra la app | Configurar la base de datos, desplegar el servidor y mantener las variables de entorno |
| Desarrollador | Levantar el proyecto en local, ampliar la API o el cliente |

> ⚠️ La aplicación **no tiene autenticación**. Cualquier persona que abra la URL ve y modifica los datos de todos los usuarios. Ver [Limitaciones conocidas](#limitaciones-conocidas).

---

## Qué hace hoy

Funcionalidades verificadas en el código:

- ✅ Selección del usuario activo desde el dashboard (sin contraseña).
- ✅ Alta de tarjetas de **crédito** y **débito** con banco, alias, últimos 4 dígitos, límite, tasa de interés mensual y días de corte y pago.
- ✅ Registro de compras con categoría (Comida, Transporte, Entretenimiento, Servicios, Compras, Salud, Otro) y marca de meses sin intereses.
- ✅ Registro de pagos a tarjeta con tipo (total, mínimo, parcial), método y notas.
- ✅ Registro de ingresos por fuente.
- ✅ Presupuesto mensual por usuario, editable desde el dashboard.
- ✅ Análisis financiero: deuda total, crédito disponible, saldo del mes, gasto por categoría y recomendaciones automáticas.
- ✅ Semáforo por tarjeta según el porcentaje del límite usado.
- ✅ Gráficas de deuda por tarjeta y de gasto por categoría (Recharts).
- ✅ Bloqueo de pagos que excedan el saldo disponible del mes.
- 🧪 Simulador de intereses (`POST /api/simular-intereses`): existe en la API y en `services/data.ts`, pero **ninguna pantalla lo usa todavía**.
- 🧪 Edición y borrado de tarjetas, compras, pagos e ingresos: la API los soporta y el cliente tiene las funciones listas, pero **la interfaz aún no expone los botones**.

---

## Arquitectura

El repositorio contiene **dos aplicaciones Node.js separadas** que se ejecutan juntas:

```text
Navegador
   │
   ▼
client/  ← React 19 + TypeScript + Vite   (interfaz)
   │  fetch a /api/...
   ▼
server.js  ← Express 4                     (API REST)
   │  db.js → pool de conexiones
   ▼
PostgreSQL                                 (datos)
```

- La **raíz del repositorio es el backend**: `package.json` (nombre interno `tarjetas-sanas-backend`), `server.js` y `db.js`.
- La carpeta **`client/` es el frontend**, con su propio `package.json` y sus propias dependencias.

Cómo se comunican, según el modo de ejecución:

| Modo | Frontend | Backend | Cómo llegan las peticiones a la API |
|---|---|---|---|
| Desarrollo | Servidor de Vite en `http://localhost:5173` | `http://localhost:3000` | El proxy de `client/vite.config.ts` reenvía `/api` al puerto 3000 |
| Producción | Compilado en `client/dist/` | `http://localhost:3000` | Express sirve `client/dist` como estático y responde `/api` en el mismo puerto |

En producción hay **un solo puerto**: `server.js` sirve tanto la interfaz compilada como la API, con un `catch-all` que devuelve `client/dist/index.html` para las rutas que no son de la API.

---

## Requisitos

- **Node.js 18 o superior** (el backend usa `node --watch`, disponible desde Node 18).
- **npm** (el repositorio incluye `package-lock.json` en la raíz y en `client/`).
- Una **base de datos PostgreSQL** accesible por cadena de conexión, con las tablas descritas en [Base de datos](#base-de-datos).

---

## Instalación y ejecución

```bash
git clone https://github.com/Leoglez10/healty-card.git
cd healty-card
```

### 1. Instalar dependencias

```bash
npm install              # backend (raíz)
npm run install-client   # frontend (equivale a: npm install --prefix client)
```

### 2. Crear el archivo `.env` en la raíz

```env
DATABASE_URL=postgresql://usuario:contraseña@host:5432/nombre_bd
PORT=3000
```

`.env` está en `.gitignore` y no debe subirse al repositorio.

### 3. Modo desarrollo (dos terminales)

```bash
# Terminal 1 — API con recarga automática
npm run dev

# Terminal 2 — interfaz
npm run client
```

Abre `http://localhost:5173`. El proxy de Vite envía las llamadas `/api` al puerto 3000.

### 4. Modo producción local (un solo puerto)

```bash
npm run build --prefix client   # genera client/dist
npm start                       # sirve API + interfaz en el puerto 3000
```

Abre `http://localhost:3000`.

> ⚠️ Si ejecutas `npm start` sin haber compilado el cliente, la API responderá, pero la ruta `/` fallará porque `client/dist/index.html` no existe.

### Scripts disponibles

| Script | Dónde | Qué hace |
|---|---|---|
| `npm start` | raíz | `node server.js` — API y frontend compilado |
| `npm run dev` | raíz | `node --watch server.js` — API con reinicio al guardar |
| `npm run client` | raíz | Atajo a `npm run dev --prefix client` |
| `npm run install-client` | raíz | Instala las dependencias de `client/` |
| `npm run dev` | `client/` | Servidor de desarrollo de Vite (puerto 5173) |
| `npm run build` | `client/` | Compila la interfaz en `client/dist` |
| `npm run preview` | `client/` | Previsualiza el build de Vite |

> El proyecto **no tiene tests, linter ni chequeo de tipos configurado como script**. Para revisar tipos manualmente: `npx tsc --noEmit` dentro de `client/`.

---

## Variables de entorno

Se leen con `dotenv` desde el `.env` de la raíz. No existe `.env.example` en el repositorio.

| Variable | Obligatoria | Dónde se usa | Descripción |
|---|---|---|---|
| `DATABASE_URL` | Sí | `db.js` | Cadena de conexión a PostgreSQL. El pool se abre con `ssl: { rejectUnauthorized: false }` |
| `PORT` | No | `server.js` | Puerto del servidor Express. Por defecto `3000` |

El cliente lee opcionalmente `GEMINI_API_KEY` en `client/vite.config.ts`, pero **ningún archivo del código usa esa clave**: es un resto del andamiaje original de Google AI Studio y puede ignorarse.

> Nunca publiques valores reales de estas variables en el repositorio ni en la documentación.

---

## Base de datos

PostgreSQL, con cinco tablas. El repositorio **no incluye migraciones ni un archivo `.sql`**: el esquema hay que crearlo a mano.

Columnas verificadas en las consultas de `server.js`:

| Tabla | Columnas usadas por el código |
|---|---|
| `usuarios` | `id_usuario`, `nombre`, `email`, `telefono`, `presupuesto_mensual` |
| `tarjetas` | `id_tarjeta`, `id_usuario`, `banco`, `tipo`, `alias`, `ultimos4`, `limite_credito`, `tasa_interes_mensual`, `fecha_corte_dia`, `fecha_pago_dia` |
| `compras` | `id_compra`, `id_tarjeta`, `descripcion`, `monto`, `categoria`, `fecha`, `es_msi`, `meses_msi` |
| `pagos` | `id_pago`, `id_tarjeta`, `tipo_pago`, `monto`, `metodo`, `notas`, `fecha` |
| `ingresos` | `id_ingreso`, `id_usuario`, `fuente`, `monto`, `fecha` |

El campo `tipo` de `tarjetas` distingue `'crédito'` de `'débito'` (con tilde), y el análisis financiero depende de ese valor exacto.

> ⚠️ **El esquema SQL de `GUIA_BACKEND.md` está desactualizado.** Ese documento define `ultimos_digitos`, `fecha_corte` y `fecha_pago`, y no incluye `presupuesto_mensual` en `usuarios`. El código actual usa `ultimos4`, `fecha_corte_dia`, `fecha_pago_dia` y sí necesita `presupuesto_mensual`. Si creas la base de datos, sigue los nombres de esta tabla, no los de la guía.

### Dónde viven los datos y cómo respaldarlos

Todos los datos están en la base PostgreSQL remota indicada por `DATABASE_URL`; la aplicación no guarda nada en el equipo del usuario y no incluye ninguna función de backup o restauración. Los respaldos dependen del proveedor de la base de datos (por ejemplo, los backups automáticos de Supabase) o de `pg_dump` ejecutado por fuera del proyecto.

---

## API

Base: `/api`. Todas las respuestas son JSON. No hay autenticación ni cabeceras obligatorias más allá de `Content-Type: application/json` en las peticiones con cuerpo.

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/ping` | Comprobación de que el servidor responde |
| `GET` | `/api/usuarios` | Lista de usuarios |
| `POST` | `/api/usuarios` | Crea un usuario (`presupuesto_mensual` inicia en 0) |
| `PUT` | `/api/usuarios/:id_usuario/presupuesto` | Actualiza el presupuesto mensual |
| `GET` | `/api/tarjetas/:id_usuario` | Tarjetas de un usuario |
| `POST` | `/api/tarjetas` | Crea una tarjeta |
| `PUT` | `/api/tarjetas/:id_tarjeta` | Actualiza una tarjeta |
| `DELETE` | `/api/tarjetas/:id_tarjeta` | Elimina una tarjeta |
| `GET` | `/api/compras/:id_tarjeta` | Compras de una tarjeta |
| `POST` | `/api/compras` | Registra una compra |
| `PUT` | `/api/compras/:id_compra` | Actualiza una compra |
| `DELETE` | `/api/compras/:id_compra` | Elimina una compra |
| `GET` | `/api/pagos/:id_tarjeta` | Pagos de una tarjeta |
| `POST` | `/api/pagos` | Registra un pago, validando saldo disponible |
| `PUT` | `/api/pagos/:id_pago` | Actualiza un pago |
| `DELETE` | `/api/pagos/:id_pago` | Elimina un pago |
| `GET` | `/api/ingresos/:id_usuario` | Ingresos de un usuario |
| `POST` | `/api/ingresos` | Registra un ingreso |
| `PUT` | `/api/ingresos/:id_ingreso` | Actualiza un ingreso |
| `DELETE` | `/api/ingresos/:id_ingreso` | Elimina un ingreso |
| `GET` | `/api/analisis-financiero/:id_usuario` | Análisis completo del usuario |
| `POST` | `/api/simular-intereses` | Interés estimado del primer mes de una compra |

Ejemplo:

```bash
curl http://localhost:3000/api/ping
# {"mensaje":"API funcionando correctamente"}
```

Códigos de respuesta usados: `200`, `201`, `400` (datos faltantes o fondos insuficientes), `404` (recurso inexistente), `500` (error del servidor).

> ⚠️ La respuesta de `/api/analisis-financiero/:id_usuario` documentada en `GUIA_BACKEND.md` (con claves `resumen`, `alertas`, `consejos`) **no corresponde al código actual**, que devuelve `deuda_total`, `disponible_total`, `tarjetas`, `gastos_por_categoria`, `saldo_neto` y `recomendaciones`. La forma real está tipada en `client/types.ts`, en la interfaz `AnalisisFinanciero`.

---

## Reglas de negocio implementadas

Todas viven en `server.js` y se calculan al vuelo; no hay tablas de resultados.

**Deuda por tarjeta de crédito**
`deuda = suma de compras − suma de pagos`, con mínimo 0 (un saldo a favor no cuenta como deuda negativa). Las tarjetas de débito siempre reportan deuda 0.

**Semáforo por tarjeta**

| Uso del límite | Estado |
|---|---|
| Hasta 30 % | 🟢 verde |
| Más de 30 % y hasta 70 % | 🟡 amarillo |
| Más de 70 % | 🔴 rojo |

**Saldo disponible del mes**
`presupuesto_mensual − compras hechas con tarjetas de débito − pagos registrados a tarjetas`.

**Validación al registrar un pago**
Si el monto del pago supera ese saldo disponible, la API responde `400` con `error: "Fondos insuficientes"` y el detalle del saldo. El cliente muestra ese mensaje al usuario.

**Interés estimado mensual**
El análisis lo calcula como `deuda_total × 0.025`, es decir, una tasa fija del 2.5 % mensual, **sin usar la `tasa_interes_mensual` guardada en cada tarjeta**. El simulador (`/api/simular-intereses`) sí trabaja con la tasa anual que se le envía, dividida entre 12.

Estos cálculos son orientativos y deliberadamente simplificados: no consideran fechas de corte, meses sin intereses ni interés compuesto real.

---

## Estructura del proyecto

```text
healty-card/
├── server.js              ← ⭐ API REST completa (Express) y servidor de estáticos
├── db.js                  ← Pool de conexiones a PostgreSQL
├── package.json           ← Dependencias y scripts del BACKEND
├── client/                ← Aplicación de frontend (proyecto npm independiente)
│   ├── package.json       ← Dependencias y scripts del FRONTEND
│   ├── vite.config.ts     ← Puerto 5173 y proxy /api → localhost:3000
│   ├── index.html         ← Carga Tailwind desde CDN
│   ├── index.tsx          ← Punto de entrada de React
│   ├── App.tsx            ← Carga los usuarios y controla las pestañas
│   ├── types.ts           ← ⭐ Contrato de datos compartido con la API
│   ├── services/data.ts   ← ⭐ Cliente HTTP y utilidades de formato
│   ├── components/
│   │   └── Layout.tsx     ← Barra lateral y navegación
│   └── pages/
│       ├── Dashboard.tsx  ← Resumen, semáforo, gráficas y presupuesto
│       ├── Cards.tsx      ← Alta y listado de tarjetas
│       └── Movements.tsx  ← Compras, pagos e ingresos
├── GUIA_BACKEND.md        ← Guía extensa del backend (ver advertencias)
├── DEPLOY_LOCAL.md        ← Ejecución local
└── DEPLOY_SERVER.md       ← Despliegue en Render o Railway
```

> 💡 Regla rápida:
> - Pantallas → `client/pages/`
> - Llamadas a la API y formatos → `client/services/data.ts`
> - Tipos compartidos → `client/types.ts`
> - Endpoints y reglas de negocio → `server.js`
> - Conexión a la base de datos → `db.js`

---

## Cómo se usa la aplicación

**Elegir de quién son los datos.** El dashboard incluye un selector con los usuarios existentes. No hay contraseña: se elige un nombre y se trabaja con sus datos.

**Registrar una tarjeta.** Pestaña *Tarjetas* → *Agregar tarjeta*. Se pide banco, alias, tipo (crédito o débito), últimos 4 dígitos, límite, tasa de interés mensual y los días del mes de corte y de pago.

**Registrar una compra.** Pestaña *Movimientos*, sección *Compras*. Se elige la tarjeta, el monto, la categoría y, si aplica, los meses sin intereses.

**Registrar un pago.** Pestaña *Movimientos*, sección *Pagos*. Si el monto supera el saldo disponible del mes, la aplicación lo rechaza y explica cuánto queda.

**Ajustar el presupuesto.** En el dashboard, el botón *Editar* sobre la tarjeta de ingresos actualiza `presupuesto_mensual`, que es la base de todo el cálculo de saldo.

**Interpretar el semáforo.** Verde significa uso saludable del crédito; amarillo, precaución; rojo, riesgo de sobreendeudamiento. El panel de recomendaciones traduce esos estados a acciones concretas.

---

## Limitaciones conocidas

- **Sin autenticación ni autorización.** Cualquiera con acceso a la URL puede leer y modificar los datos de toda la familia. El botón "Cerrar sesión" de la barra lateral es decorativo: no hace nada.
- **CORS completamente abierto** (`app.use(cors())`), sin restricción de origen.
- **Sin migraciones.** El esquema de la base de datos hay que crearlo manualmente y mantenerlo sincronizado a mano.
- **Sin tests, sin linter y sin CI.** No existe carpeta `.github/workflows`.
- **La interfaz no permite editar ni borrar** registros, aunque la API sí lo soporte.
- **La tabla `ingresos` no alimenta el análisis.** El dashboard se basa exclusivamente en `presupuesto_mensual`; los ingresos se registran pero no cambian los totales.
- **El interés estimado usa una tasa fija del 2.5 %**, no la tasa real de cada tarjeta.
- **Cálculos simplificados**: no se modelan fechas de corte, pagos mínimos reales, meses sin intereses ni interés compuesto.
- **`client/index.html` enlaza `/index.css`, un archivo que no existe** en el repositorio. No rompe la aplicación (los estilos vienen de Tailwind por CDN), pero genera un 404 en el navegador.
- **Tailwind y las librerías de React se cargan desde CDN** (`cdn.tailwindcss.com` y `aistudiocdn.com`) mediante un `importmap`, por lo que la interfaz necesita conexión a internet aunque el servidor sea local.
- **Sin capturas de pantalla** en el repositorio *(pendiente)*.

---

## Seguridad

> ⚠️ **Credenciales expuestas en el historial del repositorio**
>
> `GUIA_BACKEND.md`, `DEPLOY_LOCAL.md` y `DEPLOY_SERVER.md` contienen una cadena de conexión completa a una base de datos PostgreSQL de Supabase, con usuario y contraseña legibles. Aunque se describa como base de pruebas, es una credencial real y está publicada.
>
> Acciones recomendadas:
> 1. Rotar la contraseña de la base de datos en Supabase.
> 2. Sustituir esos valores por marcadores de posición en las tres guías.
> 3. Considerar limpiar el historial de Git (por ejemplo, con `git filter-repo`), ya que la credencial sigue siendo accesible en commits anteriores.
> 4. Añadir un `.env.example` con marcadores en lugar de valores reales.

Otros puntos a tener en cuenta antes de exponer esta aplicación en internet:

- No hay autenticación: **cualquier visitante tiene acceso total de lectura y escritura** a datos financieros familiares.
- No hay validación de entradas ni límite de peticiones.
- La conexión a PostgreSQL usa `ssl: { rejectUnauthorized: false }`, que cifra el tráfico pero **no verifica el certificado del servidor**.
- `cors()` sin opciones acepta peticiones de cualquier origen.

El archivo `.env` está correctamente ignorado por Git y no hay ningún `.env` versionado en el repositorio.

---

## Solución de problemas

| Problema | Causa probable | Qué hacer |
|---|---|---|
| El servidor arranca pero toda petición devuelve error 500 | `DATABASE_URL` ausente o incorrecta, o la base no acepta la conexión | Revisar el `.env` y probar `GET /api/ping` (no toca la base) frente a `GET /api/usuarios` (sí la toca) |
| La app muestra "No hay usuarios disponibles" | La tabla `usuarios` está vacía | Crear un usuario con `POST /api/usuarios` |
| Error `column ... does not exist` | El esquema sigue los nombres antiguos de `GUIA_BACKEND.md` | Usar los nombres de columna de la sección [Base de datos](#base-de-datos) |
| En `http://localhost:5173` las llamadas a `/api` fallan | El backend no está corriendo o cambió de puerto | Levantar `npm run dev` y verificar que `target` en `client/vite.config.ts` apunte al puerto correcto |
| `npm start` devuelve error al abrir `/` | Falta compilar el frontend | Ejecutar `npm run build --prefix client` |
| Al registrar un pago aparece "Fondos insuficientes" | El monto supera el saldo disponible del mes | Aumentar el presupuesto mensual o registrar un monto menor |
| El puerto 3000 está ocupado | Otro proceso lo está usando | Cambiar `PORT` en `.env` y actualizar el `target` del proxy en `client/vite.config.ts` |

---

## Documentación relacionada

| Documento | Contenido | Estado |
|---|---|---|
| [`DEPLOY_LOCAL.md`](DEPLOY_LOCAL.md) | Ejecución local paso a paso | Vigente, salvo la credencial expuesta |
| [`DEPLOY_SERVER.md`](DEPLOY_SERVER.md) | Despliegue en Render y Railway | Vigente, salvo la credencial expuesta |
| [`GUIA_BACKEND.md`](GUIA_BACKEND.md) | Guía extensa del backend, esquema SQL y ejemplos | Parcialmente desactualizada: nombres de columnas y respuesta del análisis financiero |
| [`client/README.md`](client/README.md) | Plantilla original de Google AI Studio | Histórico; no describe este proyecto |

Documentación adicional del mismo producto, en la versión JavaScript: [`Leoglez10/tarjetas-sanas`](https://github.com/Leoglez10/tarjetas-sanas) incluye `DOCUMENTACION_COMPLETA.md`, `GUIA_TECNICA.md`, `GUIA_USUARIO.md` y `SISTEMA_INTELIGENTE.md`.

---

## Licencia

El repositorio **no incluye un archivo `LICENSE`**. El campo `license` del `package.json` de la raíz declara `ISC`, pero sin archivo de licencia esa declaración no tiene efecto práctico. Proyecto personal y de uso familiar.

---

## Autor

<div align="center">

### Desarrollado por **Leonardo González**

[![GitHub](https://img.shields.io/badge/GitHub-Leoglez10-181717?logo=github&logoColor=white)](https://github.com/Leoglez10)

[Reportar un problema](https://github.com/Leoglez10/healty-card/issues)

</div>
