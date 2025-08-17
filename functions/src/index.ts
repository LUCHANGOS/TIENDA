import * as functions from "firebase-functions";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import cors from "cors";
import { 
  encryptInternalEstimates, 
  decryptInternalEstimates,
  encryptFileReference,
  signData,
  validateDataIntegrity,
  generateSecureHash
} from "./utils/encryption";

// Función de prueba simple usando v2
export const helloWorld = onRequest((request, response) => {
  response.json({result: "Hello from NewTonic3D v2!", timestamp: new Date().toISOString()});
});

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
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">NZLAB</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Diseño e Impresión 3D</p>
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
              Gracias por confiar en NZLAB<br>
              <strong>Equipo NZLAB</strong>
            </p>
          </div>
        </div>
        
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            NZLAB - Diseño e Impresión 3D<br>
            📧 soporte@wwwnewtonic.com | 📞 +56 9 2614 3193<br>
            📍 Eleuterio Ramírez 696, Copiapó
          </p>
        </div>
      </div>
    `
  }),

  quoteStatusUpdate: (data: any) => ({
    subject: `📋 Actualización de cotización - ${data.quoteId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">NZLAB</h1>
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
  }),
  
  // Nueva plantilla para confirmación de compra de catálogo
  orderConfirmation: (data: any) => ({
    subject: `🛒 Confirmación de Compra - ${data.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">NewTonic 3D</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Confirmación de Compra</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${data.customerName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            ¡Gracias por tu compra! Hemos recibido tu pedido y estamos procesándolo. 
            A continuación, encontrarás los detalles de tu compra:
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Detalles de tu pedido:</h3>
            <p><strong>Número de pedido:</strong> ${data.orderId}</p>
            <p><strong>Fecha:</strong> ${data.orderDate}</p>
            <p><strong>Total:</strong> $${data.totalAmount.toFixed(2)}</p>
          </div>
          
          <!-- Lista de productos -->
          <div style="border: 1px solid #eee; border-radius: 8px; margin: 20px 0;">
            <div style="background: #f8f9fa; padding: 12px 20px; border-bottom: 1px solid #eee;">
              <h4 style="margin: 0; color: #333;">Productos</h4>
            </div>
            
            <div style="padding: 0;">
              ${data.items.map((item: any) => `
                <div style="padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                  <div>
                    <p style="font-weight: bold; margin: 0 0 5px 0;">${item.product.name}</p>
                    <p style="color: #666; margin: 0; font-size: 14px;">
                      Material: ${item.selectedMaterial.name} | 
                      Color: ${item.selectedColor.name} | 
                      Calidad: ${item.selectedQuality.name}
                    </p>
                    <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Cantidad: ${item.quantity}</p>
                  </div>
                  <div style="text-align: right;">
                    <p style="font-weight: bold; color: #4a5568; margin: 0;">$${item.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div style="background: #f8f9fa; padding: 15px 20px; display: flex; justify-content: space-between;">
              <p style="font-weight: bold; margin: 0;">Total:</p>
              <p style="font-weight: bold; color: #4361ee; margin: 0;">$${data.totalAmount.toFixed(2)}</p>
            </div>
          </div>
          
          <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196F3;">
            <p style="margin: 0; color: #1976D2;">
              <strong>💡 Próximos pasos:</strong><br>
              1. Procesaremos tu pedido<br>
              2. Te enviaremos actualizaciones de estado<br>
              3. Prepararemos tu pedido para entrega
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 20px;">
            Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos 
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
  
  // Nueva plantilla para actualización de estado de pedido de catálogo
  orderStatusUpdate: (data: any) => ({
    subject: `📦 Actualización de Pedido - ${data.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">NewTonic 3D</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Actualización de tu Pedido</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${data.customerName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Tenemos una actualización sobre tu pedido <strong>#${data.orderId}</strong>:
          </p>
          
          <div style="background: ${data.status === 'processing' ? '#fff3e0' : 
                               data.status === 'shipped' ? '#e3f2fd' : 
                               data.status === 'delivered' ? '#e8f5e8' : '#f8f9fa'}; 
                      padding: 20px; border-radius: 8px; margin: 20px 0;
                      border-left: 4px solid ${data.status === 'processing' ? '#ff9800' : 
                                          data.status === 'shipped' ? '#2196f3' : 
                                          data.status === 'delivered' ? '#4caf50' : '#9e9e9e'};">
            <h3 style="margin-top: 0; color: ${data.status === 'processing' ? '#f57c00' : 
                                      data.status === 'shipped' ? '#1976d2' : 
                                      data.status === 'delivered' ? '#2e7d32' : '#616161'};">
              Estado: ${data.status === 'processing' ? '⚙️ En Proceso' : 
                      data.status === 'shipped' ? '🚚 Enviado' : 
                      data.status === 'delivered' ? '✅ Entregado' : 
                      data.status === 'cancelled' ? '❌ Cancelado' : '📋 Actualizado'}
            </h3>
            ${data.estimatedDelivery ? `<p><strong>🗓️ Entrega estimada:</strong> ${data.estimatedDelivery}</p>` : ''}
            ${data.trackingNumber ? `<p><strong>🔍 Número de seguimiento:</strong> ${data.trackingNumber}</p>` : ''}
          </div>
          
          ${data.statusDetails ? `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #333; margin-top: 0;">📝 Detalles:</h4>
              <p style="color: #666; margin: 0;">${data.statusDetails}</p>
            </div>
          ` : ''}
          
          <p style="color: #666; line-height: 1.6; margin-top: 20px;">
            ${data.status === 'processing' ? 
              'Tu pedido está siendo preparado con cuidado. Te avisaremos cuando sea enviado.' :
              data.status === 'shipped' ?
              'Tu pedido ha sido enviado. Puedes hacer seguimiento con el número proporcionado.' :
              data.status === 'delivered' ?
              '¡Tu pedido ha sido entregado! Esperamos que disfrutes tus productos.' :
              'Si tienes alguna pregunta, no dudes en contactarnos.'}
          </p>
          
          <!-- Resumen del pedido -->
          <div style="border: 1px solid #eee; border-radius: 8px; margin: 20px 0;">
            <div style="background: #f8f9fa; padding: 12px 20px; border-bottom: 1px solid #eee;">
              <h4 style="margin: 0; color: #333;">Resumen del Pedido</h4>
            </div>
            <div style="padding: 15px 20px;">
              <p><strong>Número de pedido:</strong> ${data.orderId}</p>
              <p><strong>Fecha:</strong> ${data.orderDate}</p>
              <p><strong>Total:</strong> $${data.totalAmount.toFixed(2)}</p>
              ${data.itemCount ? `<p><strong>Productos:</strong> ${data.itemCount}</p>` : ''}
            </div>
          </div>
          
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
  }),
  
  // Nueva plantilla para notificación a administradores de nueva cotización
  adminQuoteNotification: (data: any) => ({
    subject: `🔔 Nueva Cotización Recibida - ${data.quoteId} de ${data.customerName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔔 ADMIN - NewTonic 3D</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Nueva Cotización Recibida</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Nueva cotización de: ${data.customerName}</h2>
          
          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <h3 style="color: #f57c00; margin-top: 0;">📊 Estimación Automática del Sistema</h3>
            <p><strong>💰 Precio estimado:</strong> $${data.estimatedPrice}</p>
            <p><strong>⏱️ Tiempo de impresión:</strong> ${data.estimatedPrintTime} horas</p>
            <p><strong>📏 Volumen estimado:</strong> ${data.estimatedVolume} cm³</p>
            <p><strong>⚖️ Peso estimado:</strong> ${data.estimatedWeight} gramos</p>
            <p><strong>🚚 Tiempo total (impresión + envío):</strong> ${data.totalDays} días hábiles</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Detalles de la cotización:</h3>
            <p><strong>ID:</strong> ${data.quoteId}</p>
            <p><strong>Cliente:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Teléfono:</strong> ${data.customerPhone || 'No proporcionado'}</p>
            <p><strong>Material:</strong> ${data.material}</p>
            <p><strong>Color:</strong> ${data.color}</p>
            <p><strong>Calidad:</strong> ${data.quality}</p>
            <p><strong>Cantidad:</strong> ${data.quantity}</p>
            <p><strong>Urgencia:</strong> ${data.urgency}</p>
            <p><strong>Archivos:</strong> ${data.fileCount} archivo(s)</p>
            ${data.notes ? `<p><strong>Notas del cliente:</strong> ${data.notes}</p>` : ''}
          </div>
          
          <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196F3;">
            <p style="margin: 0; color: #1976D2;">
              <strong>📋 Acciones recomendadas:</strong><br>
              1. Revisar archivos 3D subidos<br>
              2. Verificar estimación automática<br>
              3. Ajustar precio final según complejidad<br>
              4. Actualizar estado a "Cotizado" para enviar al cliente
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://console.firebase.google.com/project/tienda-de81e/firestore" 
               style="background: #4361ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
               Ver en Panel Admin
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            NewTonic 3D - Sistema de Administración<br>
            📧 Panel de administradores
          </p>
        </div>
      </div>
    `
  })
};

// Función auxiliar para calcular estimaciones de impresión basada en archivos reales
const calculatePrintingEstimate = (fileData: any, material: any, quality: any, color: any, quantity: number) => {
  // Factores base del material
  const materialCostPerGram = material?.pricePerGram || 0.5; // USD por gramo
  const materialDensity = material?.density || 1.2; // g/cm³
  
  // Estimar volumen basado en el tamaño del archivo
  // Un archivo STL típico: 1MB ≈ 50-100 cm³ dependiendo de la complejidad
  let estimatedVolume = 10; // volumen mínimo por defecto
  
  if (fileData && fileData.size) {
    const fileSizeMB = fileData.size / (1024 * 1024);
    // Estimación más realista basada en tamaño de archivo
    estimatedVolume = Math.max(10, fileSizeMB * 75); // Base mínima 10cm³
  }
  
  // Volumen total considerando cantidad
  const totalVolume = estimatedVolume * quantity;
  
  // Calcular peso del material
  const materialWeight = totalVolume * materialDensity;
  
  // Multiplicadores por calidad de impresión
  const qualityMultipliers = {
    'draft': 0.8,
    'standard': 1.0,
    'fine': 1.5,
    'ultrafine': 2.0
  };
  const qualityName = quality?.name?.toLowerCase() || 'standard';
  const qualityMultiplier = qualityMultipliers[qualityName] || 1.0;
  
  // Calcular tiempo de impresión (0.5 horas base por cm³, ajustado por calidad)
  const basePrintTimePerCm3 = 0.5;
  const printTime = totalVolume * basePrintTimePerCm3 * qualityMultiplier;
  
  // Multiplicador por color (recargo porcentual)
  const colorSurcharge = color?.surcharge || 0;
  const colorMultiplier = 1 + (colorSurcharge / 100);
  
  // Calcular costos detallados
  const materialCost = materialWeight * materialCostPerGram;
  const laborCost = printTime * 8; // $8 USD por hora de trabajo
  
  // Aplicar multiplicadores
  const subtotalWithColor = (materialCost + laborCost) * colorMultiplier;
  
  // Margen de ganancia del 20%
  const finalPrice = subtotalWithColor * 1.2;
  
  // Calcular días de entrega
  const printDays = Math.ceil(printTime / 8); // 8 horas de trabajo por día
  const shippingDays = 2; // días de envío
  const totalDays = Math.max(2, printDays + shippingDays); // mínimo 2 días
  
  return {
    estimatedPrice: finalPrice.toFixed(2),
    estimatedPrintTime: printTime.toFixed(1),
    estimatedVolume: totalVolume.toFixed(1),
    estimatedWeight: materialWeight.toFixed(1),
    totalDays: totalDays,
    // Detalles adicionales para el administrador
    breakdown: {
      materialCost: materialCost.toFixed(2),
      laborCost: laborCost.toFixed(2),
      subtotal: (materialCost + laborCost).toFixed(2),
      withColorSurcharge: subtotalWithColor.toFixed(2),
      margin: (finalPrice - subtotalWithColor).toFixed(2)
    }
  };
};

// Función para enviar email de confirmación cuando se recibe una cotización
export const sendQuoteConfirmation = onCall(async (request) => {
  try {
    const data = request.data;
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
    throw new HttpsError('internal', 'Error enviando email');
  }
});

// Función para enviar actualizaciones de estado de cotización
export const sendQuoteStatusUpdate = onCall(async (request) => {
  try {
    const data = request.data;
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
    throw new HttpsError('internal', 'Error enviando email de actualización');
  }
});

// ===================== FUNCIONES PARA PEDIDOS DE CATÁLOGO =====================

// Función para enviar confirmación de pedido de catálogo
export const sendOrderConfirmation = onCall(async (request) => {
  try {
    const data = request.data;
    console.log('📧 Enviando confirmación de pedido:', data.orderId);
    
    const transporter = createTransporter();
    const template = emailTemplates.orderConfirmation(data);
    
    const mailOptions = {
      from: `"NewTonic 3D" <soporte@wwwnewtonic.com>`,
      to: data.customerEmail,
      subject: template.subject,
      html: template.html
    };
    
    await transporter.sendMail(mailOptions);
    
    console.log('✅ Email de confirmación de pedido enviado a:', data.customerEmail);
    return { success: true, message: 'Email de confirmación enviado' };
    
  } catch (error) {
    console.error('❌ Error enviando email de confirmación de pedido:', error);
    throw new HttpsError('internal', 'Error enviando email de confirmación');
  }
});

// Función para enviar actualizaciones de estado de pedido
export const sendOrderStatusUpdate = onCall(async (request) => {
  try {
    const data = request.data;
    console.log('📧 Enviando actualización de pedido:', data.orderId, data.status);
    
    const transporter = createTransporter();
    const template = emailTemplates.orderStatusUpdate(data);
    
    const mailOptions = {
      from: `"NewTonic 3D" <soporte@wwwnewtonic.com>`,
      to: data.customerEmail,
      subject: template.subject,
      html: template.html
    };
    
    await transporter.sendMail(mailOptions);
    
    console.log('✅ Email de actualización de pedido enviado a:', data.customerEmail);
    return { success: true, message: 'Email de actualización de pedido enviado' };
    
  } catch (error) {
    console.error('❌ Error enviando email de actualización de pedido:', error);
    throw new HttpsError('internal', 'Error enviando email de actualización');
  }
});

// ===================== FUNCIONES AUTOMÁTICAS CON TRIGGERS =====================

// Función auxiliar para enviar emails desde triggers
const sendEmailFromTrigger = async (type: string, data: any) => {
  try {
    const transporter = createTransporter();
    let template;
    
    switch (type) {
      case 'quote_received':
        template = emailTemplates.quoteReceived(data);
        break;
      case 'quote_status_update':
        template = emailTemplates.quoteStatusUpdate(data);
        break;
      case 'order_confirmation':
        template = emailTemplates.orderConfirmation(data);
        break;
      case 'order_status_update':
        template = emailTemplates.orderStatusUpdate(data);
        break;
      default:
        throw new Error('Tipo de email no válido');
    }
    
    const mailOptions = {
      from: `"NewTonic 3D" <soporte@wwwnewtonic.com>`,
      to: data.customerEmail,
      subject: template.subject,
      html: template.html
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado a:', data.customerEmail);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw error;
  }
};

// Trigger automático: Enviar email cuando se crea una cotización
export const onQuoteCreated = onDocumentCreated('quotes/{quoteId}', async (event) => {
    try {
      const quote = event.data?.data();
      const quoteId = event.params?.quoteId;
      if (!quote || !quoteId) {
        console.error('❌ No se pudo obtener los datos de la cotización');
        return null;
      }
      console.log('🔔 Nueva cotización creada:', quoteId);
      
      // Calcular estimaciones automáticas
      const estimates = calculatePrintingEstimate(
        quote.files?.[0] || {}, // Usar el primer archivo como referencia
        quote.material,
        quote.quality,
        quote.color,
        quote.quantity || 1
      );
      
      // Preparar datos de estimaciones internas con información completa
      const internalEstimatesData = {
        price: parseFloat(estimates.estimatedPrice),
        printTime: parseFloat(estimates.estimatedPrintTime),
        volume: parseFloat(estimates.estimatedVolume),
        weight: parseFloat(estimates.estimatedWeight),
        totalDays: estimates.totalDays,
        materialCost: parseFloat(estimates.breakdown.materialCost),
        laborCost: parseFloat(estimates.breakdown.laborCost),
        calculatedAt: Date.now(),
        quoteId: quoteId,
        breakdown: estimates.breakdown
      };
      
      // Cifrar las estimaciones internas para máxima seguridad
      const encryptedEstimates = encryptInternalEstimates(internalEstimatesData);
      
      // Generar firma digital para integridad
      const dataSignature = signData(internalEstimatesData);
      
      // Actualizar el documento con datos cifrados
      await event.data.ref.update({
        // Estimaciones cifradas - solo el admin puede descifrarlas
        _internalEstimates: encryptedEstimates,
        _dataSignature: dataSignature,
        _securityLevel: 'encrypted',
        _lastCalculated: admin.firestore.FieldValue.serverTimestamp()
        // NO se guarda estimatedPrice visible al cliente
      });
      
      console.log('📊 Estimaciones calculadas y guardadas:', estimates);
      
      // Datos para email de confirmación al cliente (SIN PRECIO)
      const customerEmailData = {
        quoteId: quoteId,
        customerName: quote.name,
        customerEmail: quote.email,
        material: quote.material.name,
        quality: quote.quality.name,
        color: quote.color?.name || 'No especificado',
        quantity: quote.quantity,
        urgency: quote.urgency,
        fileCount: quote.files?.length || 0
      };
      
      // Datos para notificación a administradores (CON ESTIMACIONES)
      const adminEmailData = {
        quoteId: quoteId,
        customerName: quote.name,
        customerEmail: quote.email,
        customerPhone: quote.phone,
        material: quote.material.name,
        quality: quote.quality.name,
        color: quote.color?.name || 'No especificado',
        quantity: quote.quantity,
        urgency: quote.urgency,
        fileCount: quote.files?.length || 0,
        notes: quote.notes,
        estimatedPrice: estimates.estimatedPrice,
        estimatedPrintTime: estimates.estimatedPrintTime,
        estimatedVolume: estimates.estimatedVolume,
        estimatedWeight: estimates.estimatedWeight,
        totalDays: estimates.totalDays
      };
      
      // Enviar email de confirmación al cliente
      try {
        await sendEmailFromTrigger('quote_received', customerEmailData);
        console.log('✅ Email de confirmación enviado al cliente');
      } catch (error) {
        console.error('❌ Error enviando email al cliente:', error);
      }
      
      // Enviar notificación a administradores
      try {
        const transporter = createTransporter();
        const adminTemplate = emailTemplates.adminQuoteNotification(adminEmailData);
        
        // Lista de emails de administradores (puedes configurar esto en Firebase Config)
        const adminEmails = [
          'soporte@wwwnewtonic.com',
          'info@wwwnewtonic.com',
          'admin@wwwnewtonic.com'
          // Agregar más emails de administradores según sea necesario
        ];
        
        for (const adminEmail of adminEmails) {
          const adminMailOptions = {
            from: `"NewTonic 3D System" <noreply@wwwnewtonic.com>`,
            to: adminEmail,
            subject: adminTemplate.subject,
            html: adminTemplate.html
          };
          
          await transporter.sendMail(adminMailOptions);
          console.log('✅ Notificación enviada al admin:', adminEmail);
        }
        
        console.log('✅ Todas las notificaciones de administradores enviadas');
        
      } catch (error) {
        console.error('❌ Error enviando notificaciones a administradores:', error);
      }
      
      return { success: true, estimates };
      
    } catch (error) {
      console.error('❌ Error en trigger de cotización:', error);
      return null;
    }
  });

// Trigger automático: Enviar email cuando se actualiza el estado de una cotización
export const onQuoteUpdated = onDocumentUpdated('quotes/{quoteId}', async (event) => {
    try {
      const before = event.data?.before.data();
      const after = event.data?.after.data();
      const quoteId = event.params?.quoteId;
      
      if (!before || !after || !quoteId) {
        console.error('❌ No se pudieron obtener los datos del documento');
        return null;
      }
      
      // Solo enviar si el estado cambió
      if (before.status !== after.status) {
        console.log('🔔 Estado de cotización actualizado:', quoteId, after.status);
        
        const emailData = {
          quoteId: quoteId,
          customerName: after.name,
          customerEmail: after.email,
          status: after.status,
          estimatedPrice: after.estimatedPrice,
          estimatedDays: after.estimatedDays,
          adminNotes: after.adminNotes
        };
        
        // Enviar email de actualización
        const result = await sendEmailFromTrigger('quote_status_update', emailData);
        console.log('✅ Email automático de actualización enviado');
        
        return result;
      }
      
      return null; // No se cambió el estado
      
    } catch (error) {
      console.error('❌ Error en trigger de actualización de cotización:', error);
      return null;
    }
  });

// Trigger automático: Enviar email cuando se crea un pedido
export const onOrderCreated = onDocumentCreated('orders/{orderId}', async (event) => {
    try {
      const order = event.data?.data();
      const orderId = event.params?.orderId;
      
      if (!order || !orderId) {
        console.error('❌ No se pudieron obtener los datos del pedido');
        return null;
      }
      
      console.log('🔔 Nuevo pedido creado:', orderId);
      
      const emailData = {
        orderId: orderId,
        customerName: order.customerInfo.name,
        customerEmail: order.customerInfo.email,
        orderDate: new Date(order.createdAt).toLocaleDateString('es-ES'),
        totalAmount: order.totalAmount,
        items: order.items
      };
      
      // Enviar email de confirmación
      const result = await sendEmailFromTrigger('order_confirmation', emailData);
      console.log('✅ Email automático de pedido enviado');
      
      return result;
      
    } catch (error) {
      console.error('❌ Error en trigger de pedido:', error);
      return null;
    }
  });

// Trigger automático: Enviar email cuando se actualiza el estado de un pedido
export const onOrderUpdated = onDocumentUpdated('orders/{orderId}', async (event) => {
    try {
      const before = event.data?.before.data();
      const after = event.data?.after.data();
      const orderId = event.params?.orderId;
      
      if (!before || !after || !orderId) {
        console.error('❌ No se pudieron obtener los datos del documento');
        return null;
      }
      
      // Solo enviar si el estado cambió
      if (before.status !== after.status) {
        console.log('🔔 Estado de pedido actualizado:', orderId, after.status);
        
        const emailData = {
          orderId: orderId,
          customerName: after.customerInfo.name,
          customerEmail: after.customerInfo.email,
          status: after.status,
          orderDate: new Date(after.createdAt).toLocaleDateString('es-ES'),
          totalAmount: after.totalAmount,
          itemCount: after.items.length,
          estimatedDelivery: after.estimatedDelivery,
          trackingNumber: after.trackingNumber,
          statusDetails: after.statusDetails
        };
        
        // Enviar email de actualización
        const result = await sendEmailFromTrigger('order_status_update', emailData);
        console.log('✅ Email automático de actualización de pedido enviado');
        
        return result;
      }
      
      return null; // No se cambió el estado
      
    } catch (error) {
      console.error('❌ Error en trigger de actualización de pedido:', error);
      return null;
    }
  });

// ===================== FUNCIONES SEGURAS PARA ADMINISTRADORES =====================

// Función segura para descifrar estimaciones internas (solo para administradores)
export const decryptQuoteEstimates = onCall({
  enforceAppCheck: true, // Verificar que la llamada venga de la app
}, async (request) => {
  try {
    const { quoteId } = request.data;
    const userAuth = request.auth;
    
    // Verificar que el usuario esté autenticado
    if (!userAuth) {
      throw new HttpsError('unauthenticated', 'Usuario no autenticado');
    }
    
    // Verificar que el usuario sea administrador
    const userDoc = await admin.firestore().collection('adminUsers').doc(userAuth.uid).get();
    if (!userDoc.exists || !userDoc.data()?.role) {
      throw new HttpsError('permission-denied', 'Acceso denegado: no es administrador');
    }
    
    console.log('🔓 Descifrado autorizado para admin:', userAuth.uid, 'Quote:', quoteId);
    
    // Obtener la cotización
    const quoteDoc = await admin.firestore().collection('quotes').doc(quoteId).get();
    if (!quoteDoc.exists) {
      throw new HttpsError('not-found', 'Cotización no encontrada');
    }
    
    const quoteData = quoteDoc.data();
    if (!quoteData?._internalEstimates) {
      throw new HttpsError('not-found', 'No hay estimaciones cifradas');
    }
    
    // Validar integridad de los datos
    if (quoteData._dataSignature) {
      // Descifrar primero para validar
      const decryptedData = decryptInternalEstimates(quoteData._internalEstimates);
      const isValid = validateDataIntegrity(decryptedData, quoteData._dataSignature);
      
      if (!isValid) {
        console.error('❌ Integridad de datos comprometida para quote:', quoteId);
        throw new HttpsError('data-loss', 'La integridad de los datos ha sido comprometida');
      }
      
      console.log('✅ Integridad de datos verificada para quote:', quoteId);
      return { 
        success: true, 
        estimates: decryptedData,
        securityLevel: quoteData._securityLevel,
        lastCalculated: quoteData._lastCalculated
      };
    } else {
      // Datos sin firma - descifrar de todos modos pero advertir
      console.warn('⚠️ Datos sin firma digital para quote:', quoteId);
      const decryptedData = decryptInternalEstimates(quoteData._internalEstimates);
      
      return { 
        success: true, 
        estimates: decryptedData,
        warning: 'Datos sin verificación de integridad',
        securityLevel: quoteData._securityLevel || 'unknown',
        lastCalculated: quoteData._lastCalculated
      };
    }
    
  } catch (error) {
    console.error('❌ Error descifrando estimaciones:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Error procesando estimaciones cifradas');
  }
});

// Función segura para generar URLs de archivos temporales
export const generateSecureFileUrl = onCall({
  enforceAppCheck: true,
}, async (request) => {
  try {
    const { quoteId, fileName } = request.data;
    const userAuth = request.auth;
    
    // Verificar autenticación y permisos de admin
    if (!userAuth) {
      throw new HttpsError('unauthenticated', 'Usuario no autenticado');
    }
    
    const userDoc = await admin.firestore().collection('adminUsers').doc(userAuth.uid).get();
    if (!userDoc.exists || !userDoc.data()?.role) {
      throw new HttpsError('permission-denied', 'Acceso denegado');
    }
    
    // Generar URL segura temporal (2 horas)
    const fileReference = encryptFileReference({
      storagePath: `quotes/${quoteId}/${fileName}`,
      originalName: fileName,
      quoteId: quoteId
    });
    
    // Generar hash seguro para la URL
    const secureToken = generateSecureHash(`${quoteId}-${fileName}-${userAuth.uid}`);
    
    console.log('🔗 URL segura generada para admin:', userAuth.uid, 'File:', fileName);
    
    return {
      success: true,
      encryptedReference: fileReference,
      secureToken: secureToken,
      expiresIn: '2 hours'
    };
    
  } catch (error) {
    console.error('❌ Error generando URL segura:', error);
    throw new HttpsError('internal', 'Error generando URL de archivo');
  }
});

// ===================== FUNCIÓN HTTP GENERAL =====================

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
        case 'order_confirmation':
          template = emailTemplates.orderConfirmation(data);
          break;
        case 'order_status_update':
          template = emailTemplates.orderStatusUpdate(data);
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
