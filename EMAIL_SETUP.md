# 📧 Configuración de Sistema de Emails - NewTonic3D

Este documento describe cómo configurar el sistema de envío de emails automáticos desde **soporte@wwwnewtonic.com** para las cotizaciones de NewTonic3D.

## 🚀 Funcionalidades Implementadas

### ✅ Emails Automáticos
1. **Email de Confirmación**: Se envía automáticamente cuando un cliente envía una cotización
2. **Email de Actualización**: Se envía cuando el admin cambia el estado de una cotización

### 📧 Plantillas de Email
- **Diseño profesional** con branding de NewTonic3D
- **Responsive** para móviles y desktop
- **Información detallada** de la cotización
- **Estados con colores** para fácil identificación

## 🛠️ Configuración Requerida

### 1. Instalar Dependencias de Functions

```bash
cd functions
npm install
```

### 2. Configurar Credenciales de Email

Para usar Gmail SMTP, necesitas configurar las credenciales:

```bash
# Configurar email y contraseña de aplicación
firebase functions:config:set email.user="soporte@wwwnewtonic.com"
firebase functions:config:set email.password="tu-password-de-aplicacion"
```

⚠️ **IMPORTANTE**: Debes generar una "Contraseña de Aplicación" en Gmail:
1. Ve a [Google Account Settings](https://myaccount.google.com/)
2. Activa la autenticación de dos factores
3. Ve a "Contraseñas de aplicaciones"
4. Genera una nueva contraseña para "Otra aplicación"
5. Usa esa contraseña en la configuración

### 3. Desplegar Functions

```bash
# Compilar y desplegar
npm run build
firebase deploy --only functions
```

### 4. Verificar Despliegue

Después del despliegue, verifica que las funciones estén activas:

```bash
firebase functions:log
```

## 📋 Funciones Disponibles

### `sendQuoteConfirmation`
- **Trigger**: Se ejecuta automáticamente al crear una cotización
- **Parámetros**: 
  - `quoteId`: ID único de la cotización
  - `customerName`: Nombre del cliente
  - `customerEmail`: Email del cliente
  - `material`: Material seleccionado
  - `quality`: Calidad seleccionada
  - `quantity`: Cantidad
  - `urgency`: Nivel de urgencia
  - `fileCount`: Número de archivos

### `sendQuoteStatusUpdate`
- **Trigger**: Se ejecuta automáticamente al actualizar estado de cotización
- **Parámetros**:
  - `quoteId`: ID único de la cotización
  - `customerName`: Nombre del cliente
  - `customerEmail`: Email del cliente
  - `status`: Nuevo estado de la cotización
  - `estimatedPrice`: Precio estimado (opcional)
  - `estimatedDays`: Días estimados (opcional)
  - `adminNotes`: Notas del administrador (opcional)

## 🎨 Plantillas de Email

### Email de Confirmación
- **Asunto**: "✅ Cotización recibida - [ID]"
- **Contenido**: 
  - Saludo personalizado
  - Detalles de la cotización
  - Próximos pasos
  - Información de contacto

### Email de Actualización
- **Asunto**: "📋 Actualización de cotización - [ID]"
- **Contenido**:
  - Estado actualizado con colores
  - Precio y tiempo estimado (si aplica)
  - Notas del equipo
  - Instrucciones según el estado

## 🔧 Configuración Alternativa (Otros Proveedores)

Si prefieres usar otro proveedor de email, modifica el archivo `functions/src/index.ts`:

```typescript
// Para SendGrid
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'SendGrid',
    auth: {
      user: 'apikey',
      pass: functions.config().sendgrid?.api_key
    }
  });
};

// Para Outlook/Hotmail
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'hotmail',
    auth: {
      user: functions.config().email?.user,
      pass: functions.config().email?.password
    }
  });
};
```

## 🐛 Troubleshooting

### Error: "Authentication failed"
- Verifica que uses una contraseña de aplicación, no la contraseña regular
- Asegúrate de que la autenticación de dos factores esté activada

### Error: "Functions not deploying"
- Verifica que Firebase CLI esté actualizado: `npm install -g firebase-tools`
- Asegúrate de estar en el directorio correcto
- Verifica que tengas permisos de administrador en el proyecto

### Emails no se envían
- Revisa los logs: `firebase functions:log`
- Verifica la configuración: `firebase functions:config:get`
- Prueba las funciones localmente: `npm run serve`

## 📊 Monitoreo

### Ver Logs en Tiempo Real
```bash
firebase functions:log --only sendQuoteConfirmation,sendQuoteStatusUpdate
```

### Métricas en Firebase Console
1. Ve a Firebase Console → Functions
2. Revisa métricas de ejecución
3. Verifica errores y rendimiento

## 🚀 Próximos Pasos

1. **Configurar credenciales de email**
2. **Desplegar las funciones**
3. **Probar con una cotización real**
4. **Verificar que los emails lleguen correctamente**
5. **Configurar monitoreo de errores**

## 📞 Soporte

Si necesitas ayuda con la configuración:
- Revisa los logs de Firebase Functions
- Verifica la configuración de credenciales
- Contacta al equipo de desarrollo

---

**¡El sistema está listo para enviar emails profesionales desde soporte@wwwnewtonic.com! 🎉**
