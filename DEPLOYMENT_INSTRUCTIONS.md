# 🚀 Instrucciones Finales de Despliegue - NewTonic3D

## ✅ Estado Actual
- ✅ Código completamente funcional y compilado
- ✅ Repositorio GitHub configurado y sincronizado
- ✅ Workflow de GitHub Actions listo
- ✅ TailwindCSS v3 funcionando correctamente
- ✅ Variables de entorno configuradas para desarrollo y producción

## 📋 Pasos Restantes para Completar el Despliegue

### 1. 🔑 Obtener Credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Abre tu proyecto "TIENDA" (tienda-de81e)
3. Ir a **Project Settings** (⚙️) > **General**
4. Scroll hacia abajo hasta **"Your Apps"**
5. Si no tienes una app web, haz clic en **"Add app"** > **Web**
6. Registra la app con nombre "NewTonic3D"
7. **COPIA LA CONFIGURACIÓN** que aparece:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",  // ← COPIAR ESTE VALOR
  authDomain: "tienda-de81e.firebaseapp.com",
  databaseURL: "https://tienda-de81e-default-rtdb.firebaseio.com",
  projectId: "tienda-de81e",
  storageBucket: "tienda-de81e.appspot.com",
  messagingSenderId: "123456789...",  // ← COPIAR ESTE VALOR
  appId: "1:123456789..."  // ← COPIAR ESTE VALOR
};
```

### 2. 🔐 Configurar Variables de Entorno Locales

1. Edita el archivo `.env` en la raíz del proyecto
2. Reemplaza los valores placeholder con los reales de Firebase:

```bash
# Editar .env con valores reales:
VITE_FIREBASE_API_KEY=AIza... # ← TU API KEY REAL
VITE_FIREBASE_AUTH_DOMAIN=tienda-de81e.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://tienda-de81e-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=tienda-de81e
VITE_FIREBASE_STORAGE_BUCKET=tienda-de81e.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789... # ← TU SENDER ID REAL
VITE_FIREBASE_APP_ID=1:123456789... # ← TU APP ID REAL
```

### 3. 🗂️ Configurar GitHub Secrets (Para Producción)

1. Ve a tu repositorio: `https://github.com/LUCHANGOS/TIENDA`
2. Ir a **Settings** > **Secrets and variables** > **Actions**
3. Crear estos **Repository secrets**:

```
VITE_FIREBASE_API_KEY = AIza... (tu API key real)
VITE_FIREBASE_AUTH_DOMAIN = tienda-de81e.firebaseapp.com
VITE_FIREBASE_DATABASE_URL = https://tienda-de81e-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID = tienda-de81e
VITE_FIREBASE_STORAGE_BUCKET = tienda-de81e.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = 123456789... (tu sender ID real)
VITE_FIREBASE_APP_ID = 1:123456789... (tu app ID real)
```

### 4. 📊 Configurar Firebase Database

1. En Firebase Console > **Realtime Database**
2. Ir a **Rules** y usar este contenido:

```json
{
  "rules": {
    "read": "now < 1757905200000",  // 2025-9-15
    "write": "now < 1757905200000"  // 2025-9-15
  }
}
```

3. **Publicar** las reglas

### 5. 📁 Configurar Firebase Storage

1. En Firebase Console > **Storage**
2. Ir a **Rules** y usar este contenido:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.time < timestamp.date(2025, 9, 15);
    }
  }
}
```

3. **Publicar** las reglas

### 6. 🔒 Configurar Authentication

1. En Firebase Console > **Authentication**
2. Ir a **Sign-in method**
3. Habilitar **Email/Password**
4. Crear un usuario admin inicial:
   - Email: `admin@newtonic3d.com`
   - Password: (elige una contraseña segura)

### 7. 🌐 Habilitar GitHub Pages

1. En tu repositorio GitHub: **Settings** > **Pages**
2. Source: **Deploy from a branch**
3. Branch: **gh-pages**
4. Folder: **/ (root)**
5. **Save**

### 8. 🚀 Hacer Deploy

1. **Test local** primero:
```bash
npm run dev
# Ir a http://localhost:3000 y probar la app
```

2. **Deploy a producción**:
```bash
git add .
git commit -m "feat: credenciales Firebase configuradas"
git push origin master
```

3. **Ver el deploy en acción**:
   - Ve a **Actions** en tu repo GitHub
   - Verás el workflow ejecutándose
   - Tarda 2-3 minutos

4. **Acceder a la aplicación**:
   - URL: `https://LUCHANGOS.github.io/TIENDA/`

### 9. 🗃️ Poblar la Base de Datos (Opcional)

```bash
# Editar scripts/seed-database.js con tus credenciales reales
# Luego ejecutar:
node scripts/seed-database.js
```

## 🎯 URLs Importantes

- **Desarrollo**: `http://localhost:3000`
- **Producción**: `https://LUCHANGOS.github.io/TIENDA/`
- **Firebase Console**: `https://console.firebase.google.com/project/tienda-de81e`
- **GitHub Repo**: `https://github.com/LUCHANGOS/TIENDA`

## 🧪 Testing

### Test Login Admin:
1. Ir a la app
2. Presionar `Ctrl+A`
3. Usar credenciales del usuario Firebase creado

### Test Funcionalidades:
- ✅ Navegación entre páginas
- ✅ Catálogo con productos de muestra
- ✅ Carrito de compras
- ✅ Modal de login admin
- ✅ Responsivo en móvil

## 🛠️ Troubleshooting

### Si el build falla:
- Verificar que todas las variables estén en GitHub Secrets
- Revisar **Actions** tab para ver error específico

### Si Firebase no conecta:
- Verificar credenciales en `.env`
- Confirmar que las reglas de Database y Storage están publicadas

### Si la app no se ve bien:
- Esperar 5-10 minutos para que GitHub Pages se actualice
- Hacer hard refresh (Ctrl+F5)

## 🎉 ¡Success!

Una vez completados estos pasos, tendrás:
- ✅ App funcionando en desarrollo y producción
- ✅ Firebase completamente configurado
- ✅ Deploy automático con cada cambio
- ✅ Base sólida para agregar más funcionalidades

---

**¡La app NewTonic3D está lista para impresionar! 🎭✨**
