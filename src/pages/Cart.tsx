import React from 'react';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useAppStore } from '../store';
import { Link } from 'react-router-dom';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartItem } = useAppStore();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-2">
              Carrito de Compras 🛒
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <h3 className="empty-state-title">
                Tu carrito está vacío
              </h3>
              <p className="empty-state-message">
                ¡Parece que tu carrito necesita algunas impresiones 3D increíbles! 
                <br />
                Explora nuestro catálogo y encuentra algo genial.
              </p>
              
              <div className="mt-8">
                <Link
                  to="/catalog"
                  className="btn-primary text-lg px-8 py-3"
                >
                  <ShoppingBag size={20} className="mr-2" />
                  Explorar Productos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-2">
            Carrito de Compras 🛒
          </h1>
          <p className="text-gray-600 font-nunito">
            {cart.items.length} {cart.items.length === 1 ? 'producto' : 'productos'} en tu carrito
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Items del carrito */}
          <div className="divide-y divide-gray-200">
            {cart.items.map((item) => (
              <div key={`${item.productId}-${item.selectedMaterial.id}-${item.selectedColor.id}-${item.selectedQuality.id}`} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{item.product.category.icon}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-poppins font-semibold text-gray-900">
                        {item.product.name}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Material: {item.selectedMaterial.name}</p>
                        <p>Color: {item.selectedColor.name}</p>
                        <p>Calidad: {item.selectedQuality.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Cantidad */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartItem(item.productId, { quantity: Math.max(1, item.quantity - 1) })}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItem(item.productId, { quantity: item.quantity + 1 })}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Precio */}
                    <div className="text-right">
                      <div className="font-bold text-lg text-primary-600">
                        ${item.totalPrice.toFixed(2)}
                      </div>
                    </div>

                    {/* Eliminar */}
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between text-xl font-poppins font-bold">
              <span>Total:</span>
              <span className="text-primary-600">${cart.totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link
                to="/catalog"
                className="btn-secondary flex-1 text-center"
              >
                Seguir Comprando
              </Link>
              <button className="btn-primary flex-1">
                Proceder al Pago
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
