import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  AppState, 
  AppActions, 
  Product, 
  CartItem, 
  Cart, 
  Quote, 
  User,
  ProductCategory,
  Material,
  Color,
  Quality,
  AppSettings
} from '../types';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { 
  ref, 
  push, 
  set as firebaseSet, 
  update, 
  remove
} from 'firebase/database';
import { auth, database } from '../lib/firebase';

// Datos iniciales
const initialCategories: ProductCategory[] = [
  { id: 'figurines', name: 'Figuras', description: 'Figuras decorativas y coleccionables', icon: '🎭' },
  { id: 'keychains', name: 'Llaveros', description: 'Llaveros personalizados', icon: '🔑' },
  { id: 'industrial', name: 'Piezas Industriales', description: 'Componentes técnicos y repuestos', icon: '⚙️' },
  { id: 'prototypes', name: 'Prototipos', description: 'Prototipos rápidos y maquetas', icon: '🔧' },
  { id: 'custom', name: 'Personalizado', description: 'Diseños únicos y personalizados', icon: '✨' },
];

const initialMaterials: Material[] = [
  {
    id: 'pla',
    name: 'PLA',
    description: 'Ácido Poliláctico - Fácil de imprimir, biodegradable',
    pricePerGram: 0.025,
    density: 1.24,
    colors: ['white', 'black', 'red', 'blue', 'green', 'yellow', 'orange', 'purple'],
    properties: ['Biodegradable', 'Fácil impresión', 'Acabado mate'],
    category: 'plastic'
  },
  {
    id: 'abs',
    name: 'ABS',
    description: 'Resistente y duradero, ideal para piezas funcionales',
    pricePerGram: 0.03,
    density: 1.04,
    colors: ['white', 'black', 'red', 'blue', 'green'],
    properties: ['Alta resistencia', 'Flexible', 'Resistente al calor'],
    category: 'plastic'
  },
  {
    id: 'petg',
    name: 'PETG',
    description: 'Transparente, resistente químicamente',
    pricePerGram: 0.035,
    density: 1.27,
    colors: ['clear', 'white', 'black', 'blue', 'green'],
    properties: ['Transparente', 'Resistente químicos', 'Reciclable'],
    category: 'plastic'
  },
  {
    id: 'resin',
    name: 'Resina Estándar',
    description: 'Alta precisión, ideal para detalles finos',
    pricePerGram: 0.08,
    density: 1.2,
    colors: ['clear', 'white', 'black', 'gray'],
    properties: ['Alta precisión', 'Acabado suave', 'Detalles finos'],
    category: 'resin'
  }
];

const initialColors: Color[] = [
  { id: 'white', name: 'Blanco', hex: '#FFFFFF', surcharge: 0 },
  { id: 'black', name: 'Negro', hex: '#000000', surcharge: 0 },
  { id: 'red', name: 'Rojo', hex: '#FF0000', surcharge: 5 },
  { id: 'blue', name: 'Azul', hex: '#0000FF', surcharge: 5 },
  { id: 'green', name: 'Verde', hex: '#00FF00', surcharge: 5 },
  { id: 'yellow', name: 'Amarillo', hex: '#FFFF00', surcharge: 10 },
  { id: 'orange', name: 'Naranja', hex: '#FFA500', surcharge: 10 },
  { id: 'purple', name: 'Morado', hex: '#800080', surcharge: 10 },
  { id: 'clear', name: 'Transparente', hex: '#FFFFFF80', surcharge: 15 },
  { id: 'gray', name: 'Gris', hex: '#808080', surcharge: 0 },
];

const initialQualities: Quality[] = [
  {
    id: 'draft',
    name: 'Borrador',
    description: 'Calidad básica, rápida - 0.3mm',
    layerHeight: 0.3,
    timeMultiplier: 0.7,
    priceMultiplier: 0.8
  },
  {
    id: 'standard',
    name: 'Estándar',
    description: 'Calidad equilibrada - 0.2mm',
    layerHeight: 0.2,
    timeMultiplier: 1.0,
    priceMultiplier: 1.0
  },
  {
    id: 'high',
    name: 'Alta',
    description: 'Alta calidad - 0.15mm',
    layerHeight: 0.15,
    timeMultiplier: 1.4,
    priceMultiplier: 1.3
  },
  {
    id: 'ultra',
    name: 'Ultra',
    description: 'Máxima calidad - 0.1mm',
    layerHeight: 0.1,
    timeMultiplier: 2.0,
    priceMultiplier: 1.6
  }
];

const initialSettings: AppSettings = {
  businessInfo: {
    name: 'NewTonic3D',
    email: 'contacto@newtonic3d.com',
    phone: '+1 234 567 8900',
    address: 'Calle de la Innovación 123, Ciudad Tech'
  },
  pricing: {
    laborRatePerHour: 25,
    taxRate: 0.16,
    urgencyMultipliers: {
      standard: 1.0,
      express: 1.5,
      urgent: 2.0
    }
  },
  features: {
    allowGuestQuotes: true,
    requirePhoneForQuotes: false,
    maxFileSize: 50, // MB
    allowedFileTypes: ['.stl', '.obj', '.3mf', '.gcode', '.glb', '.gltf']
  }
};

// Función para generar ID de sesión único
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Store principal
interface StoreState extends AppState, AppActions {}

export const useAppStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      cart: null,
      products: [],
      categories: initialCategories,
      materials: initialMaterials,
      colors: initialColors,
      qualities: initialQualities,
      settings: initialSettings,
      loading: false,
      error: null,

      // Acciones de usuario
      setUser: (user: User | null) => set({ user }),

      loginUser: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          // Verificación de admin para emails específicos
          const adminEmails = ['Luisneyra049@gmail.com', 'admin@newtonic3d.com'];
          const isAdmin = adminEmails.includes(email);

          const user: User = {
            uid: userCredential.user.uid,
            email: userCredential.user.email!,
            displayName: userCredential.user.displayName || undefined,
            isAdmin
          };

          set({ user, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      logoutUser: async () => {
        try {
          await signOut(auth);
          set({ user: null });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      // Acciones de productos
      loadProducts: async () => {
        try {
          set({ loading: true });
          // Por ahora usar productos vacíos hasta configurar Firebase
          set({ products: [], loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      addProduct: async (productData) => {
        const { user } = get();
        if (!user?.isAdmin) throw new Error('No autorizado');

        try {
          set({ loading: true });
          const productsRef = ref(database, 'products');
          const newProductRef = push(productsRef);
          
          const product: Omit<Product, 'id'> = {
            ...productData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await firebaseSet(newProductRef, product);
          
          // Recargar productos
          await get().loadProducts();
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      updateProduct: async (id: string, updates) => {
        const { user } = get();
        if (!user?.isAdmin) throw new Error('No autorizado');

        try {
          set({ loading: true });
          const productRef = ref(database, `products/${id}`);
          await update(productRef, {
            ...updates,
            updatedAt: new Date().toISOString()
          });
          
          // Recargar productos
          await get().loadProducts();
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      deleteProduct: async (id: string) => {
        const { user } = get();
        if (!user?.isAdmin) throw new Error('No autorizado');

        try {
          set({ loading: true });
          const productRef = ref(database, `products/${id}`);
          await remove(productRef);
          
          // Recargar productos
          await get().loadProducts();
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Acciones de carrito
      addToCart: (item) => {
        const { cart, user } = get();
        const totalPrice = item.product.price * item.quantity * 
          item.selectedQuality.priceMultiplier * 
          (1 + item.selectedColor.surcharge / 100);

        const cartItem: CartItem = {
          ...item,
          totalPrice
        };

        if (cart) {
          // Verificar si el producto ya existe en el carrito
          const existingItemIndex = cart.items.findIndex(
            i => i.productId === item.productId && 
                 i.selectedMaterial.id === item.selectedMaterial.id &&
                 i.selectedColor.id === item.selectedColor.id &&
                 i.selectedQuality.id === item.selectedQuality.id
          );

          if (existingItemIndex >= 0) {
            // Actualizar cantidad
            cart.items[existingItemIndex].quantity += item.quantity;
            cart.items[existingItemIndex].totalPrice = 
              cart.items[existingItemIndex].product.price * 
              cart.items[existingItemIndex].quantity * 
              cart.items[existingItemIndex].selectedQuality.priceMultiplier * 
              (1 + cart.items[existingItemIndex].selectedColor.surcharge / 100);
          } else {
            cart.items.push(cartItem);
          }

          cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
          cart.updatedAt = new Date().toISOString();
          
          set({ cart });
        } else {
          // Crear nuevo carrito
          const sessionId = generateSessionId();
          const newCart: Cart = {
            id: user?.uid || sessionId,
            userId: user?.uid,
            sessionId: user ? undefined : sessionId,
            items: [cartItem],
            totalAmount: totalPrice,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          set({ cart: newCart });
        }
      },

      removeFromCart: (productId: string) => {
        const { cart } = get();
        if (!cart) return;

        cart.items = cart.items.filter(item => item.productId !== productId);
        cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
        cart.updatedAt = new Date().toISOString();

        set({ cart });
      },

      updateCartItem: (productId: string, updates) => {
        const { cart } = get();
        if (!cart) return;

        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        if (itemIndex >= 0) {
          cart.items[itemIndex] = { ...cart.items[itemIndex], ...updates };
          
          // Recalcular precio total del item
          if (updates.quantity !== undefined) {
            cart.items[itemIndex].totalPrice = 
              cart.items[itemIndex].product.price * 
              cart.items[itemIndex].quantity * 
              cart.items[itemIndex].selectedQuality.priceMultiplier * 
              (1 + cart.items[itemIndex].selectedColor.surcharge / 100);
          }

          cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
          cart.updatedAt = new Date().toISOString();

          set({ cart });
        }
      },

      clearCart: () => {
        set({ cart: null });
      },

      // Acciones de cotizaciones
      submitQuote: async (quoteData) => {
        try {
          set({ loading: true });
          const quotesRef = ref(database, 'quotes');
          const newQuoteRef = push(quotesRef);
          
          const quote: Omit<Quote, 'id'> = {
            ...quoteData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await firebaseSet(newQuoteRef, quote);
          set({ loading: false });
          
          return newQuoteRef.key!;
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Acciones de UI
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'newtonic3d-store',
      partialize: (state) => ({
        cart: state.cart,
        user: state.user
      })
    }
  )
);

// Hook para configurar listeners de autenticación
export const useAuthListener = () => {
  const setUser = useAppStore(state => state.setUser);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Verificación de admin para emails específicos
        const adminEmails = ['Luisneyra049@gmail.com', 'admin@newtonic3d.com'];
        const isAdmin = adminEmails.includes(firebaseUser.email!) || false;

        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
          isAdmin
        };

        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);
};

