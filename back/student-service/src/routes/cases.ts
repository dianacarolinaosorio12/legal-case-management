import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Términos procesales estándar por tipo de proceso (días hábiles)
const TERMINOS_PROCESALES: Record<string, { nombre: string; dias: number }[]> = {
  Tutela: [
    { nombre: 'Notificación al demandado', dias: 2 },
    { nombre: 'Admisorio o rechazo', dias: 10 },
    { nombre: 'Trámite al juez de conocimiento', dias: 2 },
    { nombre: 'Decisión de tutela', dias: 10 },
    { nombre: 'Notificación del fallo', dias: 1 },
    { nombre: 'Cumplimiento', dias: 48 },
  ],
  Accion_de_tutela: [
    { nombre: 'Notificación al demandado', dias: 2 },
    { nombre: 'Admisorio o rechazo', dias: 10 },
    { nombre: 'Decisión de tutela', dias: 10 },
    { nombre: 'Notificación del fallo', dias: 1 },
  ],
  Demanda: [
    { nombre: 'Admisión de la demanda', dias: 30 },
    { nombre: 'Notificación al demandado', dias: 20 },
    { nombre: 'Contestación de demanda', dias: 30 },
    { nombre: 'Audiencia de conciliación', dias: 30 },
    { nombre: 'Alegatos de cierre', dias: 10 },
    { nombre: 'Sentencia de primera instancia', dias: 30 },
  ],
  Ordinario: [
    { nombre: 'Admisión de la demanda', dias: 30 },
    { nombre: 'Notificación al demandado', dias: 20 },
    { nombre: 'Contestación de demanda', dias: 30 },
    { nombre: 'Audiencia inicial', dias: 30 },
    { nombre: 'Práctica de pruebas', dias: 60 },
    { nombre: 'Alegatos', dias: 10 },
    { nombre: 'Sentencia', dias: 30 },
  ],
  Verbal: [
    { nombre: 'Admisión de la demanda', dias: 20 },
    { nombre: 'Notificación', dias: 10 },
    { nombre: 'Audiencia de conciliación', dias: 30 },
    { nombre: 'Sentencia', dias: 10 },
  ],
  Proceso_sumario: [
    { nombre: 'Admisión', dias: 15 },
    { nombre: 'Notificación', dias: 10 },
    { nombre: 'Contestación', dias: 15 },
    { nombre: 'Sentencia', dias: 20 },
  ],
  Derecho_de_peticion: [
    { nombre: 'Respuesta a la petición', dias: 15 },
    { nombre: 'Silencio administrativo positivo', dias: 30 },
  ],
  Consulta: [
    { nombre: 'Atención de consulta', dias: 30 },
    { nombre: 'Respuesta', dias: 10 },
  ],
};

// Función para calcular términos procesales
function calcularTerminos(tipoProceso: string, fechaInicio: Date) {
  const terminos = TERMINOS_PROCESALES[tipoProceso] || TERMINOS_PROCESALES['Demanda'];
  const deadlines = [];
  let fechaActual = new Date(fechaInicio);

  for (const termino of terminos) {
    const fechaVencimiento = new Date(fechaActual);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + termino.dias);
    
    const diasRestantes = Math.ceil((fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    deadlines.push({
      tipoTermino: tipoProceso,
      nombreTermino: termino.nombre,
      fechaInicio: fechaActual,
      fechaVencimiento: fechaVencimiento,
      diasTermino: termino.dias,
      diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
      estado: diasRestantes > 0 ? 'activo' : 'vencido',
    });
    
    fechaActual = fechaVencimiento;
  }

  return deadlines;
}

// Función para determinar el semáforo basado en términos
function calcularSemaforo(deadlines: { diasRestantes: number }[]): 'red' | 'yellow' | 'green' {
  const diasMinimos = Math.min(...deadlines.map(d => d.diasRestantes));
  
  if (diasMinimos <= 3) return 'red';
  if (diasMinimos <= 10) return 'yellow';
  return 'green';
}

// GET /cases - Listar casos del estudiante (todos los roles pueden ver)
router.get('/cases', authenticateToken, authorizeRoles('estudiante', 'profesor', 'administrativo'), async (req, res) => {
  try {
    const user = (req as any).user;
    
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    // Filtrar por rol y área
    let whereClause: any = {};
    
    if (user.role === 'estudiante') {
      // Estudiante solo ve sus casos
      whereClause = { assignedStudentId: user.userId };
    } else if (user.role === 'profesor') {
      // Profesor solo ve casos de su especialidad/área
      whereClause = { area: user.area };
    }
    // Admin ve todos los casos (sin filtro)

    const cases = await prisma.legalCase.findMany({
      where: whereClause,
      include: {
        deadlines: {
          where: { estado: 'activo' },
          orderBy: { fechaVencimiento: 'asc' }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calcular días en la fase actual usando statusUpdatedAt
    const casesWithDelay = cases.map(c => {
      const statusDate = c.statusUpdatedAt ? new Date(c.statusUpdatedAt) : new Date(c.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - statusDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...c,
        daysInCurrentPhase: daysDiff,
        statusUpdatedAt: statusDate
      };
    });

    res.json(casesWithDelay);
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /cases/stats - Métricas reales para Dashboard Admin
router.get('/cases/stats', authenticateToken, authorizeRoles('profesor', 'administrativo'), async (req, res) => {
  try {
    const user = (req as any).user;
    
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    // Si es profesor, filtrar por su área
    const areaFilter = user.role === 'profesor' ? { area: user.area } : {};

    // Total de casos
    const total = await prisma.legalCase.count({
      where: areaFilter
    });

    // Casos activos (no cerrados)
    const active = await prisma.legalCase.count({
      where: {
        ...areaFilter,
        status: { not: 'Cerrado' }
      }
    });

    // Casos de alto riesgo
    const highRisk = await prisma.legalCase.count({
      where: {
        ...areaFilter,
        highRiskAlert: true
      }
    });

    // Casos vencidos (buscando en deadlines)
    const overdue = await prisma.legalCase.count({
      where: {
        ...areaFilter,
        deadlines: {
          some: {
            estado: 'vencido'
          }
        }
      }
    });

    // Casos por fase
    const byPhase = await prisma.legalCase.groupBy({
      by: ['status'],
      where: areaFilter,
      _count: true
    });

    // Casos por área
    const byArea = await prisma.legalCase.groupBy({
      by: ['area'],
      where: areaFilter,
      _count: true
    });

    res.json({
      total,
      active,
      highRisk,
      overdue,
      byPhase: byPhase.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byArea: byArea.reduce((acc, item) => {
        acc[item.area] = item._count;
        return acc;
      }, {} as Record<string, number>)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /cases - Crear nuevo expediente (solo estudiante y admin)
router.post('/cases', authenticateToken, authorizeRoles('estudiante', 'administrativo'), async (req, res) => {
  try {
    const user = (req as any).user;
    
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    const {
      radicado,
      numeroProceso,
      demandante,
      demandado,
      despacho,
      fechaNotificacion,
      clientName,
      clientDoc,
      clientDocType,
      clientPhone,
      clientEmail,
      clientAddress,
      type,
      area,
      description,
      isMinor,
      highRiskAlert,
      highRiskReason,
      interviewNotes,
    } = req.body;

    // Validar campos requeridos
    if (!radicado || !clientName || !clientDoc || !type || !area) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Validar que numeroProceso tenga exactamente 23 dígitos numéricos
    const numeroProcesoDigits = (numeroProceso || '').replace(/-/g, '');
    if (!/^\d{23}$/.test(numeroProcesoDigits)) {
      return res.status(400).json({ 
        error: 'El número de proceso debe tener exactamente 23 dígitos numéricos',
        receivedLength: numeroProcesoDigits.length
      });
    }

    // Obtener información del estudiante y profesor
    const student = await prisma.user.findUnique({
      where: { id: user.userId }
    });

    // Buscar un profesor del área对应iente
    const professor = await prisma.user.findFirst({
      where: {
        role: 'profesor',
        area: area
      }
    });

    const fechaInicio = fechaNotificacion ? new Date(fechaNotificacion) : new Date();
    const deadline = calcularTerminos(type, fechaInicio);
    const semaphore = calcularSemaforo(deadline);

    // Calcular deadline general del caso (primer término)
    const fechaVencimientoMasCercana = Math.min(...deadline.map((d: { fechaVencimiento: { getTime: () => number } }) => d.fechaVencimiento.getTime()));
    const deadlineGeneral = new Date(fechaVencimientoMasCercana).toISOString().split('T')[0];

    // Crear el caso con transacción atómica (caso + carpetas + términos + notificación)
    const newCase = await prisma.$transaction(async (tx) => {
      // Crear el caso
      const createdCase = await tx.legalCase.create({
        data: {
          radicado,
          numeroProceso,
          demandante,
          demandado,
          despacho,
          fechaNotificacion,
          clientName,
          clientDoc,
          clientDocType,
          clientPhone,
          clientEmail,
          clientAddress,
          type,
          area,
          status: 'Evaluacion',
          semaphore,
          deadline: deadlineGeneral,
          createdAt: new Date().toISOString().split('T')[0],
          statusUpdatedAt: new Date(),
          assignedStudentName: student?.name || 'Estudiante',
          assignedProfessor: professor?.name || 'Profesor Asignado',
          description,
          isMinor: isMinor || false,
          highRiskAlert: highRiskAlert || false,
          highRiskReason,
          procesalDeadlines: deadline,
          substitutionHistory: [],
          interviewNotes,
          aiTags: [],
          auditLog: [{
            date: new Date().toISOString(),
            action: 'case_created',
            user: student?.name || 'Estudiante'
          }],
          hoursSpent: 0,
          assignedStudentId: user.userId
        }
      });

      // Crear términos procesales individuales
      for (const term of deadline) {
        await tx.legalDeadline.create({
          data: {
            legalCaseId: createdCase.id,
            tipoTermino: term.tipoTermino,
            nombreTermino: term.nombreTermino,
            fechaInicio: term.fechaInicio,
            fechaVencimiento: term.fechaVencimiento,
            diasTermino: term.diasTermino,
            diasRestantes: term.diasRestantes,
            estado: term.estado,
            observaciones: 'Término calculado automáticamente'
          }
        });
      }

      // Actualizar contador de casos activos del estudiante
      await tx.user.update({
        where: { id: user.userId },
        data: { activeCases: { increment: 1 } }
      });

      // HU-02: Crear automáticamente las 3 carpetas digitales
      const foldersToCreate = [
        { name: '1. Identificación', description: 'Documentos de identidad del cliente' },
        { name: '2. Poderes y Sustituciones', description: 'Poderes, sustituciones y autorizaciones' },
        { name: '3. Actuaciones Procesales', description: 'Actuaciones, memoriales y escritos' }
      ];

      await tx.folder.createMany({
        data: foldersToCreate.map(folder => ({
          ...folder,
          legalCaseId: createdCase.id
        }))
      });

      // Crear notificación para el profesor del área
      if (professor) {
        await tx.notification.create({
          data: {
            userId: professor.id,
            type: 'new_case',
            title: 'Nuevo caso asignado',
            message: `El estudiante ${student?.name} ha creado el caso ${radicado} en el área ${area}`,
            caseId: createdCase.id,
            read: false
          }
        });
      }

      return createdCase;
    });

    // Obtener el caso creado con los términos y carpetas
    const createdCase = await prisma.legalCase.findUnique({
      where: { id: newCase.id },
      include: {
        deadlines: {
          orderBy: { fechaVencimiento: 'asc' }
        },
        folders: true
      }
    });

    res.status(201).json({
      message: 'Expediente creado exitosamente',
      case: createdCase,
      terminosCalculados: deadline.length
    });
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ error: 'Error al crear el expediente' });
  }
});

// GET /cases/:id - Obtener caso específico con términos
router.get('/cases/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const legalCase = await prisma.legalCase.findFirst({
      where: {
        id,
        assignedStudentId: user.userId
      },
      include: {
        deadlines: {
          orderBy: { fechaVencimiento: 'asc' }
        },
        documents: true
      }
    });

    if (!legalCase) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }

    res.json(legalCase);
  } catch (error) {
    console.error('Error fetching case:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /cases/calendar-events - Obtener eventos para el calendario
router.get('/cases/calendar-events', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    // Determinar qué casos mostrar según el rol
    let whereClause: any = {};
    
    if (user.role === 'estudiante') {
      // Estudiante: solo sus casos
      whereClause = { assignedStudentId: user.userId };
    }
    // Profesor y Admin ven todos los casos (sin filtro)

    const cases = await prisma.legalCase.findMany({
      where: whereClause,
      include: {
        deadlines: {
          where: { estado: 'activo' },
          orderBy: { fechaVencimiento: 'asc' }
        }
      }
    });

    // Transformar a formato de eventos de calendario
    const events = cases.flatMap((legalCase) => {
      return legalCase.deadlines.map((deadline) => {
        const fechaVenc = new Date(deadline.fechaVencimiento);
        const hoy = new Date();
        const diasRestantes = Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        
        // Lógica de colores
        let color: string;
        if (diasRestantes < 2) {
          color = '#ef4444'; // Rojo - urgencia máxima
        } else if (diasRestantes < 5) {
          color = '#f59e0b'; // Amarillo - precaución
        } else {
          color = '#10b981'; // Verde - normal
        }

        // Título del evento
        let title = '';
        if (user.role === 'estudiante') {
          title = `${legalCase.radicado} - ${deadline.nombreTermino}`;
        } else {
          // Profesor/Admin ven el nombre del estudiante
          title = `${legalCase.assignedStudentName} - ${legalCase.radicado}`;
        }

        return {
          id: deadline.id,
          title: title,
          start: deadline.fechaVencimiento.toISOString().split('T')[0],
          end: deadline.fechaVencimiento.toISOString().split('T')[0],
          allDay: true,
          color: color,
          extendedProps: {
            area: legalCase.area,
            despacho: legalCase.despacho || 'Por asignar',
            radicado: legalCase.radicado,
            numeroProceso: legalCase.numeroProceso || 'N/A',
            demandante: legalCase.demandante || legalCase.clientName,
            demandado: legalCase.demandado || 'Por definir',
            tipoTermino: deadline.nombreTermino,
            diasRestantes: diasRestantes,
            caseId: legalCase.id,
          }
        };
      });
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /cases/:id/status - Cambiar estado del caso (Fase)
router.patch('/cases/:id/status', authenticateToken, authorizeRoles('profesor', 'administrativo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, observations, highRisk, highRiskReason } = req.body;
    const user = (req as any).user;

    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    const validStatuses = ['Evaluacion', 'Devolucion_estudiante', 'Sustanciacion', 'Revision_del_profesor', 'Aprobado', 'Seguimiento', 'Cerrado'];
    
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    // Buscar el caso
    const existingCase = await prisma.legalCase.findUnique({
      where: { id }
    });

    if (!existingCase) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }

    // Actualizar el caso
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      updateData.statusUpdatedAt = new Date();
      
      // Si se aprueba el caso, agregar firma digital
      if (status === 'Aprobado' || status === 'Seguimiento') {
        const firmaHash = `APROBADO_POR_${user.email}_${new Date().toISOString()}`;
        updateData.firmaDigital = firmaHash;
        updateData.firmaFecha = new Date();
      }
    }
    
    if (highRisk !== undefined) {
      updateData.highRiskAlert = highRisk;
    }
    
    if (highRiskReason !== undefined) {
      updateData.highRiskReason = highRiskReason;
    }

    const updatedCase = await prisma.legalCase.update({
      where: { id },
      data: updateData,
      include: {
        deadlines: true,
        documents: true
      }
    });

    // Registrar en auditLog si hay observaciones o cambio de estado
    if (observations || status) {
      const existingAuditLog = typeof existingCase.auditLog === 'string' 
        ? JSON.parse(existingCase.auditLog) 
        : existingCase.auditLog || [];
      
      const newAuditEntry = {
        date: new Date().toISOString(),
        user: user.email || user.userId,
        action: status === 'Aprobado' ? 'APPROVED' : (status === 'Devolucion_estudiante' ? 'RETURNED' : 'STATUS_CHANGED'),
        details: observations || `Estado cambiado a ${status}`,
        previousStatus: existingCase.status,
        newStatus: status,
      };
      
      await prisma.legalCase.update({
        where: { id },
        data: {
          auditLog: JSON.stringify([newAuditEntry, ...existingAuditLog])
        }
      });
    }

    res.json(updatedCase);
  } catch (error) {
    console.error('Error updating case status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /cases/:id/folders - Obtener carpetas de un caso
router.get('/cases/:id/folders', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    const folders = await prisma.folder.findMany({
      where: { legalCaseId: id },
      include: {
        documents: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /cases/:id/can-edit - Verificar si el estudiante puede editar el caso
router.get('/cases/:id/can-edit', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    const legalCase = await prisma.legalCase.findUnique({
      where: { id }
    });

    if (!legalCase) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }

    // El estudiante solo puede editar si:
    // 1. El caso está en Evaluación o Devolución Y
    // 2. El caso está asignado a ese estudiante
    const isOwner = legalCase.assignedStudentId === user.userId;
    const isInEditablePhase = ['Evaluacion', 'Devolucion_estudiante'].includes(legalCase.status);
    const canEdit = isOwner && isInEditablePhase;

    res.json({ canEdit, status: legalCase.status, isOwner, isInEditablePhase });
  } catch (error) {
    console.error('Error checking edit permission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /notifications - Obtener notificaciones del usuario
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /notifications/:id/read - Marcar notificación como leída
router.patch('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /audit-logs - Obtener logs de auditoría (solo admin/profesor)
router.get('/audit-logs', authenticateToken, authorizeRoles('profesor', 'administrativo'), async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
