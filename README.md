# Portfolio de Jose Luis Castro

> Desarrollador Backend Java & Científico de Datos

Portfolio personal con backend API completo desarrollado con Express.js, Prisma ORM y PostgreSQL.

## 🚀 Deployment en Vercel

### Prerrequisitos

1. **Cuenta en Vercel**: [vercel.com](https://vercel.com)
2. **Base de datos PostgreSQL**: Recomendado [Neon](https://neon.tech) o [Supabase](https://supabase.com)
3. **Repositorio Git**: GitHub, GitLab o Bitbucket

### Pasos para Deploy

#### 1. Preparar la Base de Datos

```bash
# Crear una base de datos PostgreSQL en Neon/Supabase
# Obtener la URL de conexión (DATABASE_URL)
```

#### 2. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel, agregar estas variables:

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=tu-clave-secreta-jwt-muy-larga-y-segura
JWT_REFRESH_SECRET=tu-clave-secreta-refresh-muy-larga-y-segura
NODE_ENV=production
CORS_ORIGIN=https://tu-dominio.vercel.app
```

#### 3. Deploy desde Git

1. **Conectar repositorio** en Vercel
2. **Configurar build settings**:
   - Build Command: `npm run vercel-build`
   - Output Directory: (dejar vacío)
   - Install Command: `npm install`

3. **Deploy automático** se ejecutará

#### 4. Configurar Base de Datos (Post-Deploy)

```bash
# En Vercel Functions, las migraciones se ejecutan automáticamente
# Si necesitas ejecutar manualmente:
npx prisma migrate deploy
npx prisma generate
```

## 🛠️ Desarrollo Local

### Instalación

```bash
# Clonar repositorio
git clone <tu-repositorio>
cd jose-luis-castro-portfolio

# Instalar dependencias del backend
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Configurar base de datos
npx prisma migrate dev
npx prisma generate

# Iniciar servidor de desarrollo
npm run dev
```

### Estructura del Proyecto

```
├── backend/                 # API Backend (Express.js)
│   ├── config/             # Configuración de BD
│   ├── middleware/         # Middlewares (auth, validation, etc.)
│   ├── routes/            # Rutas de la API
│   ├── utils/             # Utilidades (JWT, etc.)
│   ├── prisma/            # Schema y migraciones
│   └── server.js          # Servidor principal
├── js/                    # Scripts del frontend
│   └── api.js            # Cliente API
├── index.html            # Página principal
├── script.js             # Lógica del frontend
├── styles.css            # Estilos
├── vercel.json           # Configuración de Vercel
└── package.json          # Dependencias del proyecto
```

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Proyectos
- `GET /api/projects/featured` - Proyectos destacados (público)
- `GET /api/projects` - Todos los proyectos (admin)
- `POST /api/projects` - Crear proyecto (admin)
- `PUT /api/projects/:id` - Actualizar proyecto (admin)
- `DELETE /api/projects/:id` - Eliminar proyecto (admin)
- `PATCH /api/projects/:id/toggle-featured` - Alternar destacado (admin)

### Contactos
- `POST /api/contacts` - Crear contacto (público)
- `GET /api/contacts` - Listar contactos (admin)
- `PUT /api/contacts/:id` - Actualizar contacto (admin)
- `DELETE /api/contacts/:id` - Eliminar contacto (admin)
- `PATCH /api/contacts/bulk-update` - Actualización masiva (admin)
- `GET /api/contacts/stats` - Estadísticas (admin)

### Sistema
- `GET /api/health` - Estado del sistema
- `GET /api/docs` - Documentación de la API

## 🔧 Tecnologías

### Backend
- **Express.js** - Framework web
- **Prisma ORM** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas
- **express-validator** - Validación de datos
- **cors** - Configuración CORS
- **helmet** - Seguridad HTTP
- **express-rate-limit** - Rate limiting

### Frontend
- **Vanilla JavaScript** - Lógica del cliente
- **CSS3** - Estilos y animaciones
- **HTML5** - Estructura
- **Font Awesome** - Iconos
- **Google Fonts** - Tipografías

## 🔒 Seguridad

- **JWT Tokens** con refresh tokens
- **Validación de entrada** en todos los endpoints
- **Rate limiting** para prevenir ataques
- **CORS** configurado correctamente
- **Helmet** para headers de seguridad
- **Encriptación bcrypt** para contraseñas
- **Sanitización** de datos de entrada

## 📝 Variables de Entorno

Ver `.env.example` para la lista completa de variables requeridas.

## 🚨 Troubleshooting

### Error de Base de Datos
```bash
# Verificar conexión
npx prisma db pull

# Resetear migraciones
npx prisma migrate reset
```

### Error de CORS
```bash
# Verificar CORS_ORIGIN en variables de entorno
# Debe coincidir con el dominio de Vercel
```

### Error de JWT
```bash
# Verificar JWT_SECRET y JWT_REFRESH_SECRET
# Deben ser strings largos y seguros
```

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

## 👤 Autor

**Jose Luis Castro**
- Desarrollador Backend Java
- Científico de Datos
- Especialista en Oracle SQL, MySQL y PostgreSQL

---

¿Preguntas? ¡Contáctame a través del formulario en el sitio web!