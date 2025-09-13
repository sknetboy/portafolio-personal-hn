import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { 
  validateProject, 
  validateUpdateProject, 
  validateId, 
  validatePagination 
} from '../middleware/validators.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   GET /api/projects
 * @desc    Obtener todos los proyectos (públicos)
 * @access  Public
 */
router.get('/', validatePagination, optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const featured = req.query.featured === 'true';
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {
      isActive: true,
      ...(featured && { isFeatured: true }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { technologies: { hasSome: [search] } }
        ]
      })
    };

    // Obtener proyectos
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          videoUrl: true,
          videoTitle: true,
          repositoryUrl: true,
          technologies: true,
          isFeatured: true,
          order: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.project.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   GET /api/projects/featured
 * @desc    Obtener proyectos destacados
 * @access  Public
 */
router.get('/featured', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        isActive: true,
        isFeatured: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        videoUrl: true,
        videoTitle: true,
        repositoryUrl: true,
        technologies: true,
        order: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: { projects }
    });
  } catch (error) {
    console.error('Error obteniendo proyectos destacados:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   GET /api/projects/:id
 * @desc    Obtener un proyecto por ID
 * @access  Public
 */
router.get('/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        isActive: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        videoUrl: true,
        videoTitle: true,
        repositoryUrl: true,
        technologies: true,
        isFeatured: true,
        order: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Proyecto no encontrado'
      });
    }

    res.json({
      success: true,
      data: { project }
    });
  } catch (error) {
    console.error('Error obteniendo proyecto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   POST /api/projects
 * @desc    Crear nuevo proyecto
 * @access  Private (Admin)
 */
router.post('/', authenticate, requireAdmin, validateProject, async (req, res) => {
  try {
    const {
      title,
      description,
      videoUrl,
      videoTitle,
      repositoryUrl,
      technologies,
      isFeatured = false,
      order = 0
    } = req.body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        videoUrl,
        videoTitle,
        repositoryUrl,
        technologies,
        isFeatured,
        order,
        authorId: req.user.id
      },
      select: {
        id: true,
        title: true,
        description: true,
        videoUrl: true,
        videoTitle: true,
        repositoryUrl: true,
        technologies: true,
        isFeatured: true,
        isActive: true,
        order: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Proyecto creado exitosamente',
      data: { project }
    });
  } catch (error) {
    console.error('Error creando proyecto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Actualizar proyecto
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, requireAdmin, validateUpdateProject, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar que el proyecto existe
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        error: 'Proyecto no encontrado'
      });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      select: {
        id: true,
        title: true,
        description: true,
        videoUrl: true,
        videoTitle: true,
        repositoryUrl: true,
        technologies: true,
        isFeatured: true,
        isActive: true,
        order: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Proyecto actualizado exitosamente',
      data: { project }
    });
  } catch (error) {
    console.error('Error actualizando proyecto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   DELETE /api/projects/:id
 * @desc    Eliminar proyecto (soft delete)
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, requireAdmin, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el proyecto existe
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        error: 'Proyecto no encontrado'
      });
    }

    // Soft delete - marcar como inactivo
    await prisma.project.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Proyecto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   PATCH /api/projects/:id/toggle-featured
 * @desc    Alternar estado destacado del proyecto
 * @access  Private (Admin)
 */
router.patch('/:id/toggle-featured', authenticate, requireAdmin, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true, isFeatured: true }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Proyecto no encontrado'
      });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        isFeatured: !project.isFeatured,
        updatedAt: new Date()
      },
      select: {
        id: true,
        title: true,
        isFeatured: true
      }
    });

    res.json({
      success: true,
      message: `Proyecto ${updatedProject.isFeatured ? 'marcado como destacado' : 'removido de destacados'}`,
      data: { project: updatedProject }
    });
  } catch (error) {
    console.error('Error alternando estado destacado:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   GET /api/projects/admin/all
 * @desc    Obtener todos los proyectos (incluyendo inactivos) - Solo Admin
 * @access  Private (Admin)
 */
router.get('/admin/all', authenticate, requireAdmin, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          videoUrl: true,
          videoTitle: true,
          repositoryUrl: true,
          technologies: true,
          isFeatured: true,
          isActive: true,
          order: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.project.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo todos los proyectos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;