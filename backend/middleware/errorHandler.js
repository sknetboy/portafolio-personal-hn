/**
 * Middleware para manejo centralizado de errores
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  console.error('❌ Error:', err);

  // Error de validación de Prisma
  if (err.code === 'P2002') {
    const message = 'Recurso duplicado';
    error = { message, statusCode: 400 };
  }

  // Error de registro no encontrado en Prisma
  if (err.code === 'P2025') {
    const message = 'Recurso no encontrado';
    error = { message, statusCode: 404 };
  }

  // Error de validación
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = { message, statusCode: 401 };
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = { message, statusCode: 401 };
  }

  // Error de sintaxis JSON
  if (err.type === 'entity.parse.failed') {
    const message = 'JSON inválido';
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};