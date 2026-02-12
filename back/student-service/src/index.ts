import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { resolve } from 'path';
import casesRoutes from './routes/cases';

dotenv.config({ path: resolve(__dirname, '../../.env') });

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use('/', casesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'student-service' });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to database');
    
    app.listen(PORT, () => {
      console.log(`Student service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();