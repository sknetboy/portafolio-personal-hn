#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDatabase, seedDatabase, checkDatabaseHealth } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Verificar si Prisma CLI está instalado
 */
const checkPrismaCLI = () => {
  try {
    execSync('npx prisma --version', { stdio: 'pipe' });
    console.log('✅ Prisma CLI disponible');
    return true;
  } catch (error) {
    console.error('❌ Prisma CLI no encontrado. Instalando...');
    try {
      execSync('npm install prisma @prisma/client', { stdio: 'inherit' });
      console.log('✅ Prisma CLI instalado');
      return true;
    } catch (installError) {
      console.error('❌ Error instalando Prisma CLI:', installError.message);
      return false;
    }
  }
};

/**
 * Verificar variables de entorno requeridas
 */
const checkEnvironmentVariables = () => {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 Crea un archivo .env basado en .env.example');
    return false;
  }

  console.log('✅ Variables de entorno configuradas');
  return true;
};

/**
 * Generar cliente Prisma
 */
const generatePrismaClient = () => {
  try {
    console.log('🔄 Generando cliente Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Cliente Prisma generado');
    return true;
  } catch (error) {
    console.error('❌ Error generando cliente Prisma:', error.message);
    return false;
  }
};

/**
 * Ejecutar migraciones de base de datos
 */
const runMigrations = () => {
  try {
    console.log('🔄 Ejecutando migraciones de base de datos...');
    
    if (process.env.NODE_ENV === 'production') {
      // En producción, usar migrate deploy
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    } else {
      // En desarrollo, usar db push para sincronizar el esquema
      execSync('npx prisma db push', { stdio: 'inherit' });
    }
    
    console.log('✅ Migraciones ejecutadas exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error.message);
    return false;
  }
};

/**
 * Verificar conexión a la base de datos
 */
const testDatabaseConnection = async () => {
  try {
    console.log('🔄 Verificando conexión a la base de datos...');
    await connectDatabase();
    
    const health = await checkDatabaseHealth();
    if (health.status === 'healthy') {
      console.log(`✅ Base de datos saludable (${health.responseTime})`);
      return true;
    } else {
      console.error('❌ Base de datos no saludable:', health.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    console.error('\n💡 Verifica que:');
    console.error('   - PostgreSQL esté ejecutándose');
    console.error('   - La URL de conexión sea correcta');
    console.error('   - Las credenciales sean válidas');
    return false;
  }
};

/**
 * Sembrar datos iniciales
 */
const seedInitialData = async () => {
  try {
    console.log('🌱 Sembrando datos iniciales...');
    await seedDatabase();
    console.log('✅ Datos iniciales sembrados');
    return true;
  } catch (error) {
    console.error('❌ Error sembrando datos iniciales:', error.message);
    return false;
  }
};

/**
 * Función principal de inicialización
 */
const initializeDatabase = async () => {
  console.log('🚀 Inicializando base de datos del portfolio...');
  console.log('=' .repeat(50));

  // 1. Verificar Prisma CLI
  if (!checkPrismaCLI()) {
    process.exit(1);
  }

  // 2. Verificar variables de entorno
  if (!checkEnvironmentVariables()) {
    process.exit(1);
  }

  // 3. Generar cliente Prisma
  if (!generatePrismaClient()) {
    process.exit(1);
  }

  // 4. Ejecutar migraciones
  if (!runMigrations()) {
    process.exit(1);
  }

  // 5. Verificar conexión
  if (!await testDatabaseConnection()) {
    process.exit(1);
  }

  // 6. Sembrar datos iniciales (opcional)
  const shouldSeed = process.argv.includes('--seed') || process.env.SEED_DATABASE === 'true';
  if (shouldSeed) {
    if (!await seedInitialData()) {
      console.error('⚠️  Error sembrando datos, pero la base de datos está lista');
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🎉 ¡Base de datos inicializada exitosamente!');
  console.log('\n📋 Próximos pasos:');
  console.log('   1. Ejecuta: npm run dev (para desarrollo)');
  console.log('   2. Ejecuta: npm start (para producción)');
  
  if (!shouldSeed) {
    console.log('\n💡 Para sembrar datos de ejemplo, ejecuta:');
    console.log('   npm run init-db -- --seed');
  }
  
  console.log('\n🔗 Endpoints disponibles:');
  console.log('   - Health: GET /api/health');
  console.log('   - Auth: POST /api/auth/register');
  console.log('   - Projects: GET /api/projects');
  console.log('   - Contacts: POST /api/contacts');
};

/**
 * Función para mostrar ayuda
 */
const showHelp = () => {
  console.log('🔧 Script de inicialización de base de datos');
  console.log('\nUso:');
  console.log('  npm run init-db [opciones]');
  console.log('\nOpciones:');
  console.log('  --seed     Sembrar datos de ejemplo');
  console.log('  --help     Mostrar esta ayuda');
  console.log('\nEjemplos:');
  console.log('  npm run init-db');
  console.log('  npm run init-db -- --seed');
};

// Ejecutar script
if (process.argv.includes('--help')) {
  showHelp();
} else {
  initializeDatabase().catch((error) => {
    console.error('💥 Error fatal durante la inicialización:', error);
    process.exit(1);
  });
}