# 🚀 Backend Tarjetas Sanas - Documentación Completa

> **Servidor Node.js + Express + PostgreSQL para gestión de finanzas familiares**

**Versión:** 1.0  
**Última actualización:** Diciembre 5, 2025

---

## 📋 Índice

1. [Configuración del Ambiente](#configuración-del-ambiente)
2. [Estructura de Directorios](#estructura-de-directorios)
3. [Base de Datos](#base-de-datos)
4. [API REST Completa](#api-rest-completa)
5. [Funcionalidades por Endpoint](#funcionalidades-por-endpoint)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Manejo de Errores](#manejo-de-errores)
8. [Despliegue](#despliegue)

---

## ⚙️ Configuración del Ambiente

### **Variables de Entorno (.env)**

```env
# Base de datos
DATABASE_URL=postgresql://postgres.rhobbnpftrvgynrxazxr:iiMpFZBOXSArNVLF@aws-1-us-east-2.pooler.supabase.com:5432/postgres

# Servidor
PORT=3000

# Opcional (futuro)
NODE_ENV=production
JWT_SECRET=tu_secreto_aqui
```

### **Credenciales de Base de Datos**

| Campo | Valor |
|-------|-------|
| **Host** | aws-1-us-east-2.pooler.supabase.com |
| **Puerto** | 5432 |
| **Usuario** | postgres.rhobbnpftrvgynrxazxr |
| **Contraseña** | iiMpFZBOXSArNVLF |
| **Base de datos** | postgres |
| **Proveedor** | Supabase (AWS) |
| **SSL** | Requerido (rejectUnauthorized: false) |

### **Instalación de Dependencias**

```bash
npm install express cors pg dotenv
```

| Paquete | Versión | Función |
|---------|---------|---------|
| express | 5.2.1 | Framework web |
| cors | Latest | Control de origen |
| pg | Latest | Driver PostgreSQL |
| dotenv | Latest | Variables de entorno |

---

## 📁 Estructura de Directorios

```
tarjetas-sanas/
├── server.js              # Archivo principal del backend
├── package.json           # Dependencias del proyecto
├── .env                   # Variables de entorno (NO en git)
├── .gitignore             # Archivos ignorados por git
├── client/                # Frontend (React)
└── GUIA_BACKEND.md       # Este archivo
```

### **Contenido de server.js**

```javascript
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir frontend compilado
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Conexión a base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ... rutas y endpoints
```

---

## 🗄️ Base de Datos - Esquema Completo

### **Tabla: usuarios**

```sql
CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100),
  telefono VARCHAR(20),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---|------------|
| id_usuario | SERIAL | PRIMARY KEY | ID único auto-incrementado |
| nombre | VARCHAR(100) | NOT NULL, UNIQUE | Nombre único del usuario |
| email | VARCHAR(100) | - | Correo electrónico |
| telefono | VARCHAR(20) | - | Número de teléfono |
| fecha_registro | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

**Usuarios actuales:**
```sql
INSERT INTO usuarios (nombre, email, telefono) VALUES 
  ('Leo', 'leo@email.com', '555-0001'),
  ('Mamá', 'mama@email.com', '555-0002'),
  ('Papá', 'papa@email.com', '555-0003');
```

**IDs:**
- Leo: 1
- Mamá: 2
- Papá: 3

---

### **Tabla: tarjetas**

```sql
CREATE TABLE tarjetas (
  id_tarjeta SERIAL PRIMARY KEY,
  id_usuario INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  banco VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  alias VARCHAR(100),
  ultimos_digitos VARCHAR(4),
  limite_credito DECIMAL(12,2),
  tasa_interes_mensual DECIMAL(5,2),
  fecha_corte INTEGER,
  fecha_pago INTEGER,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|------------|---------|
| id_tarjeta | SERIAL | ID único | 1 |
| id_usuario | INTEGER | Usuario propietario | 1 |
| banco | VARCHAR(100) | Banco emisor | "Santander", "Banco Azteca" |
| tipo | VARCHAR(50) | "crédito" o "débito" | "crédito" |
| alias | VARCHAR(100) | Nombre personalizado | "Visa Oro", "MasterCard" |
| ultimos_digitos | VARCHAR(4) | Últimos 4 dígitos | "4567" |
| limite_credito | DECIMAL(12,2) | Límite disponible | 50000.00 |
| tasa_interes_mensual | DECIMAL(5,2) | Porcentaje mensual | 2.5 |
| fecha_corte | INTEGER | Día del mes 1-31 | 10 |
| fecha_pago | INTEGER | Día del mes 1-31 | 28 |
| fecha_creacion | TIMESTAMP | Fecha de registro | 2025-12-05 |

---

### **Tabla: compras**

```sql
CREATE TABLE compras (
  id_compra SERIAL PRIMARY KEY,
  id_tarjeta INTEGER REFERENCES tarjetas(id_tarjeta) ON DELETE CASCADE,
  descripcion VARCHAR(255) NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  categoria VARCHAR(100),
  fecha DATE DEFAULT CURRENT_DATE,
  es_msi BOOLEAN DEFAULT FALSE,
  meses_msi INTEGER,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|------------|---------|
| id_compra | SERIAL | ID único | 1 |
| id_tarjeta | INTEGER | Tarjeta usada | 1 |
| descripcion | VARCHAR(255) | Qué se compró | "Mercado Soriana" |
| monto | DECIMAL(12,2) | Cantidad | 450.50 |
| categoria | VARCHAR(100) | Categoría gasto | "Comida", "Transporte" |
| fecha | DATE | Fecha de compra | 2025-12-05 |
| es_msi | BOOLEAN | ¿Tiene MSI? | false |
| meses_msi | INTEGER | Meses sin intereses | 3, 6, 12, 18 |
| fecha_creacion | TIMESTAMP | Fecha de registro | 2025-12-05 |

**Categorías permitidas:**
- 🍔 Comida
- 🚗 Transporte
- 🎬 Entretenimiento
- 💡 Servicios
- 🛍️ Compras
- 🏥 Salud
- 📌 Otro

---

### **Tabla: pagos**

```sql
CREATE TABLE pagos (
  id_pago SERIAL PRIMARY KEY,
  id_tarjeta INTEGER REFERENCES tarjetas(id_tarjeta) ON DELETE CASCADE,
  tipo_pago VARCHAR(50),
  monto DECIMAL(12,2) NOT NULL,
  metodo VARCHAR(100),
  notas TEXT,
  fecha DATE DEFAULT CURRENT_DATE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|------------|---------|
| id_pago | SERIAL | ID único | 1 |
| id_tarjeta | INTEGER | Tarjeta pagada | 1 |
| tipo_pago | VARCHAR(50) | Tipo de pago | "total", "mínimo", "parcial" |
| monto | DECIMAL(12,2) | Cantidad abonada | 5000.00 |
| metodo | VARCHAR(100) | Cómo se pagó | "Transferencia", "Efectivo", "App" |
| notas | TEXT | Notas adicionales | "Pago mensual" |
| fecha | DATE | Fecha del pago | 2025-12-05 |
| fecha_creacion | TIMESTAMP | Fecha de registro | 2025-12-05 |

---

### **Tabla: ingresos**

```sql
CREATE TABLE ingresos (
  id_ingreso SERIAL PRIMARY KEY,
  id_usuario INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  fuente VARCHAR(100) NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  fecha DATE DEFAULT CURRENT_DATE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|------------|---------|
| id_ingreso | SERIAL | ID único | 1 |
| id_usuario | INTEGER | Usuario que recibe | 1 |
| fuente | VARCHAR(100) | Origen del dinero | "Sueldo", "Freelance", "Bono" |
| monto | DECIMAL(12,2) | Cantidad recibida | 15000.00 |
| fecha | DATE | Fecha del ingreso | 2025-12-05 |
| fecha_creacion | TIMESTAMP | Fecha de registro | 2025-12-05 |

---

## 📡 API REST Completa

### **Base URL:**
- **Desarrollo:** `http://localhost:3000/api`
- **Producción:** `https://tarjetas-sanas.onrender.com/api`

### **Headers Requeridos:**
```
Content-Type: application/json
```

### **Códigos de Respuesta:**
- `200` - OK
- `201` - Creado exitosamente
- `400` - Error en el cliente
- `500` - Error del servidor

---

## 🔄 Funcionalidades por Endpoint

### **1. USUARIOS**

#### 📍 `GET /api/usuarios`

**Descripción:** Obtiene lista de todos los usuarios

**Parámetros:** Ninguno

**Respuesta (200):**
```json
[
  {
    "id_usuario": 1,
    "nombre": "Leo",
    "email": "leo@email.com",
    "telefono": "555-0001",
    "fecha_registro": "2025-12-01T10:30:00Z"
  },
  {
    "id_usuario": 2,
    "nombre": "Mamá",
    "email": "mama@email.com",
    "telefono": "555-0002",
    "fecha_registro": "2025-12-01T10:30:00Z"
  }
]
```

**Ejemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json"
```

---

#### 📍 `POST /api/usuarios`

**Descripción:** Crea un nuevo usuario

**Body (JSON):**
```json
{
  "nombre": "Papá",
  "email": "papa@email.com",
  "telefono": "555-0003"
}
```

**Respuesta (201):**
```json
{
  "id_usuario": 3,
  "nombre": "Papá",
  "email": "papa@email.com",
  "telefono": "555-0003",
  "fecha_registro": "2025-12-05T14:20:00Z"
}
```

**Validaciones:**
- `nombre` es requerido y único
- `email` es opcional
- `telefono` es opcional

---

### **2. TARJETAS**

#### 📍 `GET /api/tarjetas/:id_usuario`

**Descripción:** Obtiene todas las tarjetas de un usuario

**Parámetros:**
- `id_usuario` (path) - ID del usuario

**Respuesta (200):**
```json
[
  {
    "id_tarjeta": 1,
    "id_usuario": 1,
    "banco": "Santander",
    "tipo": "crédito",
    "alias": "Visa Oro",
    "ultimos_digitos": "4567",
    "limite_credito": 50000.00,
    "tasa_interes_mensual": 2.5,
    "fecha_corte": 10,
    "fecha_pago": 28,
    "fecha_creacion": "2025-12-01T10:30:00Z"
  }
]
```

**Ejemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/tarjetas/1 \
  -H "Content-Type: application/json"
```

---

#### 📍 `POST /api/tarjetas`

**Descripción:** Registra una nueva tarjeta

**Body (JSON):**
```json
{
  "id_usuario": 1,
  "banco": "Banco Azteca",
  "tipo": "crédito",
  "alias": "MasterCard Negra",
  "ultimos_digitos": "8901",
  "limite_credito": 30000,
  "tasa_interes_mensual": 2.8,
  "fecha_corte": 15,
  "fecha_pago": 5
}
```

**Respuesta (201):**
```json
{
  "id_tarjeta": 2,
  "id_usuario": 1,
  "banco": "Banco Azteca",
  "tipo": "crédito",
  "alias": "MasterCard Negra",
  "ultimos_digitos": "8901",
  "limite_credito": 30000.00,
  "tasa_interes_mensual": 2.8,
  "fecha_corte": 15,
  "fecha_pago": 5,
  "fecha_creacion": "2025-12-05T14:20:00Z"
}
```

**Validaciones:**
- `id_usuario` requerido y debe existir
- `banco` requerido
- `tipo` requerido ("crédito" o "débito")
- `limite_credito` requerido (número positivo)
- `tasa_interes_mensual` requerido (0-100)

---

### **3. COMPRAS**

#### 📍 `GET /api/compras/:id_tarjeta`

**Descripción:** Obtiene todas las compras de una tarjeta

**Parámetros:**
- `id_tarjeta` (path) - ID de la tarjeta

**Respuesta (200):**
```json
[
  {
    "id_compra": 1,
    "id_tarjeta": 1,
    "descripcion": "Mercado Soriana",
    "monto": 450.50,
    "categoria": "Comida",
    "fecha": "2025-12-05",
    "es_msi": false,
    "meses_msi": null,
    "fecha_creacion": "2025-12-05T14:20:00Z"
  }
]
```

**Ejemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/compras/1 \
  -H "Content-Type: application/json"
```

---

#### 📍 `POST /api/compras`

**Descripción:** Registra una nueva compra

**Body (JSON):**
```json
{
  "id_tarjeta": 1,
  "descripcion": "Gasolina Pemex",
  "monto": 350.00,
  "categoria": "Transporte",
  "fecha": "2025-12-05",
  "es_msi": false,
  "meses_msi": null
}
```

**Con Meses Sin Intereses:**
```json
{
  "id_tarjeta": 1,
  "descripcion": "Laptop Dell",
  "monto": 8500.00,
  "categoria": "Compras",
  "fecha": "2025-12-05",
  "es_msi": true,
  "meses_msi": 12
}
```

**Respuesta (201):**
```json
{
  "id_compra": 1,
  "id_tarjeta": 1,
  "descripcion": "Gasolina Pemex",
  "monto": 350.00,
  "categoria": "Transporte",
  "fecha": "2025-12-05",
  "es_msi": false,
  "meses_msi": 1,
  "fecha_creacion": "2025-12-05T14:20:00Z"
}
```

**Validaciones:**
- `id_tarjeta` requerido y debe existir
- `descripcion` requerido
- `monto` requerido (>0)
- `categoria` opcional (usa "Otro" si no se proporciona)
- Si no se proporciona `fecha`, usa fecha actual

---

### **4. PAGOS**

#### 📍 `GET /api/pagos/:id_tarjeta`

**Descripción:** Obtiene todos los pagos de una tarjeta

**Parámetros:**
- `id_tarjeta` (path) - ID de la tarjeta

**Respuesta (200):**
```json
[
  {
    "id_pago": 1,
    "id_tarjeta": 1,
    "tipo_pago": "total",
    "monto": 5000.00,
    "metodo": "Transferencia bancaria",
    "notas": "Pago mensual completo",
    "fecha": "2025-12-01",
    "fecha_creacion": "2025-12-01T10:30:00Z"
  }
]
```

**Ejemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/pagos/1 \
  -H "Content-Type: application/json"
```

---

#### 📍 `POST /api/pagos`

**Descripción:** Registra un nuevo pago

**Body (JSON):**
```json
{
  "id_tarjeta": 1,
  "tipo_pago": "parcial",
  "monto": 2500.00,
  "metodo": "Transferencia",
  "notas": "Pago quincenal",
  "fecha": "2025-12-05"
}
```

**Respuesta (201):**
```json
{
  "id_pago": 1,
  "id_tarjeta": 1,
  "tipo_pago": "parcial",
  "monto": 2500.00,
  "metodo": "Transferencia",
  "notas": "Pago quincenal",
  "fecha": "2025-12-05",
  "fecha_creacion": "2025-12-05T14:20:00Z"
}
```

**Tipos de pago:**
- `"total"` - Pago del saldo completo
- `"minimo"` - Pago del mínimo recomendado
- `"parcial"` - Pago parcial

---

### **5. INGRESOS**

#### 📍 `GET /api/ingresos/:id_usuario`

**Descripción:** Obtiene todos los ingresos de un usuario

**Parámetros:**
- `id_usuario` (path) - ID del usuario

**Respuesta (200):**
```json
[
  {
    "id_ingreso": 1,
    "id_usuario": 1,
    "fuente": "Sueldo",
    "monto": 15000.00,
    "fecha": "2025-12-01",
    "fecha_creacion": "2025-12-01T10:30:00Z"
  }
]
```

**Ejemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/ingresos/1 \
  -H "Content-Type: application/json"
```

---

#### 📍 `POST /api/ingresos`

**Descripción:** Registra un nuevo ingreso

**Body (JSON):**
```json
{
  "id_usuario": 1,
  "fuente": "Sueldo",
  "monto": 15000.00,
  "fecha": "2025-12-05"
}
```

**Respuesta (201):**
```json
{
  "id_ingreso": 1,
  "id_usuario": 1,
  "fuente": "Sueldo",
  "monto": 15000.00,
  "fecha": "2025-12-05",
  "fecha_creacion": "2025-12-05T14:20:00Z"
}
```

**Fuentes comunes:**
- "Sueldo"
- "Freelance"
- "Bono"
- "Venta"
- "Comisión"
- "Otro"

---

### **6. ANÁLISIS FINANCIERO**

#### 📍 `GET /api/analisis-financiero/:id_usuario`

**Descripción:** Obtiene análisis completo de situación financiera

**Parámetros:**
- `id_usuario` (path) - ID del usuario

**Respuesta (200):**
```json
{
  "resumen": {
    "total_deuda_mes": 8500.75,
    "uso_credito_global_porcentaje": "17.01"
  },
  "alertas": [
    {
      "nivel": "precaucion",
      "mensaje": "Tu tarjeta Visa Santander ha superado el 30% de uso recomendado (35.5%).",
      "accion": "Intenta pagar el total para no generar intereses."
    }
  ],
  "consejos": [
    "¡Excelente manejo! Tu uso de crédito es bajo, esto mejora tu historial crediticio."
  ]
}
```

**Lógica de análisis:**

| Uso de Crédito | Nivel | Alerta |
|---|---|---|
| <15% | 🟢 Verde | Excelente, mantén el hábito |
| 15-30% | 🟢 Verde | Saludable |
| 30-70% | 🟡 Amarillo | Precaución, considera pagar |
| >70% | 🔴 Rojo | Crítico, deja de usar |

**Ejemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/analisis-financiero/1 \
  -H "Content-Type: application/json"
```

---

### **7. SIMULADOR DE INTERESES**

#### 📍 `POST /api/simular-intereses`

**Descripción:** Calcula intereses estimados sobre una compra

**Body (JSON):**
```json
{
  "monto_compra": 5000,
  "tasa_anual": 25,
  "meses_pago": 12
}
```

**Respuesta (200):**
```json
{
  "interes_mensual_estimado": "104.17",
  "tasa_mensual_aplicada": "2.08%",
  "mensaje": "Tasa moderada, pero recuerda que el interés compuesto crece rápido.",
  "color": "amarillo"
}
```

**Fórmula:**
```
Tasa mensual = (Tasa anual / 100) / 12
Interés primer mes = Monto × Tasa mensual
```

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:3000/api/simular-intereses \
  -H "Content-Type: application/json" \
  -d '{
    "monto_compra": 5000,
    "tasa_anual": 25
  }'
```

---

### **8. SALUD DEL SERVIDOR**

#### 📍 `GET /api/ping`

**Descripción:** Verifica que el servidor esté funcionando

**Respuesta (200):**
```json
{
  "mensaje": "API funcionando correctamente"
}
```

---

## 💡 Ejemplos de Uso Completos

### **Escenario: Leo registra una compra**

**1. Obtener sus tarjetas:**
```bash
GET /api/tarjetas/1

Response:
[
  {
    "id_tarjeta": 1,
    "banco": "Santander",
    "alias": "Visa Oro",
    "limite_credito": 50000,
    ...
  }
]
```

**2. Registrar la compra:**
```bash
POST /api/compras

{
  "id_tarjeta": 1,
  "descripcion": "Mercado Soriana",
  "monto": 450.50,
  "categoria": "Comida",
  "fecha": "2025-12-05"
}

Response 201:
{
  "id_compra": 1,
  "id_tarjeta": 1,
  "descripcion": "Mercado Soriana",
  "monto": 450.50,
  "categoria": "Comida",
  "fecha": "2025-12-05"
}
```

**3. Ver análisis:**
```bash
GET /api/analisis-financiero/1

Response:
{
  "resumen": {
    "total_deuda_mes": 450.50,
    "uso_credito_global_porcentaje": "0.90"
  },
  "alertas": [],
  "consejos": [
    "¡Excelente manejo! Tu uso de crédito es bajo..."
  ]
}
```

---

### **Escenario: Mamá paga su tarjeta**

**1. Registrar pago:**
```bash
POST /api/pagos

{
  "id_tarjeta": 3,
  "tipo_pago": "total",
  "monto": 5000,
  "metodo": "Transferencia",
  "notas": "Pago mensual completo",
  "fecha": "2025-12-05"
}

Response 201:
{
  "id_pago": 1,
  "id_tarjeta": 3,
  "tipo_pago": "total",
  "monto": 5000,
  ...
}
```

**2. Ver compras después del pago:**
```bash
GET /api/compras/3
```

---

## ⚠️ Manejo de Errores

### **Error 400 - Bad Request**

```json
{
  "error": "Faltan datos para la simulación"
}
```

**Causas comunes:**
- Campos requeridos faltantes
- Tipo de dato incorrecto
- ID no existe

---

### **Error 500 - Server Error**

```json
{
  "error": "Error al obtener usuarios"
}
```

**Causas comunes:**
- Problema de conexión a BD
- Query SQL malformada
- Error no capturado en el código

**Logs:**
El servidor registra todos los errores en la consola:
```
Error al registrar pago: Error: duplicate key value violates unique constraint
```

---

## 🔒 Manejo de Conexión a BD

### **Pool de Conexiones**

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // Necesario para Supabase
});

// Manejo de errores del pool
pool.on('error', (err) => {
  console.error('Error inesperado en el pool:', err);
});
```

### **Reconexión automática**
El pool maneja automáticamente:
- Reconexión si se pierde la conexión
- Reutilización de conexiones
- Timeout si no hay disponibilidad

---

## 🚀 Despliegue

### **Render.com**

**1. Conectar GitHub:**
```
Settings → Repository → Connect GitHub
Seleccionar: Leoglez10/tarjetas-sanas
```

**2. Crear servicio web:**
```
Build Command: npm run build
Start Command: npm start
Environment: Node
```

**3. Variables de entorno en Render:**
```
DATABASE_URL=postgresql://postgres.rhobbnpftrvgynrxazxr:iiMpFZBOXSArNVLF@aws-1-us-east-2.pooler.supabase.com:5432/postgres
PORT=3000
NODE_ENV=production
```

**4. URL en vivo:**
```
https://tarjetas-sanas.onrender.com/api
```

---

### **Ejecución Local**

```bash
# Instalar dependencias
npm install

# Crear .env con credenciales
echo "DATABASE_URL=postgresql://..." > .env
echo "PORT=3000" >> .env

# Ejecutar
npm start

# O con nodemon (desarrollo)
npm install -D nodemon
npm run dev
```

---

## 📊 Estadísticas del Backend

| Métrica | Valor |
|---------|-------|
| Líneas de código | ~320 |
| Endpoints | 15+ |
| Tablas de BD | 5 |
| Funciones principales | 8 |
| Conectores BD | 1 (Pool) |
| Middleware | 3 (cors, json, static) |

---

## 🔍 Debugging

### **Verificar conexión a BD:**
```bash
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://...',
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? 'ERROR: ' + err : 'OK: ' + res.rows[0]);
  process.exit();
});
"
```

### **Probar endpoints:**
```bash
# En Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/usuarios" | Select-Object StatusCode, Content

# En Linux/Mac
curl http://localhost:3000/api/usuarios
```

---

## 📝 Notas Importantes

1. **Sin Autenticación:** Actualmente cualquiera puede acceder a todos los datos. Para producción real, agregar JWT o Supabase Auth.

2. **CORS Habilitado:** La API acepta peticiones desde cualquier origen. En producción, restringir a dominios conocidos.

3. **SSL Requerido:** La conexión a Supabase usa SSL (rejectUnauthorized: false por testing).

4. **Frontend Servido:** El backend sirve también el frontend compilado desde `client/dist/`.

---

## 🎯 Próximas Mejoras

- [ ] Implementar JWT para autenticación
- [ ] Rate limiting (máx 100 req/min por IP)
- [ ] Validación de inputs con Joi
- [ ] Logging avanzado con Winston
- [ ] Tests unitarios con Jest
- [ ] Documentación con Swagger/OpenAPI
- [ ] Caché con Redis
- [ ] Webhooks para notificaciones

---

**Desarrollador:** Leo Glez  
**Fecha:** Diciembre 5, 2025  
**Versión:** 1.0 - MVP Funcional ✅
