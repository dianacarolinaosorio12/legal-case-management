import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Configurar dotenv para leer desde la raíz
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.DOCUMENT_PORT || 3003;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// ============================================
// RUTAS DE DOCUMENTOS
// ============================================

// GET /documents - Listar todos los documentos
app.get('/documents', async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /documents/case/:caseId - Documentos por caso
app.get('/documents/case/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params;
    const documents = await prisma.document.findMany({
      where: { caseId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /documents - Subir documento (mock - solo guarda metadatos)
app.post('/documents', async (req, res) => {
  try {
    const { fileName, fileType, fileSize, caseId, uploadedBy, description } = req.body;
    
    const document = await prisma.document.create({
      data: {
        fileName,
        fileType,
        fileSize,
        caseId,
        uploadedBy,
        description,
        s3Key: `uploads/${caseId}/${fileName}`, // Mock S3 key
        status: 'active'
      }
    });
    
    res.json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /documents/:id - Eliminar documento
app.delete('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.document.delete({
      where: { id }
    });
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'document-service' });
});

app.listen(PORT, () => {
  console.log(`Document service running on port ${PORT}`);
});

export default app;