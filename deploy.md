# 🚀 Guía de Deployment en Vercel

## Pasos Rápidos para Deploy

### 1. Preparar Repositorio Git

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar archivos
git add .
git commit -m "Initial commit - Portfolio with backend API"

# Conectar con repositorio remoto
git remote add origin https://github.com/tu-usuario/tu-repositorio.git
git push -u origin main
```

### 2. Crear Base de Datos PostgreSQL

#### Opción A: Neon (Recomendado)
1. Ve a [neon.tech](https://neon.tech)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Copia la `DATABASE_URL`

#### Opción B: Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Ve a Settings > Database
5. Copia la `Connection string`

### 3. Deploy en Vercel

1. **Conectar Repositorio**:
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "New Project"
   - Conecta tu repositorio de GitHub

2. **Configurar Build Settings**:
   - **Framework Preset**: Other
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: (dejar vacío)
   - **Install Command**: `npm install`

3. **Agregar Variables de Entorno**:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=tu-clave-jwt-super-secreta-de-al-menos-32-caracteres
   JWT_REFRESH_SECRET=tu-clave-refresh-super-secreta-de-al-menos-32-caracteres
   NODE_ENV=production
   CORS_ORIGIN=https://tu-dominio.vercel.app
   SUPABASE_KEY=tu-supabase-anon-key
   ```

4. **Deploy**:
   - Haz clic en "Deploy"
   - Espera a que termine el build

### 4. Configurar Dominio (Opcional)

1. En el dashboard de Vercel, ve a tu proyecto
2. Ve a "Settings" > "Domains"
3. Agrega tu dominio personalizado
4. Actualiza `CORS_ORIGIN` con tu nuevo dominio

## ✅ Verificar Deployment

### Endpoints a Probar

1. **Frontend**: `https://tu-dominio.vercel.app`
2. **API Health**: `https://tu-dominio.vercel.app/api/health`
3. **API Docs**: `https://tu-dominio.vercel.app/api/docs`

### Funcionalidades a Verificar

- [ ] Página principal carga correctamente
- [ ] Formulario de contacto funciona
- [ ] Proyectos se cargan desde la API
- [ ] Videos de YouTube se muestran
- [ ] API responde correctamente

## 🔧 Troubleshooting

### Error: "Module not found"
```bash
# Verificar que todas las dependencias estén en package.json
# Hacer redeploy
```

### Error: "Database connection failed"
```bash
# Verificar DATABASE_URL en variables de entorno
# Asegurar que la base de datos esté accesible
```

### Error: "CORS policy"
```bash
# Verificar CORS_ORIGIN en variables de entorno
# Debe coincidir exactamente con el dominio
```

### Error: "JWT malformed"
```bash
# Verificar JWT_SECRET y JWT_REFRESH_SECRET
# Deben ser strings largos y seguros
```

## 📝 Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|----------|
| `DATABASE_URL` | URL de conexión PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Clave secreta para JWT | `mi-clave-super-secreta-de-32-chars` |
| `JWT_REFRESH_SECRET` | Clave para refresh tokens | `mi-clave-refresh-super-secreta-32` |
| `NODE_ENV` | Entorno de ejecución | `production` |
| `CORS_ORIGIN` | Dominio permitido para CORS | `https://mi-portfolio.vercel.app` |
| `SUPABASE_KEY` | Clave anónima de Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |

## 🚀 Comandos Útiles

```bash
# Ver logs de deployment
vercel logs

# Hacer redeploy
vercel --prod

# Ver información del proyecto
vercel inspect

# Configurar variables de entorno desde CLI
vercel env add DATABASE_URL
```

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en el dashboard de Vercel
2. Verifica las variables de entorno
3. Asegúrate de que la base de datos esté accesible
4. Revisa la documentación de Vercel

---

¡Tu portfolio estará listo en minutos! 🎉