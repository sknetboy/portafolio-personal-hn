import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { 
  validateContact, 
  validateUpdateContact, 
  validateId, 
  validatePagination 
} from '../middleware/validators.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   POST /api/contacts
 * @desc    Crear nuevo mensaje de contacto
 * @access  Public
 */
router.post('/', validateContact, async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message,
      phone
    } = req.body;

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        subject,
        message,
        phone,
        status: 'PENDING'
      },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        message: true,
        phone: true,
        status: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Mensaje de contacto enviado exitosamente. Te responderemos pronto.',
      data: { contact }
    });
  } catch (error) {
    console.error('Error creando contacto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor. Por favor, intenta nuevamente.'
    });
  }
});

/**
 * @route   GET /api/contacts
 * @desc    Obtener todos los mensajes de contacto
 * @access  Private (Admin)
 */
router.get('/', authenticate, requireAdmin, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { message: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Obtener contactos
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          message: true,
          phone: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          respondedAt: true,
          adminNotes: true
        },
        orderBy: [
          { status: 'asc' }, // PENDING primero
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.contact.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    // Obtener estadísticas
    const stats = await prisma.contact.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        stats: statusStats
      }
    });
  } catch (error) {
    console.error('Error obteniendo contactos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   GET /api/contacts/:id
 * @desc    Obtener un mensaje de contacto por ID
 * @access  Private (Admin)
 */
router.get('/:id', authenticate, requireAdmin, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await prisma.contact.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        message: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        respondedAt: true,
        adminNotes: true
      }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Mensaje de contacto no encontrado'
      });
    }

    res.json({
      success: true,
      data: { contact }
    });
  } catch (error) {
    console.error('Error obteniendo contacto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   PUT /api/contacts/:id
 * @desc    Actualizar mensaje de contacto (solo admin)
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, requireAdmin, validateUpdateContact, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    // Verificar que el contacto existe
    const existingContact = await prisma.contact.findUnique({
      where: { id }
    });

    if (!existingContact) {
      return res.status(404).json({
        success: false,
        error: 'Mensaje de contacto no encontrado'
      });
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (status) {
      updateData.status = status;
      if (status === 'RESPONDED') {
        updateData.respondedAt = new Date();
      }
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        message: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        respondedAt: true,
        adminNotes: true
      }
    });

    res.json({
      success: true,
      message: 'Mensaje de contacto actualizado exitosamente',
      data: { contact }
    });
  } catch (error) {
    console.error('Error actualizando contacto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Eliminar mensaje de contacto
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, requireAdmin, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el contacto existe
    const existingContact = await prisma.contact.findUnique({
      where: { id }
    });

    if (!existingContact) {
      return res.status(404).json({
        success: false,
        error: 'Mensaje de contacto no encontrado'
      });
    }

    await prisma.contact.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Mensaje de contacto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando contacto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   PATCH /api/contacts/:id/status
 * @desc    Cambiar estado del mensaje de contacto
 * @access  Private (Admin)
 */
router.patch('/:id/status', authenticate, requireAdmin, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['PENDING', 'IN_PROGRESS', 'RESPONDED', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Estado inválido. Debe ser: PENDING, IN_PROGRESS, RESPONDED, o ARCHIVED'
      });
    }

    const contact = await prisma.contact.findUnique({
      where: { id },
      select: { id: true, status: true }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Mensaje de contacto no encontrado'
      });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (status === 'RESPONDED' && contact.status !== 'RESPONDED') {
      updateData.respondedAt = new Date();
    }

    const updatedContact = await prisma.contact.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        status: true,
        respondedAt: true
      }
    });

    res.json({
      success: true,
      message: `Estado del mensaje cambiado a ${status}`,
      data: { contact: updatedContact }
    });
  } catch (error) {
    console.error('Error cambiando estado del contacto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   GET /api/contacts/stats/summary
 * @desc    Obtener estadísticas de mensajes de contacto
 * @access  Private (Admin)
 */
router.get('/stats/summary', authenticate, requireAdmin, async (req, res) => {
  try {
    const [statusStats, recentContacts, monthlyStats] = await Promise.all([
      // Estadísticas por estado
      prisma.contact.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      
      // Contactos recientes (últimos 5)
      prisma.contact.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Estadísticas mensuales (últimos 6 meses)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*)::int as count
        FROM "Contact"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
      `
    ]);

    const statusSummary = statusStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {
      PENDING: 0,
      IN_PROGRESS: 0,
      RESPONDED: 0,
      ARCHIVED: 0
    });

    res.json({
      success: true,
      data: {
        statusSummary,
        recentContacts,
        monthlyStats,
        totalContacts: Object.values(statusSummary).reduce((sum, count) => sum + count, 0)
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de contactos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   POST /api/contacts/bulk-update
 * @desc    Actualización masiva de mensajes de contacto
 * @access  Private (Admin)
 */
router.post('/bulk-update', authenticate, requireAdmin, async (req, res) => {
  try {
    const { contactIds, status, adminNotes } = req.body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de IDs de contactos'
      });
    }

    if (!status || !['PENDING', 'IN_PROGRESS', 'RESPONDED', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Estado inválido'
      });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (status === 'RESPONDED') {
      updateData.respondedAt = new Date();
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const result = await prisma.contact.updateMany({
      where: {
        id: {
          in: contactIds
        }
      },
      data: updateData
    });

    res.json({
      success: true,
      message: `${result.count} mensajes de contacto actualizados exitosamente`,
      data: { updatedCount: result.count }
    });
  } catch (error) {
    console.error('Error en actualización masiva de contactos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;