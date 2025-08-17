# Configurar CORS para Firebase Storage

## Problema
Los errores de CORS indican que Firebase Storage está bloqueando las requests desde tu dominio de GitHub Pages.

## Solución

### Opción 1: Usar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto Firebase (`tienda-de81e`)
3. Ve a Cloud Storage > Browser
4. Selecciona tu bucket de Firebase Storage
5. Ve a la pestaña "Permissions"
6. Clic en "Add" y añade:
   - Principal: `allUsers`
   - Role: `Storage Object Viewer`

### Opción 2: Usar gsutil (Google Cloud SDK)

Si tienes Google Cloud SDK instalado:

```bash
# Navegar al directorio del proyecto
cd C:\Users\luisn\NewTonic3D

# Aplicar configuración de CORS
gsutil cors set storage-cors.json gs://tienda-de81e.firebasestorage.app
```

### Opción 3: Firebase CLI

Si tienes Firebase CLI instalado:

```bash
# Instalar Firebase CLI si no lo tienes
npm install -g firebase-tools

# Login a Firebase
firebase login

# Inicializar proyecto Firebase (si no está inicializado)
firebase init

# Desplegar reglas de Storage
firebase deploy --only storage
```

### Opción 4: Configuración temporal en las reglas de Storage

Edita `storage.rules` para permitir lectura pública temporal:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;  // Permite lectura a todos
      allow write: if request.auth != null;
    }
  }
}
```

## Verificación

Después de aplicar cualquiera de estas opciones, verifica:

1. Ve a Firebase Console > Storage
2. Comprueba que las reglas están aplicadas correctamente
3. Prueba subir una imagen desde tu aplicación

## Notas importantes

- Los errores de CORS son comunes al desarrollar con Firebase Storage
- GitHub Pages usa HTTPS, asegúrate de que Firebase Storage esté configurado para HTTPS
- Las reglas de Storage son diferentes a las de Database

## Estado actual

✅ Archivos de configuración creados
✅ Errores de undefined corregidos  
✅ Reglas de Firebase arregladas
⏳ CORS necesita configuración manual en Firebase Console

