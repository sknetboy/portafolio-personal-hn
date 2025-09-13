# Portfolio Backend API

Backend API para el portfolio de José Luis Castro, construido con Node.js, Express y PostgreSQL.

## 🚀 Características

- **API RESTful** completa para proyectos y contactos
- **Autenticación JWT** con refresh tokens
- **Base de datos PostgreSQL** con Prisma ORM
- **Validación de datos** con express-validator
- **Seguridad** con helmet, cors y rate limiting
- **Logging** estructurado con Morgan
- **Documentación** de API integrada

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 13+
- npm o pnpm

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Servidor
PORT=3001
NODE_ENV=development

# Base de datos PostgreSQL
DATASE_URL="postgresql://usuario:contraseña@localhost:5432/portfolio_db"

# JWT
JWT_SECRET="tu-jwt-secret-muy-seguro"
JWT_REFRESH_SECRET="tu-refresh-secret-muy-seguro"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Admin por defecto
DEFAULT_ADMIN_EMAIL="admin@joseluiscastro.dev"
DEFAULT_ADMIN_PASSWORD="admin123"
```

### 3. Configurar base de datos

Ejecuta el script de inicialización:

```bash
npm run init-db -- --seed
```

Este comando:
- Instala Prisma CLI si no está disponible
- Genera el cliente Prisma
- Ejecuta las migraciones
- Verifica la conexión
- Siembra datos de ejemplo (con --seed)

## 🏃‍♂️ Ejecución

### Desarrollo

```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:3001`

### Producción

```bash
npm start
```

## 📚 API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Registrar usuario | Público |
| POST | `/api/auth/login` | Iniciar sesión | Público |
| POST | `/api/auth/refresh` | Renovar token | Público |
| POST | `/api/auth/logout` | Cerrar sesión | Privado |
| GET | `/api/auth/me` | Obtener perfil | Privado |

### Proyectos

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/api/projects` | Listar proyectos | Público |
| GET | `/api/projects/featured` | Proyectos destacados | Público |
| GET | `/api/projects/:id` | Obtener proyecto | Público |
| POST | `/api/projects` | Crear proyecto | Admin |
| PUT | `/api/projects/:id` | Actualizar proyecto | Admin |
| DELETE | `/api/projects/:id` | Eliminar proyecto | Admin |
| PATCH | `/api/projects/:id/toggle-featured` | Alternar destacado | Admin |

### Contactos

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| POST | `/api/contacts` | Enviar mensaje | Público |
| GET | `/api/contacts` | Listar mensajes | Admin |
| GET | `/api/contacts/:id` | Obtener mensaje | Admin |
| PUT | `/api/contacts/:id` | Actualizar mensaje | Admin |
| DELETE | `/api/contacts/:id` | Eliminar mensaje | Admin |
| PATCH | `/api/contacts/:id/status` | Cambiar estado | Admin |

### Sistema

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/api/health` | Estado del sistema | Público |

## 🔐 Autenticación

La API utiliza JWT con refresh tokens:

1. **Login**: Obtén access token y refresh token
2. **Requests**: Incluye `Authorization: Bearer <access_token>`
3. **Renovación**: Usa refresh token cuando expire el access token

### Ejemplo de uso

```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { accessToken, refreshToken } = await response.json();

// Usar token en requests
const projectsResponse = await fetch('/api/projects', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

## 🗄️ Estructura de Base de Datos

### Modelos principales

- **User**: Usuarios del sistema (admin)
- **Project**: Proyectos del portfolio
- **Contact**: Mensajes de contacto
- **RefreshToken**: Tokens de renovación

### Relaciones

- Un usuario puede tener múltiples proyectos
- Un usuario puede tener múltiples refresh tokens
- Los contactos son independientes

## 🛡️ Seguridad

- **Rate Limiting**: 100 requests por 15 minutos
- **CORS**: Configurado para el frontend
- **Helmet**: Headers de seguridad
- **Validación**: Todos los inputs validados
- **Sanitización**: Prevención de XSS
- **JWT**: Tokens seguros con expiración

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor con hot reload
npm run dev:debug    # Servidor con debugging

# Producción
npm start            # Servidor de producción
npm run build        # Preparar para producción

# Base de datos
npm run init-db      # Inicializar BD
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Sembrar datos
npm run db:reset     # Resetear BD (desarrollo)
npm run db:studio    # Abrir Prisma Studio

# Utilidades
npm run lint         # Verificar código
npm run lint:fix     # Corregir código
npm test             # Ejecutar tests
npm run clean        # Limpiar archivos generados
```

## 🔧 Comandos de Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Sincronizar esquema (desarrollo)
npx prisma db push

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones (producción)
npx prisma migrate deploy

# Abrir Prisma Studio
npx prisma studio

# Resetear base de datos
npx prisma migrate reset
```

## 🌍 Variables de Entorno

### Servidor
- `PORT`: Puerto del servidor (default: 3001)
- `NODE_ENV`: Entorno (development/production)

### Base de Datos
- `DATABASE_URL`: URL de conexión PostgreSQL

### JWT
- `JWT_SECRET`: Secreto para access tokens
- `JWT_REFRESH_SECRET`: Secreto para refresh tokens
- `JWT_EXPIRES_IN`: Duración access token (default: 15m)
- `JWT_REFRESH_EXPIRES_IN`: Duración refresh token (default: 7d)

### Seguridad
- `BCRYPT_ROUNDS`: Rounds de bcrypt (default: 12)
- `RATE_LIMIT_WINDOW_MS`: Ventana rate limit (default: 900000)
- `RATE_LIMIT_MAX_REQUESTS`: Máximo requests (default: 100)

### CORS
- `ALLOWED_ORIGINS`: Orígenes permitidos (default: http://localhost:8000)

## 🚀 Despliegue

### Preparación

1. Configura variables de entorno de producción
2. Ejecuta migraciones: `npx prisma migrate deploy`
3. Genera cliente: `npx prisma generate`
4. Inicia servidor: `npm start`

### Docker (Opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Error de conexión a PostgreSQL

```bash
# Verificar que PostgreSQL esté ejecutándose
sudo systemctl status postgresql

# Verificar conexión
psql -h localhost -U usuario -d portfolio_db
```

### Error de Prisma

```bash
# Regenerar cliente
npx prisma generate

# Resetear y migrar
npx prisma migrate reset
npm run init-db -- --seed
```

### Error de permisos

```bash
# Verificar permisos de usuario PostgreSQL
psql -U postgres -c "\du"
```

## 📄 Licencia

Este proyecto es parte del portfolio personal de José Luis Castro.

## 🤝 Contribución

Este es un proyecto personal, pero las sugerencias son bienvenidas a través de issues.

---

**Desarrollado con ❤️ por José Luis Castro**