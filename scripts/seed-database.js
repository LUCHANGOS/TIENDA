// Script para poblar la base de datos de Firebase con datos de muestra
// Ejecutar con: node scripts/seed-database.js

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

// Configuración de Firebase (usar las credenciales reales)
const firebaseConfig = {
  apiKey: "tu-api-key-real-aqui",
  authDomain: "tienda-de81e.firebaseapp.com",
  databaseURL: "https://tienda-de81e-default-rtdb.firebaseio.com",
  projectId: "tienda-de81e",
  storageBucket: "tienda-de81e.appspot.com",
  messagingSenderId: "tu-messaging-sender-id",
  appId: "tu-app-id-real-aqui"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Datos de muestra
const sampleData = {
  products: {
    "p001": {
      id: "p001",
      name: "Miniatura Dragon Épico",
      description: "Figura de dragón detallada para juegos de mesa y colección. Impresión de alta calidad en resina.",
      price: 15.99,
      category: "miniaturas",
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      stock: 50,
      tags: ["dragón", "miniatura", "resina", "juegos"],
      specifications: {
        material: "Resina UV",
        height: "28mm",
        weight: "15g",
        printTime: "2 horas"
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    "p002": {
      id: "p002",
      name: "Set Decoración Hogar Moderno",
      description: "Conjunto de 3 jarrones decorativos con diseño minimalista. Perfectos para decorar espacios modernos.",
      price: 24.99,
      category: "decoracion",
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
      stock: 30,
      tags: ["jarrón", "decoración", "moderno", "set"],
      specifications: {
        material: "PLA+",
        dimensions: "15x8x8 cm c/u",
        weight: "120g total",
        printTime: "6 horas"
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    "p003": {
      id: "p003",
      name: "Prótesis de Mano Funcional",
      description: "Prótesis de mano impresa en 3D, completamente funcional y personalizable. Incluye instrucciones de montaje.",
      price: 89.99,
      category: "protesis",
      imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop",
      stock: 5,
      tags: ["prótesis", "funcional", "médico", "personalizable"],
      specifications: {
        material: "PETG médico",
        sizes: "S, M, L, XL",
        weight: "280g",
        printTime: "24 horas"
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    "p004": {
      id: "p004",
      name: "Herramientas de Cocina Set",
      description: "Set de 5 utensilios de cocina ergonómicos: espátula, cuchara, tenedor, pinzas y rallador.",
      price: 18.50,
      category: "utilitarios",
      imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
      stock: 25,
      tags: ["cocina", "utensilios", "ergonómico", "set"],
      specifications: {
        material: "PETG Food Safe",
        colors: "Varios disponibles",
        weight: "200g total",
        printTime: "8 horas"
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    "p005": {
      id: "p005",
      name: "Figura Superhéroe Personalizable",
      description: "Figura de acción personalizable de 15cm. Envía tu diseño o elige de nuestra galería de superhéroes.",
      price: 32.99,
      category: "miniaturas",
      imageUrl: "https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=400&h=400&fit=crop",
      stock: 15,
      tags: ["superhéroe", "personalizable", "figura", "colección"],
      specifications: {
        material: "Resina de alta definición",
        height: "150mm",
        weight: "85g",
        printTime: "4 horas"
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    "p006": {
      id: "p006",
      name: "Lampara LED Geométrica",
      description: "Lámpara decorativa con patrones geométricos únicos. Compatible con LED estándar E27.",
      price: 45.00,
      category: "decoracion",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      stock: 12,
      tags: ["lámpara", "LED", "geométrica", "decorativa"],
      specifications: {
        material: "PLA translúcido",
        dimensions: "25x25x30 cm",
        weight: "350g",
        printTime: "12 horas"
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  },
  categories: {
    "miniaturas": {
      id: "miniaturas",
      name: "Miniaturas",
      description: "Figuras detalladas para colección y juegos",
      productCount: 2
    },
    "decoracion": {
      id: "decoracion", 
      name: "Decoración",
      description: "Objetos decorativos para el hogar",
      productCount: 2
    },
    "protesis": {
      id: "protesis",
      name: "Prótesis",
      description: "Dispositivos médicos y prótesis funcionales",
      productCount: 1
    },
    "utilitarios": {
      id: "utilitarios",
      name: "Utilitarios",
      description: "Objetos útiles para el día a día",
      productCount: 1
    }
  },
  settings: {
    siteName: "NewTonic3D",
    siteDescription: "Tu tienda especializada en impresión 3D personalizada",
    currency: "USD",
    shipping: {
      freeShippingThreshold: 50.00,
      standardShipping: 5.99,
      expressShipping: 12.99
    },
    adminEmails: ["admin@newtonic3d.com"]
  }
};

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando población de la base de datos...');
    
    // Escribir datos de muestra
    await set(ref(database, '/'), sampleData);
    
    console.log('✅ Base de datos poblada exitosamente!');
    console.log('📊 Datos agregados:');
    console.log(`   • ${Object.keys(sampleData.products).length} productos`);
    console.log(`   • ${Object.keys(sampleData.categories).length} categorías`);
    console.log('   • Configuraciones básicas');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleData };
