# 🔐 Configuración de Admin - NewTonic3D

## ✅ Configuración Actual

He configurado tu email `Luisneyra049@gmail.com` como administrador en el código. 

**🚨 IMPORTANTE**: Por razones de seguridad, **NO puedo poner tu contraseña real en el código** porque se subiría a GitHub (público) y cualquiera podría verla.

## 🛠️ Pasos para Configurar Firebase Authentication

### 1. 📧 Crear Usuario Admin en Firebase

Para que puedas hacer login como admin, necesitas crear el usuario en Firebase:

1. Ve a [Firebase Console](https://console.firebase.google.com/project/tienda-de81e)
2. En el menú lateral: **Authentication**
3. Pestaña **Users**
4. Clic en **Add User**
5. Llena los datos:
   ```
   Email: Luisneyra049@gmail.com
   Password: Mamoncio321 (o la que prefieras)
   ```
6. **Add User**

### 2. 🔒 Habilitar Email/Password Authentication

1. En **Authentication** → **Sign-in method**
2. Buscar **Email/Password**
3. **Enable** (habilitar)
4. **Save**

## 🎯 Cómo Usar el Admin

### Acceder al Modo Admin:

1. **En desarrollo local**:
   - Ejecutar `npm run dev`
   - Ir a `http://localhost:3000`
   - Presionar `Ctrl+A`
   - Login con: `Luisneyra049@gmail.com` y tu contraseña

2. **En producción**:
   - Ir a `https://LUCHANGOS.github.io/TIENDA/`
   - Presionar `Ctrl+A`
   - Login con tus credenciales

### Funcionalidades Admin:

- ✅ **Acceso a página /admin**
- ✅ **Permisos especiales**
- ✅ **CRUD de productos** (cuando Firebase esté conectado)
- ✅ **Gestión de cotizaciones**

## 🔐 Configuración de Seguridad

### Emails de Admin Autorizados:

```typescript
const adminEmails = [
  'Luisneyra049@gmail.com',  // Tu email
  'admin@newtonic3d.com'     // Email backup
];
```

### Verificación Automática:

- ✅ Al hacer login, el sistema verifica si el email está en la lista
- ✅ Si está → Permisos de admin
- ✅ Si no está → Usuario regular

## 🚨 Mejores Prácticas de Seguridad

### ❌ NUNCA hacer:
- Poner contraseñas en código fuente
- Usar contraseñas simples en producción
- Subir credenciales a GitHub

### ✅ SIEMPRE hacer:
- Crear usuarios en Firebase Console
- Usar contraseñas seguras
- Mantener emails de admin en código (es seguro)

## 🧪 Testing

### Para probar que funciona:

1. **Crear usuario en Firebase** (pasos de arriba)
2. **Probar login local**:
   ```bash
   npm run dev
   # Ir a localhost:3000
   # Ctrl+A → Login con tus credenciales
   ```
3. **Verificar permisos**:
   - Deberías ver "Admin Mode" en algún lugar
   - Acceso a `/admin` debería funcionar

## 🔄 Si cambias de email

Para cambiar el email de admin:

1. **Actualizar código**:
   ```typescript
   const adminEmails = [
     'tu-nuevo-email@gmail.com',
     'admin@newtonic3d.com'
   ];
   ```

2. **Crear nuevo usuario en Firebase** con el nuevo email

3. **Hacer deploy** con los cambios

---

## 🎯 Resumen de Acción

**SOLO necesitas hacer esto**:

1. Firebase Console → Authentication → Add User
2. Email: `Luisneyra049@gmail.com`
3. Password: `Mamoncio321` (o la que prefieras)
4. Probar con `Ctrl+A` en la app

¡Y listo! Tendrás acceso completo de admin. 🎭✨
