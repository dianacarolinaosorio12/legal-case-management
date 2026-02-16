// ============================================
// Notify Service Adapter - SICOP
// Este archivo es un ADAPTER que permite extraer
// fácilmente la lógica de notificaciones a un 
// microservicio independiente en el futuro.
// ============================================

import nodemailer from 'nodemailer';

// ============================================
// CONFIGURACIÓN (se migrará a config-service)
// ============================================

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

const getEmailConfig = (): EmailConfig => ({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
});

// ============================================
// TRANSPORTER (inyectable para testing)
// ============================================

let transporter: nodemailer.Transporter | null = null;

export const initializeTransporter = (): nodemailer.Transporter => {
  if (transporter) return transporter;

  const config = getEmailConfig();
  
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  return transporter;
};

export const getTransporter = (): nodemailer.Transporter => {
  if (!transporter) {
    return initializeTransporter();
  }
  return transporter;
};

// ============================================
// SERVICIO DE EMAIL
// ============================================

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<boolean> => {
  try {
    const transporter = getTransporter();
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Recuperación de Contraseña - SICOP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Recuperación de Contraseña</h2>
          <p>Hola,</p>
          <p>Has solicitado recuperar tu contraseña en el sistema SICOP.</p>
          <p>Haz clic en el siguiente enlace para establecer una nueva contraseña:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Restablecer Contraseña</a>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Sistema de Gestión de Casos Legales - SICOP</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de recuperación enviado a: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return false;
  }
};

// ============================================
// INTERFAZ PARA RABBITMQ (Futuro)
// ============================================

/*
// ============================================
// RABBITMQ EVENT PUBLISHER (COMENTADO - Para futuro)
// ============================================

// Cuando se implemente el Broker de Mensajería, 
// descomenta este código y configura RabbitMQ:

import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE = 'sicop.notifications';

export interface NotificationEvent {
  type: 'PASSWORD_RESET' | 'WELCOME' | 'CASE_ASSIGNED' | 'CASE_UPDATE';
  to: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export const publishNotificationEvent = async (event: NotificationEvent): Promise<void> => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    
    channel.publish(
      EXCHANGE,
      event.type,
      Buffer.from(JSON.stringify(event)),
      { 
        persistent: true,
        contentType: 'application/json'
      }
    );
    
    console.log(`📤 Event published: ${event.type}`);
    await connection.close();
  } catch (error) {
    console.error('❌ Error publishing to RabbitMQ:', error);
    // Fallback: enviar directamente
    if (event.type === 'PASSWORD_RESET') {
      await sendPasswordResetEmail(event.to, event.data.resetToken as string);
    }
  }
};

// Ejemplo de uso en auth routes:
// await publishNotificationEvent({
//   type: 'PASSWORD_RESET',
//   to: email,
//   data: { resetToken, resetUrl },
//   timestamp: new Date().toISOString()
// });
*/

// Por ahora, exportamos el servicio de email directamente
export const notifyService = {
  sendPasswordReset: sendPasswordResetEmail,
};

export default notifyService;