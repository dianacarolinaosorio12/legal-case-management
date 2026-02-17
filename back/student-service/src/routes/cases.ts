import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

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

// GET /cases - Listar casos del estudiante
router.get('/cases', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    const cases = await prisma.legalCase.findMany({
      where: {
        assignedStudentId: user.userId
      },
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

    res.json(cases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /cases - Crear nuevo expediente con cálculo automático de términos
router.post('/cases', authenticateToken, async (req, res) => {
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

    // Crear el caso
    const newCase = await prisma.legalCase.create({
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
      await prisma.legalDeadline.create({
        data: {
          legalCaseId: newCase.id,
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
    await prisma.user.update({
      where: { id: user.userId },
      data: { activeCases: { increment: 1 } }
    });

    // Obtener el caso creado con los términos
    const createdCase = await prisma.legalCase.findUnique({
      where: { id: newCase.id },
      include: {
        deadlines: {
          orderBy: { fechaVencimiento: 'asc' }
        }
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

export default router;
