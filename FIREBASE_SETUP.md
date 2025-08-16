# 🔥 Configuración Firebase para NewTonic3D

## 🎯 Pasos Críticos para que Funcione el Login

### 1. 🌐 Autorizar Dominio GitHub Pages

**IMPORTANTE**: Firebase necesita autorizar el dominio donde corre la app.

1. **Ve a**: https://console.firebase.google.com/project/tienda-de81e
2. **Authentication** → **Settings**
3. **Authorized domains** (scroll hacia abajo)
4. **Add domain**: `luchangos.github.io`
5. **Save**

### 2. 👤 Verificar Usuario Admin

1. **Authentication** → **Users**
2. **Verificar que existe**: `luisneyra049@gmail.com`
3. **Si no existe, Add User**:
   ```
   Email: luisneyra049@gmail.com
   Password: Mamoncio321
   ```

### 3. 🔒 Configurar Authentication Method

1. **Authentication** → **Sign-in method**
2. **Email/Password** → **Enable**
3. **Save**

## 🧪 Verificar Configuración

### URLs que deben estar autorizadas:
- ✅ `localhost` (para desarrollo)
- ✅ `luchangos.github.io` (para producción)

### Usuarios que deben existir:
- ✅ `luisneyra049@gmail.com` (admin)

### Métodos habilitados:
- ✅ Email/Password

## 🚀 Una vez configurado:

1. **Esperar 5 minutos** para propagación
2. **Ir a**: `https://LUCHANGOS.github.io/TIENDA/`
3. **Presionar**: `Ctrl+A`
4. **Login**: `luisneyra049@gmail.com` + `Mamoncio321`
5. **¡Funcionará!** Login real con Firebase

## 🔍 Si hay problemas:

### Error "auth/unauthorized-domain":
- ✅ Verificar que `luchangos.github.io` está en authorized domains
- ✅ Esperar 5-10 minutos para propagación

### Error "auth/user-not-found":
- ✅ Crear usuario en Authentication → Users
- ✅ Verificar email exacto: `luisneyra049@gmail.com`

### Error "auth/wrong-password":
- ✅ Verificar contraseña: `Mamoncio321`
- ✅ O resetear contraseña del usuario

## 🎭 ¡Firebase Real Funcionando!

Una vez completada la configuración, tendrás:
- ✅ **Autenticación real** con Firebase
- ✅ **Base de datos conectada**
- ✅ **Storage funcionando**
- ✅ **Admin completamente operativo**
