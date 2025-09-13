import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generar token de acceso JWT
 * @param {Object} payload - Datos del usuario
 * @returns {string} Token JWT
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      issuer: 'joseluiscastro-portfolio',
      audience: 'portfolio-users'
    }
  );
};

/**
 * Generar token de refresco
 * @param {Object} payload - Datos del usuario
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.id,
      email: payload.email,
      tokenType: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: 'joseluiscastro-portfolio',
      audience: 'portfolio-users'
    }
  );
};

/**
 * Verificar token de acceso
 * @param {string} token - Token JWT
 * @returns {Object} Payload decodificado
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'joseluiscastro-portfolio',
      audience: 'portfolio-users'
    });
  } catch (error) {
    throw new Error('Token de acceso inválido o expirado');
  }
};

/**
 * Verificar token de refresco
 * @param {string} token - Refresh token
 * @returns {Object} Payload decodificado
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'joseluiscastro-portfolio',
      audience: 'portfolio-users'
    });
  } catch (error) {
    throw new Error('Token de refresco inválido o expirado');
  }
};

/**
 * Guardar refresh token en la base de datos
 * @param {string} userId - ID del usuario
 * @param {string} token - Refresh token
 * @param {Date} expiresAt - Fecha de expiración
 * @returns {Object} Token guardado
 */
export const saveRefreshToken = async (userId, token, expiresAt) => {
  try {
    // Eliminar tokens expirados del usuario
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
        expiresAt: {
          lt: new Date()
        }
      }
    });

    // Limitar a máximo 5 refresh tokens por usuario
    const existingTokens = await prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (existingTokens.length >= 5) {
      // Eliminar los tokens más antiguos
      const tokensToDelete = existingTokens.slice(4);
      await prisma.refreshToken.deleteMany({
        where: {
          id: {
            in: tokensToDelete.map(t => t.id)
          }
        }
      });
    }

    // Guardar el nuevo token
    return await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt
      }
    });
  } catch (error) {
    console.error('Error guardando refresh token:', error);
    throw new Error('Error interno del servidor');
  }
};

/**
 * Verificar si el refresh token existe en la base de datos
 * @param {string} token - Refresh token
 * @returns {Object|null} Token encontrado o null
 */
export const findRefreshToken = async (token) => {
  try {
    return await prisma.refreshToken.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error buscando refresh token:', error);
    return null;
  }
};

/**
 * Eliminar refresh token de la base de datos
 * @param {string} token - Refresh token
 * @returns {boolean} True si se eliminó exitosamente
 */
export const deleteRefreshToken = async (token) => {
  try {
    await prisma.refreshToken.deleteMany({
      where: { token }
    });
    return true;
  } catch (error) {
    console.error('Error eliminando refresh token:', error);
    return false;
  }
};

/**
 * Eliminar todos los refresh tokens de un usuario
 * @param {string} userId - ID del usuario
 * @returns {boolean} True si se eliminaron exitosamente
 */
export const deleteAllUserRefreshTokens = async (userId) => {
  try {
    await prisma.refreshToken.deleteMany({
      where: { userId }
    });
    return true;
  } catch (error) {
    console.error('Error eliminando tokens del usuario:', error);
    return false;
  }
};

/**
 * Limpiar tokens expirados de la base de datos
 * @returns {number} Número de tokens eliminados
 */
export const cleanExpiredTokens = async () => {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    
    if (result.count > 0) {
      console.log(`🧹 Eliminados ${result.count} refresh tokens expirados`);
    }
    
    return result.count;
  } catch (error) {
    console.error('Error limpiando tokens expirados:', error);
    return 0;
  }
};

/**
 * Generar par de tokens (access + refresh)
 * @param {Object} user - Datos del usuario
 * @returns {Object} Objeto con ambos tokens
 */
export const generateTokenPair = async (user) => {
  try {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Calcular fecha de expiración del refresh token
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    const expiresAt = new Date();
    
    // Parsear el tiempo de expiración
    const timeValue = parseInt(refreshExpiresIn);
    const timeUnit = refreshExpiresIn.slice(-1);
    
    switch (timeUnit) {
      case 'd':
        expiresAt.setDate(expiresAt.getDate() + timeValue);
        break;
      case 'h':
        expiresAt.setHours(expiresAt.getHours() + timeValue);
        break;
      case 'm':
        expiresAt.setMinutes(expiresAt.getMinutes() + timeValue);
        break;
      default:
        expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 días
    }
    
    // Guardar refresh token en la base de datos
    await saveRefreshToken(user.id, refreshToken, expiresAt);
    
    return {
      accessToken,
      refreshToken,
      expiresAt
    };
  } catch (error) {
    console.error('Error generando par de tokens:', error);
    throw new Error('Error generando tokens de autenticación');
  }
};

/**
 * Decodificar token sin verificar (para obtener información)
 * @param {string} token - Token JWT
 * @returns {Object|null} Payload decodificado o null
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Verificar si un token está próximo a expirar
 * @param {string} token - Token JWT
 * @param {number} thresholdMinutes - Minutos antes de la expiración
 * @returns {boolean} True si está próximo a expirar
 */
export const isTokenNearExpiry = (token, thresholdMinutes = 5) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const expirationTime = decoded.exp * 1000; // Convertir a millisegundos
    const currentTime = Date.now();
    const thresholdTime = thresholdMinutes * 60 * 1000; // Convertir minutos a millisegundos
    
    return (expirationTime - currentTime) <= thresholdTime;
  } catch (error) {
    return true;
  }
};

// Programar limpieza automática de tokens expirados cada hora
if (process.env.NODE_ENV !== 'test') {
  setInterval(cleanExpiredTokens, 60 * 60 * 1000); // Cada hora
}

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserRefreshTokens,
  cleanExpiredTokens,
  generateTokenPair,
  decodeToken,
  isTokenNearExpiry
};