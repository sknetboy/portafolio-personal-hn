import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware para manejar errores de validación
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Errores de validación',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Validadores para autenticación
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe proporcionar un email válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe proporcionar un email válido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  handleValidationErrors
];

// Validadores para proyectos
export const validateProject = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El título debe tener entre 3 y 100 caracteres'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('La URL del video debe ser válida')
    .custom((value) => {
      if (value && !value.includes('youtube.com') && !value.includes('youtu.be')) {
        throw new Error('Solo se permiten URLs de YouTube');
      }
      return true;
    }),
  body('videoTitle')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El título del video no puede exceder 100 caracteres'),
  body('repositoryUrl')
    .optional()
    .isURL()
    .withMessage('La URL del repositorio debe ser válida'),
  body('technologies')
    .isArray({ min: 1 })
    .withMessage('Debe proporcionar al menos una tecnología')
    .custom((technologies) => {
      if (technologies.some(tech => typeof tech !== 'string' || tech.trim().length === 0)) {
        throw new Error('Todas las tecnologías deben ser strings no vacíos');
      }
      return true;
    }),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured debe ser un valor booleano'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El orden debe ser un número entero positivo'),
  handleValidationErrors
];

export const validateUpdateProject = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('ID del proyecto requerido'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El título debe tener entre 3 y 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('La URL del video debe ser válida')
    .custom((value) => {
      if (value && !value.includes('youtube.com') && !value.includes('youtu.be')) {
        throw new Error('Solo se permiten URLs de YouTube');
      }
      return true;
    }),
  body('videoTitle')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El título del video no puede exceder 100 caracteres'),
  body('repositoryUrl')
    .optional()
    .isURL()
    .withMessage('La URL del repositorio debe ser válida'),
  body('technologies')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Debe proporcionar al menos una tecnología')
    .custom((technologies) => {
      if (technologies && technologies.some(tech => typeof tech !== 'string' || tech.trim().length === 0)) {
        throw new Error('Todas las tecnologías deben ser strings no vacíos');
      }
      return true;
    }),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured debe ser un valor booleano'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El orden debe ser un número entero positivo'),
  handleValidationErrors
];

// Validadores para contactos
export const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe proporcionar un email válido'),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('El asunto no puede exceder 200 caracteres'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('El mensaje debe tener entre 10 y 2000 caracteres'),
  handleValidationErrors
];

export const validateUpdateContact = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('ID del contacto requerido'),
  body('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
    .withMessage('Estado inválido'),
  body('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead debe ser un valor booleano'),
  handleValidationErrors
];

// Validadores para parámetros
export const validateId = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('ID requerido'),
  handleValidationErrors
];

// Validadores para queries
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La búsqueda no puede exceder 100 caracteres'),
  handleValidationErrors
];