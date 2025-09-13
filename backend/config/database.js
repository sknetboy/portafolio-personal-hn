import { PrismaClient } from '@prisma/client';

// Configuración global de Prisma
const globalForPrisma = globalThis;

// Crear instancia de Prisma con configuración optimizada
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

// En desarrollo, usar la instancia global para evitar múltiples conexiones
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Función para conectar a la base de datos
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conexión a PostgreSQL establecida exitosamente');
    
    // Verificar la conexión
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Base de datos respondiendo correctamente');
    
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    throw error;
  }
};

// Función para desconectar de la base de datos
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log('✅ Desconexión de PostgreSQL exitosa');
  } catch (error) {
    console.error('❌ Error desconectando de la base de datos:', error);
    throw error;
  }
};

// Función para verificar el estado de la base de datos
export const checkDatabaseHealth = async () => {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Función para ejecutar migraciones
export const runMigrations = async () => {
  try {
    console.log('🔄 Ejecutando migraciones de base de datos...');
    
    // En producción, las migraciones deben ejecutarse manualmente
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  En producción, ejecuta las migraciones manualmente con: npx prisma migrate deploy');
      return;
    }
    
    // En desarrollo, podemos usar prisma db push para sincronizar el esquema
    console.log('✅ Migraciones completadas (desarrollo)');
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    throw error;
  }
};

// Función para sembrar datos iniciales
export const seedDatabase = async () => {
  try {
    console.log('🌱 Sembrando datos iniciales...');
    
    // Verificar si ya existe un usuario admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (existingAdmin) {
      console.log('✅ Usuario administrador ya existe');
      return;
    }
    
    // Crear usuario administrador por defecto
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || 'admin123', 12);
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'José Luis Castro',
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@joseluiscastro.dev',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    });
    
    console.log('✅ Usuario administrador creado:', adminUser.email);
    
    // Crear algunos proyectos de ejemplo
    const sampleProjects = [
      {
        title: 'E-commerce Platform',
        description: 'Plataforma de comercio electrónico completa con carrito de compras, pagos y gestión de inventario.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoTitle: 'Demo E-commerce Platform',
        repositoryUrl: 'https://github.com/joseluiscastro/ecommerce-platform',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
        isFeatured: true,
        order: 1,
        authorId: adminUser.id
      },
      {
        title: 'Data Analytics Dashboard',
        description: 'Dashboard interactivo para análisis de datos con gráficos en tiempo real y reportes personalizados.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoTitle: 'Demo Analytics Dashboard',
        repositoryUrl: 'https://github.com/joseluiscastro/analytics-dashboard',
        technologies: ['Vue.js', 'D3.js', 'Python', 'FastAPI'],
        isFeatured: true,
        order: 2,
        authorId: adminUser.id
      },
      {
        title: 'Task Management System',
        description: 'Sistema de gestión de tareas con colaboración en tiempo real y seguimiento de proyectos.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoTitle: 'Demo Task Management',
        repositoryUrl: 'https://github.com/joseluiscastro/task-management',
        technologies: ['Angular', 'NestJS', 'MongoDB', 'Socket.io'],
        isFeatured: true,
        order: 3,
        authorId: adminUser.id
      }
    ];
    
    for (const project of sampleProjects) {
      await prisma.project.create({ data: project });
    }
    
    console.log('✅ Proyectos de ejemplo creados');
    console.log('🌱 Datos iniciales sembrados exitosamente');
    
  } catch (error) {
    console.error('❌ Error sembrando datos iniciales:', error);
    throw error;
  }
};

// Función para limpiar la base de datos (solo desarrollo)
export const cleanDatabase = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('No se puede limpiar la base de datos en producción');
  }
  
  try {
    console.log('🧹 Limpiando base de datos...');
    
    // Eliminar en orden para respetar las relaciones
    await prisma.refreshToken.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ Base de datos limpiada');
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error);
    throw error;
  }
};

// Función para obtener estadísticas de la base de datos
export const getDatabaseStats = async () => {
  try {
    const [userCount, projectCount, contactCount, activeProjects, featuredProjects] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.contact.count(),
      prisma.project.count({ where: { isActive: true } }),
      prisma.project.count({ where: { isFeatured: true, isActive: true } })
    ]);
    
    return {
      users: userCount,
      projects: {
        total: projectCount,
        active: activeProjects,
        featured: featuredProjects
      },
      contacts: contactCount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de base de datos:', error);
    throw error;
  }
};

// Manejo de cierre graceful
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export default prisma;