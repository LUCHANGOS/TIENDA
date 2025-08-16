# 🔧 Configuración GitHub Pages - Pasos Urgentes

## ⚠️ ACCIÓN REQUERIDA

El deploy está fallando porque GitHub Pages necesita configuración específica. **Sigue estos pasos EXACTAMENTE**:

### 1. 🌐 Configurar GitHub Pages (CRÍTICO)

1. Ve a tu repositorio: `https://github.com/LUCHANGOS/TIENDA`
2. Clic en **Settings** (en el menú superior)
3. Scroll hacia abajo hasta **"Pages"** (menú lateral izquierdo)
4. En **"Source"** selecciona: **"GitHub Actions"** (NO "Deploy from branch")
5. **Save** / Guardar

### 2. 🔑 Configurar Variables Secretas (OPCIONAL AHORA)

Para que funcione sin Firebase por ahora, NO necesitas hacer nada. Pero si quieres Firebase funcionando:

1. Ve a **Settings** > **Secrets and variables** > **Actions**
2. Clic en **"New repository secret"**
3. Agregar estos secrets uno por uno:

```
Nombre: VITE_FIREBASE_API_KEY
Valor: tu-api-key-real-de-firebase

Nombre: VITE_FIREBASE_AUTH_DOMAIN  
Valor: tienda-de81e.firebaseapp.com

Nombre: VITE_FIREBASE_DATABASE_URL
Valor: https://tienda-de81e-default-rtdb.firebaseio.com

Nombre: VITE_FIREBASE_PROJECT_ID
Valor: tienda-de81e

Nombre: VITE_FIREBASE_STORAGE_BUCKET
Valor: tienda-de81e.appspot.com

Nombre: VITE_FIREBASE_MESSAGING_SENDER_ID
Valor: tu-sender-id-real

Nombre: VITE_FIREBASE_APP_ID
Valor: tu-app-id-real
```

### 3. 🚀 Activar Deploy

Una vez hecha la configuración del Paso 1:

1. Ve a **Actions** en tu repositorio
2. Verás que el workflow se ejecuta automáticamente
3. Espera 2-3 minutos para que termine

### 4. 🎯 Acceder a la App

Una vez completado el deploy:
- **URL**: `https://LUCHANGOS.github.io/TIENDA/`

## 🔍 Troubleshooting

### Si aún hay errores:

1. **Verifica en Actions** que el workflow esté usando "GitHub Actions" como source
2. **Revisa el log** en Actions para ver errores específicos
3. **Espera 5-10 minutos** para propagación de GitHub Pages

### Si la app no carga completamente:

- ✅ **La navegación funcionará** (Home, Catalog, Cart, etc.)
- ⚠️ **Firebase no funcionará** hasta agregar credenciales reales
- ✅ **El diseño se verá perfecto**
- ✅ **Responsive funcionará**

## 📋 Próximos Pasos

1. ✅ **HACER**: Configurar GitHub Pages con "GitHub Actions"
2. ⏳ **OPCIONAL**: Agregar credenciales Firebase reales
3. 🎉 **RESULTADO**: App funcionando en producción

---

## 🎯 ACCIÓN INMEDIATA

**¡SOLO NECESITAS HACER EL PASO 1!** 

1. Settings > Pages > Source: "GitHub Actions" > Save
2. Esperar 3 minutos
3. Acceder a `https://LUCHANGOS.github.io/TIENDA/`

¡La app funcionará inmediatamente! 🚀
