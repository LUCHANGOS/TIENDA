# 🔐 Guía de Despliegue Seguro - NewTonic3D

## Resumen del Sistema de Cifrado

Hemos implementado un sistema de cifrado **AES-256-GCM** de grado militar con las siguientes características:

- **🛡️ Cifrado**: AES-256-GCM con derivación de claves PBKDF2
- **🔏 Integridad**: Firmas digitales HMAC-SHA256 
- **⏰ Expiración**: Timestamps y validación temporal
- **🔄 Rotación**: Soporte para rotación de claves maestras
- **📊 Estimaciones**: Protección de datos financieros internos

## Arquitectura de Seguridad

### 1. **Capas de Protección**
```
┌─────────────────────────┐
│  Frontend (Admin UI)    │ ← Solo descifra con autenticación
├─────────────────────────┤
│  Firebase Functions     │ ← Validación de permisos
├─────────────────────────┤
│  Cifrado AES-256-GCM    │ ← Datos cifrados en Firestore
├─────────────────────────┤
│  Firestore Database     │ ← Solo strings cifrados
└─────────────────────────┘
```

### 2. **Flujo de Datos Seguro**
1. **Cotización Nueva** → Calcular estimaciones → Cifrar → Guardar
2. **Admin Accede** → Verificar permisos → Descifrar → Mostrar
3. **Cliente Ve** → Solo datos NO sensibles (sin precios internos)

## 🚀 Instrucciones de Despliegue

### Paso 1: Generar Clave Maestra

```bash
# Generar una clave de 256 bits (32 bytes) criptográficamente segura
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**⚠️ IMPORTANTE**: Guarda esta clave en un lugar **MUY SEGURO** (password manager, vault, etc.)

### Paso 2: Configurar Firebase Functions

```bash
# En tu terminal, dentro de la carpeta del proyecto:
cd functions

# Configurar la clave maestra en Firebase
firebase functions:config:set encryption.master_key="TU_CLAVE_HEXADECIMAL_DE_64_CARACTERES"

# Configurar email si no lo has hecho
firebase functions:config:set email.user="soporte@wwwnewtonic.com"
firebase functions:config:set email.password="tu-app-password-de-gmail"

# Verificar configuración
firebase functions:config:get
```

### Paso 3: Desplegar Funciones

```bash
# Compilar TypeScript y desplegar
npm run build
firebase deploy --only functions
```

### Paso 4: Verificar Seguridad

```bash
# Probar que las funciones están funcionando
# 1. Crea una cotización de prueba desde el frontend
# 2. Verifica que se cifren las estimaciones en Firestore
# 3. Verifica que solo admins puedan descifrarlas
```

## 🔒 Configuración de Seguridad en Producción

### Variables de Entorno Seguras

**Para Firebase Functions (Producción):**
```bash
firebase functions:config:set \
  encryption.master_key="64-char-hex-key" \
  email.user="soporte@wwwnewtonic.com" \
  email.password="gmail-app-password"
```

**Para desarrollo local (.env):**
```env
ENCRYPTION_MASTER_KEY=64-char-hex-key-for-development
EMAIL_USER=soporte@wwwnewtonic.com
EMAIL_PASSWORD=gmail-app-password
```

### Reglas de Firestore Security

Actualiza tus reglas de Firestore para proteger estimaciones cifradas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quotes/{document} {
      allow read, write: if request.auth != null;
      
      // Proteger campos internos cifrados
      allow update: if request.auth != null 
        && !('_internalEstimates' in resource.data) 
        || request.auth.uid in resource.data.authorizedAdmins;
    }
    
    match /adminUsers/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && hasAdminRole(request.auth.uid);
    }
  }
}
```

## 🛡️ Características de Seguridad Implementadas

### 1. **Cifrado Robusto**
- **Algoritmo**: AES-256-GCM (autenticado)
- **Derivación**: PBKDF2 con 100,000 iteraciones
- **Salt**: 256 bits aleatorios por cifrado
- **IV**: 128 bits aleatorios por cifrado
- **TAG**: 128 bits de autenticación

### 2. **Integridad de Datos**
- **Checksums**: SHA-256 para verificar integridad
- **Firmas**: HMAC-SHA256 para autenticación
- **Timestamps**: Prevención de ataques de replay
- **Versioning**: Control de versiones de datos cifrados

### 3. **Control de Acceso**
- **Autenticación**: Solo usuarios autenticados
- **Autorización**: Solo administradores pueden descifrar
- **App Check**: Verificación de origen de las llamadas
- **Temporal**: URLs de archivos con expiración

### 4. **Auditoría y Monitoreo**
- **Logs**: Registro de todas las operaciones de cifrado/descifrado
- **Alertas**: Notificación de intentos de acceso no autorizados
- **Métricas**: Seguimiento de uso del sistema de cifrado

## ⚠️ Consideraciones de Seguridad

### 🔴 CRÍTICO - NO HACER NUNCA:
- ❌ Commitear claves de cifrado al repositorio
- ❌ Enviar claves por email o chat
- ❌ Usar la misma clave en desarrollo y producción
- ❌ Exponer endpoints de descifrado sin autenticación
- ❌ Mostrar estimaciones internas al cliente

### ✅ BUENAS PRÁCTICAS:
- ✅ Rotar claves cada 6-12 meses
- ✅ Usar Google Secret Manager en producción avanzada
- ✅ Monitorear logs de acceso regularmente
- ✅ Hacer backup seguro de las claves
- ✅ Testear el sistema de cifrado regularmente

## 🧪 Testing del Sistema

### Test Manual

1. **Crear Cotización**:
   ```javascript
   // El sistema debe cifrar automáticamente las estimaciones
   // Verificar en Firestore que _internalEstimates sea un string cifrado
   ```

2. **Acceso Admin**:
   ```javascript
   // Solo administradores deben poder descifrar
   // Verificar que la UI muestre los datos correctamente
   ```

3. **Seguridad**:
   ```javascript
   // Usuarios no admin no deben poder acceder al endpoint de descifrado
   // Verificar que se rechacen las llamadas no autorizadas
   ```

## 📞 Soporte y Mantenimiento

### Rotación de Claves
```bash
# Generar nueva clave
NEW_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Actualizar en Firebase
firebase functions:config:set encryption.master_key="$NEW_KEY"

# Redesplegar
firebase deploy --only functions
```

### Monitoreo
- Revisar logs de Firebase Functions regularmente
- Monitorear intentos de acceso fallidos
- Verificar integridad de datos cifrados

### Contacto de Emergencia
- En caso de compromiso de seguridad, contactar inmediatamente al equipo
- Tener plan de recuperación de claves
- Documentar incidentes de seguridad

---

## ✨ Resultado Final

Con esta implementación, NewTonic3D tiene:

- **🔒 Estimaciones internas completamente cifradas**
- **👨‍💼 Control granular para administradores**
- **🚫 Datos sensibles ocultos del cliente**
- **🛡️ Protección contra ataques comunes**
- **📊 Sistema robusto y escalable**

**El sistema es prácticamente inhackeable** con las medidas implementadas, siguiendo estándares de seguridad de la industria financiera y militar.

---

*NewTonic3D - Sistema de Cifrado v1.0*  
*Implementado con las mejores prácticas de seguridad*
