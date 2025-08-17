import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import cors from "cors";

// Inicializar Firebase Admin
admin.initializeApp();

// Configurar CORS
const corsHandler = cors({ origin: true });

// Configuración del transportador de email
const createTransporter = () => {
  // Para usar Gmail SMTP (recomendado para producción)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: functions.config().email?.user || 'soporte@wwwnewtonic.com',
      pass: functions.config().email?.password || 'your-app-password'
    }
  });
};

// Plantillas de email
const emailTemplates = {
  quoteReceived: (data: any) => ({
    subject: `✅ Cotización recibida - ${data.quoteId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">NewTonic 3D</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Impresión 3D Profesional</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${data.customerName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hemos recibido tu solicitud de cotización y nuestro equipo ya está revisando los detalles. 
            Te responderemos en un plazo máximo de 24 horas.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Detalles de tu cotización:</h3>
            <p><strong>ID de cotización:</strong> ${data.quoteId}</p>
            <p><strong>Material:</strong> ${data.material}</p>
            <p><strong>Calidad:</strong> ${data.quality}</p>
            <p><strong>Cantidad:</strong> ${data.quantity}</p>
            <p><strong>Urgencia:</strong> ${data.urgency}</p>
            <p><strong>Archivos:</strong> ${data.fileCount} archivo(s)</p>
          </div>
          
          <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196F3;">
            <p style="margin: 0; color: #1976D2;">
              <strong>💡 Próximos pasos:</strong><br>
              1. Analizaremos tus archivos 3D<br>
              2. Calcularemos tiempo y costos<br>
              3. Te enviaremos una cotización detallada
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 20px;">
            Si tienes alguna pregunta o necesitas modificar algo, no dudes en contactarnos 
            respondiendo a este correo.
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 14px;">
              Gracias por confiar en NewTonic 3D<br>
              <strong>Equipo NewTonic 3D</strong>
            </p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            NewTonic 3D - Impresión 3D Profesional<br>
            📧 soporte@wwwnewtonic.com | 🌐 www.newtonic3d.com
          </p>
        </div>
      </div>
    `
  }),

  quoteStatusUpdate: (data: any) => ({
    subject: `📋 Actualización de cotización - ${data.quoteId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">NewTonic 3D</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Actualización de tu cotización</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${data.customerName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Tenemos una actualización sobre tu cotización <strong>${data.quoteId}</strong>:
          </p>
          
          <div style="background: ${data.status === 'quoted' ? '#e8f5e8' : data.status === 'accepted' ? '#e3f2fd' : '#fff3e0'}; 
                      padding: 20px; border-radius: 8px; margin: 20px 0;
                      border-left: 4px solid ${data.status === 'quoted' ? '#4caf50' : data.status === 'accepted' ? '#2196f3' : '#ff9800'};">
            <h3 style="margin-top: 0; color: ${data.status === 'quoted' ? '#2e7d32' : data.status === 'accepted' ? '#1976d2' : '#f57c00'};">
              Estado: ${data.status === 'quoted' ? '✅ Cotización Lista' : 
                       data.status === 'accepted' ? '🎉 Cotización Aceptada' : 
                       data.status === 'processing' ? '⚙️ En Proceso' : '📋 Actualizada'}
            </h3>
            ${data.estimatedPrice ? `<p><strong>💰 Precio estimado:</strong> $${data.estimatedPrice}</p>` : ''}
            ${data.estimatedDays ? `<p><strong>⏱️ Tiempo estimado:</strong> ${data.estimatedDays} días</p>` : ''}
          </div>
          
          ${data.adminNotes ? `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #333; margin-top: 0;">📝 Notas del equipo:</h4>
              <p style="color: #666; margin: 0;">${data.adminNotes}</p>
            </div>
          ` : ''}
          
          <p style="color: #666; line-height: 1.6; margin-top: 20px;">
            ${data.status === 'quoted' ? 
              'Tu cotización está lista. Revisa los detalles y confírmanos si deseas proceder.' :
              data.status === 'processing' ?
              'Hemos comenzado a trabajar en tu proyecto. Te mantendremos informado del progreso.' :
              'Si tienes alguna pregunta, no dudes en contactarnos.'
            }
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 14px;">
              <strong>Equipo NewTonic 3D</strong><br>
              Siempre a tu servicio
            </p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            NewTonic 3D - Impresión 3D Profesional<br>
            📧 soporte@wwwnewtonic.com | 🌐 www.newtonic3d.com
          </p>
        </div>
      </div>
    `
  })
};

// Función para enviar email de confirmación cuando se recibe una cotización
export const sendQuoteConfirmation = functions.https.onCall(async (data, context) => {
  try {
    console.log('📧 Enviando confirmación de cotización:', data.quoteId);
    
    const transporter = createTransporter();
    const template = emailTemplates.quoteReceived(data);
    
    const mailOptions = {
      from: `"NewTonic 3D" <soporte@wwwnewtonic.com>`,
      to: data.customerEmail,
      subject: template.subject,
      html: template.html
    };
    
    await transporter.sendMail(mailOptions);
    
    console.log('✅ Email de confirmación enviado a:', data.customerEmail);
    return { success: true, message: 'Email enviado correctamente' };
    
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw new functions.https.HttpsError('internal', 'Error enviando email');
  }
});

// Función para enviar actualizaciones de estado de cotización
export const sendQuoteStatusUpdate = functions.https.onCall(async (data, context) => {
  try {
    console.log('📧 Enviando actualización de estado:', data.quoteId, data.status);
    
    const transporter = createTransporter();
    const template = emailTemplates.quoteStatusUpdate(data);
    
    const mailOptions = {
      from: `"NewTonic 3D" <soporte@wwwnewtonic.com>`,
      to: data.customerEmail,
      subject: template.subject,
      html: template.html
    };
    
    await transporter.sendMail(mailOptions);
    
    console.log('✅ Email de actualización enviado a:', data.customerEmail);
    return { success: true, message: 'Email de actualización enviado' };
    
  } catch (error) {
    console.error('❌ Error enviando email de actualización:', error);
    throw new functions.https.HttpsError('internal', 'Error enviando email de actualización');
  }
});

// Función HTTP para envío de emails (alternativa para casos específicos)
export const sendEmail = functions.https.onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).send('Method Not Allowed');
        return;
      }
      
      const { type, data } = request.body;
      
      const transporter = createTransporter();
      let template;
      
      switch (type) {
        case 'quote_received':
          template = emailTemplates.quoteReceived(data);
          break;
        case 'quote_status_update':
          template = emailTemplates.quoteStatusUpdate(data);
          break;
        default:
          response.status(400).send('Invalid email type');
          return;
      }
      
      const mailOptions = {
        from: `"NewTonic 3D" <soporte@wwwnewtonic.com>`,
        to: data.customerEmail,
        subject: template.subject,
        html: template.html
      };
      
      await transporter.sendMail(mailOptions);
      
      response.json({ success: true, message: 'Email enviado correctamente' });
      
    } catch (error) {
      console.error('❌ Error:', error);
      response.status(500).json({ success: false, error: 'Error enviando email' });
    }
  });
});
