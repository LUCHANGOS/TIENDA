# NewTonic3D 🎯

E-commerce completo para impresión 3D con cotizador automático, construido con React + TypeScript + Firebase.

## ✨ Características

### 🎭 Diseño Visual
- **Imagen seria + toque cómico**: Combina profesionalismo con elementos divertidos
- **Mascota "Cubic"**: Cubo 3D sonriente como asistente virtual
- **Tipografías**: Poppins (títulos), Nunito (textos), Comic Neue (mensajes cómicos)
- **Colores**: Base sobria (azul profundo, gris) + acentos cómicos (naranja, verde lima, morado)
- **Animaciones**: Microefectos graciosos (carrito que salta, botones que vibran)

### 🛍️ E-commerce
- **Catálogo filtrable**: Búsqueda, categorías, materiales, colores, calidades
- **Carrito persistente**: localStorage + sincronización con Firebase
- **Checkout simulado**: Flujo completo de compra
- **Estados vacíos cómicos**: Mensajes divertidos en lugar de errores aburridos

### 📊 Cotizador 3D
- **Subida de archivos**: Drag & drop para STL/OBJ/GLB/3MF
- **Estimación automática**: Volumen, tiempo de impresión, costos
- **Configuración avanzada**: Material, calidad, color, urgencia
- **Visualizador 3D**: Model-viewer + Three.js fallback

### 🔐 Modo Admin
- **Acceso secreto**: Ctrl+A para login admin
- **CRUD productos**: Crear, editar, eliminar productos
- **Gestión cotizaciones**: Responder y gestionar solicitudes
- **Subida de archivos**: Imágenes y modelos 3D

### 🚀 Tech Stack
- **Frontend**: Vite + React 18 + TypeScript
- **Estilos**: TailwindCSS + animaciones customizadas
- **Estado**: Zustand + persistencia
- **Backend**: Firebase Web v9 (Auth, Realtime DB, Storage)
- **3D**: @google/model-viewer + Three.js
- **Deploy**: GitHub Pages + GitHub Actions

## 📦 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/NewTonic3D.git
cd NewTonic3D
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Firebase

#### 3.1 Crear proyecto Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto llamado "NewTonic3D"
3. Habilita los siguientes servicios:
   - **Authentication** (Email/Password)
   - **Realtime Database**
   - **Storage**

#### 3.2 Configurar Authentication
1. Ve a Authentication > Sign-in method
2. Habilita "Email/Password"
3. Crea un usuario admin de prueba

#### 3.3 Configurar Realtime Database
1. Ve a Realtime Database > Rules
2. Copia y pega el contenido de `firebase.rules.json`
3. Publica las reglas

#### 3.4 Configurar Storage
1. Ve a Storage > Rules
2. Copia y pega el contenido de `storage.rules`
3. Publica las reglas

#### 3.5 Obtener configuración
1. Ve a Project Settings > General
2. En "Your apps", agrega una app web
3. Copia la configuración de Firebase
4. Reemplaza los valores en `src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

### 5. Configurar admin inicial
```bash
# Acceder a http://localhost:3000
# Presionar Ctrl+A para login admin
# Usar las credenciales del usuario creado en Firebase
```

## 🚀 Despliegue en GitHub Pages

### 1. Configurar repositorio
```bash
git remote add origin https://github.com/tu-usuario/NewTonic3D.git
```

### 2. Habilitar GitHub Pages
1. Ve a Settings > Pages en tu repositorio
2. Source: "Deploy from a branch"
3. Branch: "gh-pages"
4. Folder: "/ (root)"

### 3. Deploy automático
```bash
git add .
git commit -m "feat: aplicación completa NewTonic3D"
git push origin main
```

## 🎯 Funcionalidades Implementadas

### ✅ Completadas
- [x] Configuración base (Vite + React + TypeScript)
- [x] Sistema de diseño (TailwindCSS + fuentes)
- [x] Estado global (Zustand + persistencia)
- [x] Configuración Firebase
- [x] Layout y navegación responsiva
- [x] Página de inicio con servicios
- [x] Sistema de rutas (React Router)
- [x] Modo admin (Ctrl+A)
- [x] Páginas base (Home, Catalog, Cart, Quote, Admin, 404)
- [x] Reglas de seguridad Firebase
- [x] Workflow GitHub Actions

### 🚧 Por Implementar
- [ ] CRUD productos completo
- [ ] Cotizador 3D funcional
- [ ] Visualizador 3D
- [ ] Subida de archivos
- [ ] Productos semilla
- [ ] Dashboard admin completo

## 🎮 Uso de la Aplicación

### Usuario Regular
1. **Explorar**: Navega por el catálogo
2. **Filtrar**: Usa búsqueda y filtros
3. **Cotizar**: Sube archivos 3D
4. **Comprar**: Agrega al carrito

### Administrador
1. **Acceder**: Presiona `Ctrl+A`
2. **Login**: Usa credenciales Firebase
3. **Gestionar**: CRUD productos

---

**¡Hecho con ❤️ y mucho filamento!** 🎭✨
