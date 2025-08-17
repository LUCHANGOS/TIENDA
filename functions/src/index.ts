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

// ===================== FUNCIONES PARA PEDIDOS DE CATÁLOGO =====================

// Función para enviar confirmación de pedido de catálogo
export const sendOrderConfirmation = functions.https.onCall(async (data, context) => {
  try {
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
    throw new functions.https.HttpsError('internal', 'Error enviando email de confirmación');
  }
});

// Función para enviar actualizaciones de estado de pedido
export const sendOrderStatusUpdate = functions.https.onCall(async (data, context) => {
  try {
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
    throw new functions.https.HttpsError('internal', 'Error enviando email de actualización');
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
export const onQuoteCreated = functions.firestore
  .document('quotes/{quoteId}')
  .onCreate(async (snapshot, context) => {
    try {
      const quote = snapshot.data();
      console.log('🔔 Nueva cotización creada:', context.params.quoteId);
      
      const emailData = {
        quoteId: context.params.quoteId,
        customerName: quote.name,
        customerEmail: quote.email,
        material: quote.material.name,
        quality: quote.quality.name,
        quantity: quote.quantity,
        urgency: quote.urgency,
        fileCount: quote.files?.length || 0
      };
      
      // Enviar email de confirmación
      const result = await sendEmailFromTrigger('quote_received', emailData);
      console.log('✅ Email automático de cotización enviado');
      
      return result;
      
    } catch (error) {
      console.error('❌ Error en trigger de cotización:', error);
      return null;
    }
  });

// Trigger automático: Enviar email cuando se actualiza el estado de una cotización
export const onQuoteUpdated = functions.firestore
  .document('quotes/{quoteId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();
      
      // Solo enviar si el estado cambió
      if (before.status !== after.status) {
        console.log('🔔 Estado de cotización actualizado:', context.params.quoteId, after.status);
        
        const emailData = {
          quoteId: context.params.quoteId,
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
export const onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snapshot, context) => {
    try {
      const order = snapshot.data();
      console.log('🔔 Nuevo pedido creado:', context.params.orderId);
      
      const emailData = {
        orderId: context.params.orderId,
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
export const onOrderUpdated = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();
      
      // Solo enviar si el estado cambió
      if (before.status !== after.status) {
        console.log('🔔 Estado de pedido actualizado:', context.params.orderId, after.status);
        
        const emailData = {
          orderId: context.params.orderId,
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
