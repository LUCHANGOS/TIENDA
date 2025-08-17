export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  materials: Material[];
  colors: Color[];
  qualities: Quality[];
  images: string[];
  model3d?: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedMaterial: Material;
  selectedColor: Color;
  selectedQuality: Quality;
  customizations?: Record<string, any>;
  totalPrice: number;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  userId?: string;
  email: string;
  name: string;
  phone?: string;
  files: QuoteFile[];
  material: Material;
  quality: Quality;
  color?: Color;
  quantity: number;
  urgency: 'standard' | 'express' | 'urgent';
  notes?: string;
  estimatedPrice?: number;
  estimatedDays?: number;
  status: 'pending' | 'processing' | 'quoted' | 'accepted' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  storagePath?: string; // Ruta en Firebase Storage para descarga
  estimatedVolume?: number;
  estimatedPrintTime?: number;
}

export interface Material {
  id: string;
  name: string;
  description: string;
  pricePerGram: number;
  density: number; // g/cm³
  colors: string[];
  properties: string[];
  category: 'plastic' | 'resin' | 'metal' | 'ceramic' | 'composite';
}

export interface Color {
  id: string;
  name: string;
  hex: string;
  surcharge: number; // Porcentaje adicional
}

export interface Quality {
  id: string;
  name: string;
  description: string;
  layerHeight: number; // mm
  timeMultiplier: number;
  priceMultiplier: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'superadmin';
  permissions: AdminPermission[];
  createdAt: string;
  createdBy: string;
}

export interface AdminPermission {
  action: 'create' | 'read' | 'update' | 'delete';
  resource: 'products' | 'quotes' | 'users' | 'orders' | 'analytics';
}

// ===================== SISTEMA DE PEDIDOS =====================

export interface Order {
  id: string;
  userId?: string;
  sessionId?: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  items: CartItem[];
  totalAmount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: 'card' | 'paypal' | 'transfer' | 'cash';
  shippingMethod?: 'standard' | 'express' | 'pickup';
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  statusDetails?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: Order['status'];
  notes?: string;
  changedBy: string; // Admin ID
  createdAt: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface PriceEstimate {
  materialCost: number;
  laborCost: number;
  qualitySurcharge: number;
  colorSurcharge: number;
  urgencySurcharge: number;
  subtotal: number;
  tax: number;
  total: number;
  estimatedDays: number;
  volume: number;
  printTime: number;
}

export interface AppSettings {
  businessInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  pricing: {
    laborRatePerHour: number;
    taxRate: number;
    urgencyMultipliers: {
      standard: number;
      express: number;
      urgent: number;
    };
  };
  features: {
    allowGuestQuotes: boolean;
    requirePhoneForQuotes: boolean;
    maxFileSize: number; // MB
    allowedFileTypes: string[];
  };
}

// Estados de la aplicación
export interface AppState {
  user: User | null;
  cart: Cart | null;
  products: Product[];
  quotes: Quote[];
  orders: Order[]; // Nuevo: Pedidos
  categories: ProductCategory[];
  materials: Material[];
  colors: Color[];
  qualities: Quality[];
  settings: AppSettings;
  loading: boolean;
  error: string | null;
}

// Acciones para el estado
export interface AppActions {
  // Usuario
  setUser: (user: User | null) => void;
  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  
  // Productos
  loadProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Carrito
  addToCart: (item: Omit<CartItem, 'totalPrice'>) => void;
  removeFromCart: (productId: string) => void;
  updateCartItem: (productId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  
  // Cotizaciones
  submitQuote: (quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<string>;
  loadQuotes: () => Promise<void>;
  updateQuoteStatus: (id: string, status: Quote['status'], adminNotes?: string, estimatedPrice?: number, estimatedDays?: number) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  
  // Pedidos
  createOrder: (customerInfo: CustomerInfo, paymentMethod?: string, shippingMethod?: string) => Promise<string>;
  loadOrders: () => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status'], statusDetails?: string, trackingNumber?: string, estimatedDelivery?: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  
  // Configuración (Admin)
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  updateMaterials: (materials: Material[]) => Promise<void>;
  updateColors: (colors: Color[]) => Promise<void>;
  updateQualities: (qualities: Quality[]) => Promise<void>;
  
  // UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
