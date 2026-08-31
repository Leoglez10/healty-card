# 🚀 Guía de Despliegue en Servidor (Render/Vercel/Railway)

Esta guía explica cómo desplegar "Tarjetas Sanas" en **Render**, una plataforma gratuita y fácil de usar para proyectos Node.js.

## Preparación del Proyecto
Asegúrate de que tu estructura de archivos sea así (ya debería serlo si seguiste la guía de implementación):
```
/ (raíz)
├── server.js
├── package.json (Backend)
└── client/
    ├── vite.config.ts
    ├── package.json (Frontend)
    └── ...
```

## Opción 1: Despliegue en Render (Recomendado)

### 1. Crear un Web Service
1. Crea una cuenta en [render.com](https://render.com/).
2. Haz clic en **"New +"** -> **"Web Service"**.
3. Conecta tu repositorio de GitHub/GitLab.

### 2. Configuración del Servicio
Llena el formulario con estos datos:

| Campo | Valor |
|-------|-------|
| **Name** | tarjetas-sanas (o el que gustes) |
| **Region** | La más cercana a ti (ej. Ohio, Frankfurt) |
| **Branch** | main / master |
| **Root Directory** | `.` (déjalo vacío o punto) |
| **Runtime** | Node |
| **Build Command** | `npm install && cd client && npm install && npm run build` |
| **Start Command** | `npm start` |

> **Explicación:** El comando de build instala dependencias tanto del back como del front, y compila el front. El start command inicia el servidor Express.

### 3. Variables de Entorno
En la sección "Environment Variables", agrega:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres.<TU_PROJECT_REF>:<TU_PASSWORD>@<TU_HOST>.pooler.supabase.com:5432/postgres` |
| `NODE_VERSION` | `18` (opcional, para asegurar compatibilidad) |

### 4. Desplegar
Haz clic en **"Create Web Service"**. Render empezará a construir tu proyecto. Tarda unos minutos.
Cuando termine, te dará una URL (ej. `https://tarjetas-sanas.onrender.com`).
¡Tu app está en vivo! 🎉

---

## Opción 2: Railway (Alternativa)

1. Crea cuenta en [railway.app](https://railway.app/).
2. "New Project" -> "Deploy from GitHub repo".
3. En Configuración (Settings) -> **Build Command**: `npm install && cd client && npm install && npm run build`.
4. **Start Command**: `npm start`.
5. Agrega la variable `DATABASE_URL` en la pestaña Variables.

---

## Notas Importantes

- **Base de Datos:** Estamos usando una base de datos externa (Supabase). Asegúrate de que permita conexiones desde cualquier IP (`0.0.0.0/0`) o configura las IPs de Render si es necesario (generalmente Supabase acepta conexiones seguras con contraseña).
- **CORS:** El backend tiene `cors()` habilitado, lo cual es permisivo. Para mayor seguridad en producción, puedes configurarlo para aceptar solo tu dominio:
  ```javascript
  // server.js
  app.use(cors({ origin: 'https://tu-app.onrender.com' }));
  ```
