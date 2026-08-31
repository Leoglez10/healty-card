# 🏠 Guía de Despliegue Local - Tarjetas Sanas

Sigue estos pasos para correr el proyecto completo (frontend + backend) en tu computadora.

## Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 18 o superior)
- Git

## 1. Configuración Inicial

### Clonar o descargar el proyecto
Si descargaste el ZIP, descomprímelo. Si usas git:
```bash
git clone <url-repo>
cd tarjetas-sanas
```

### Instalar dependencias
Debes instalar las dependencias tanto del **backend** (raíz) como del **frontend** (carpeta client).

```bash
# 1. Instalar dependencias del backend
npm install

# 2. Instalar dependencias del frontend
cd client
npm install
cd ..
```

## 2. Configuración de Entorno

Asegúrate de que el archivo `.env` en la raíz tenga las credenciales correctas:

```env
DATABASE_URL=postgresql://postgres.<TU_PROJECT_REF>:<TU_PASSWORD>@<TU_HOST>.pooler.supabase.com:5432/postgres
PORT=3000
```
> **Nota:** Estas credenciales son de una base de datos de prueba en Supabase. Si usas tu propia BD, actualiza `DATABASE_URL`.

## 3. Ejecutar el Proyecto

Tienes dos opciones: desarrollo o "producción local".

### Opción A: Modo Desarrollo (Recomendado para editar)
Necesitarás dos terminales.

**Terminal 1 (Backend):**
```bash
npm run dev
# Deberías ver: Servidor corriendo en el puerto 3000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# Deberías ver: Local: http://localhost:5173/
```
Abre `http://localhost:5173/` en tu navegador. Vite redirigirá las peticiones a la API (puerto 3000) automáticamente.

### Opción B: Modo Producción Local
Simula cómo correrá en un servidor real.

```bash
# 1. Construir el frontend
cd client
npm run build
cd ..

# 2. Iniciar el servidor (que servirá el frontend construido)
npm start
```
Abre `http://localhost:3000/` en tu navegador.

## 4. Solución de Problemas

- **Error de conexión a BD:** Verifica tu internet y que la `DATABASE_URL` sea correcta.
- **Puertos ocupados:** Si el 3000 está ocupado, cambia `PORT` en `.env` y actualiza `client/vite.config.ts`.
