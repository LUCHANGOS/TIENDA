import React, { useEffect, useState } from 'react';
import { Search, Grid, List, ShoppingCart, Star, Box, Image as ImageIcon, X, Plus, Minus } from 'lucide-react';
import { useAppStore } from '../store';
import type { Product, Material, Color, Quality } from '../types';

const Catalog: React.FC = () => {
  const { products, categories, materials, colors, qualities, loadProducts, addToCart, loading } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<Quality | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [viewMode3D, setViewMode3D] = useState(false);
  const [loading3D, setLoading3D] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category.id === selectedCategory;
    const isVisible = product.visible !== false; // Mostrar solo productos visibles
    return matchesSearch && matchesCategory && isVisible;
  });

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedMaterial((Array.isArray(product.materials) && product.materials.length > 0) ? product.materials[0] : null);
    setSelectedColor((Array.isArray(product.colors) && product.colors.length > 0) ? product.colors[0] : null);
    setSelectedQuality((Array.isArray(product.qualities) && product.qualities.length > 0) ? product.qualities[0] : null);
    setQuantity(1);
    setViewMode3D(false); // Empezar siempre en modo imagen
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setSelectedMaterial(null);
    setSelectedColor(null);
    setSelectedQuality(null);
    setQuantity(1);
    setViewMode3D(false);
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedMaterial || !selectedColor || !selectedQuality) {
      alert('Por favor selecciona todas las opciones');
      return;
    }

    const cartItem = {
      productId: selectedProduct.id,
      product: selectedProduct,
      selectedMaterial,
      selectedColor,
      selectedQuality,
      quantity
    };

    addToCart(cartItem);
    closeProductModal();
    
    // Mostrar notificación de éxito
    alert(`¡${selectedProduct.name} agregado al carrito! 🛒`);
  };

  const calculateTotalPrice = () => {
    if (!selectedProduct || !selectedMaterial || !selectedColor || !selectedQuality) return 0;
    
    const basePrice = selectedProduct.price;
    const qualityMultiplier = selectedQuality.priceMultiplier;
    const colorSurcharge = selectedColor.surcharge / 100;
    
    return Math.round((basePrice * qualityMultiplier * (1 + colorSurcharge) * quantity) * 100) / 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mb-4" />
          <p className="text-gray-600 font-comic">Cargando productos increíbles... 🚀</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-2">
            Catálogo de Productos 🛍️
          </h1>
          <p className="text-gray-600 font-nunito">
            Descubre nuestra colección de productos únicos e innovadores
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 pr-4"
              />
            </div>

            {/* Categorías */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input min-w-48"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>

              {/* Vista */}
              <div className="flex bg-gray-100 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Productos */}
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3 className="empty-state-title">
              ¡Ups! No encontramos productos
            </h3>
            <p className="empty-state-message">
              Parece que estos productos están en otra dimensión... 
              <br />
              ¡Intenta con otros términos de búsqueda!
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden group">
                {/* Imagen del producto */}
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback si falla la carga de imagen
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {/* Fallback icon */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200" style={{ display: product.images?.length ? 'none' : 'flex' }}>
                    <ImageIcon size={48} className="text-gray-400" />
                    <span className="text-2xl ml-2">{product.category.icon}</span>
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex flex-col space-y-1">
                    {product.model3d && (
                      <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                        <Box size={12} className="mr-1" /> 3D
                      </span>
                    )}
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                      <Star size={12} className="mr-1" /> Nuevo
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-poppins font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Materiales disponibles */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {Array.isArray(product.materials) && product.materials.slice(0, 3).map((material) => (
                      <span
                        key={material.id}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {material.name}
                      </span>
                    ))}
                    {Array.isArray(product.materials) && product.materials.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        +{product.materials.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-primary-600">
                        ${product.price}
                      </span>
                      <p className="text-xs text-gray-500">Precio base</p>
                    </div>
                    <button 
                      onClick={() => openProductModal(product)}
                      className="btn-primary px-4 py-2 text-sm flex items-center space-x-1 hover:bg-primary-700 transition-colors"
                    >
                      <ShoppingCart size={16} />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de producto */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedProduct.name}
                </h3>
                <button
                  onClick={closeProductModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {/* Imagen del producto y Modelo 3D */}
                <div className="mb-6">
                  {/* Pestañas para cambiar entre imagen y modelo 3D */}
                  {selectedProduct.model3d && (
                    <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => setViewMode3D(false)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          !viewMode3D ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        📷 Imágenes
                      </button>
                      <button
                        onClick={() => {
                          setViewMode3D(true);
                          setLoading3D(true);
                        }}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          viewMode3D ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        🧊 Modelo 3D
                      </button>
                    </div>
                  )}
                  
                  {/* Contenedor de visualización */}
                  <div className="w-full h-64 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {viewMode3D && selectedProduct.model3d ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {/* Indicador de carga 3D */}
                        {loading3D && (
                          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                            <div className="text-center">
                              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                              <p className="text-sm text-gray-600">Cargando modelo 3D...</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Visualizador 3D */}
                        <model-viewer
                          src={selectedProduct.model3d}
                          alt={selectedProduct.name}
                          auto-rotate
                          camera-controls
                          interaction-policy="allow-when-focused"
                          style={{ width: '100%', height: '100%' }}
                          loading="lazy"
                          onLoad={() => setLoading3D(false)}
                          onError={() => setLoading3D(false)}
                        ></model-viewer>
                        
                        {/* Controles de ayuda */}
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          🖱️ Arrastra para rotar • 🔍 Zoom con scroll
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full">
                        {selectedProduct.images && selectedProduct.images.length > 0 ? (
                          <img
                            src={selectedProduct.images[0]}
                            alt={selectedProduct.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={48} className="text-gray-400" />
                            <span className="text-4xl ml-2">{selectedProduct.category.icon}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
                  <p className="text-gray-600 text-sm">{selectedProduct.description}</p>
                </div>

                {/* Opciones de personalización */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Material */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material
                    </label>
                    <select
                      value={selectedMaterial?.id || ''}
                      onChange={(e) => {
                        const material = Array.isArray(selectedProduct.materials) ? selectedProduct.materials.find(m => m.id === e.target.value) : null;
                        setSelectedMaterial(material || null);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {Array.isArray(selectedProduct.materials) && selectedProduct.materials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.name}
                        </option>
                      ))}
                    </select>
                    {selectedMaterial && (
                      <p className="text-xs text-gray-500 mt-1">{selectedMaterial.description}</p>
                    )}
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <select
                      value={selectedColor?.id || ''}
                      onChange={(e) => {
                        const color = Array.isArray(selectedProduct.colors) ? selectedProduct.colors.find(c => c.id === e.target.value) : null;
                        setSelectedColor(color || null);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {Array.isArray(selectedProduct.colors) && selectedProduct.colors.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name} {color.surcharge > 0 && `(+${color.surcharge}%)`}
                        </option>
                      ))}
                    </select>
                    {selectedColor && (
                      <div className="flex items-center space-x-2 mt-1">
                        <div 
                          className="w-4 h-4 rounded border border-gray-300" 
                          style={{ backgroundColor: selectedColor.hex }}
                        ></div>
                        <span className="text-xs text-gray-500">{selectedColor.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Calidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calidad
                    </label>
                    <select
                      value={selectedQuality?.id || ''}
                      onChange={(e) => {
                        const quality = Array.isArray(selectedProduct.qualities) ? selectedProduct.qualities.find(q => q.id === e.target.value) : null;
                        setSelectedQuality(quality || null);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {Array.isArray(selectedProduct.qualities) && selectedProduct.qualities.map((quality) => (
                        <option key={quality.id} value={quality.id}>
                          {quality.name} - {quality.layerHeight}mm
                        </option>
                      ))}
                    </select>
                    {selectedQuality && (
                      <p className="text-xs text-gray-500 mt-1">{selectedQuality.description}</p>
                    )}
                  </div>
                </div>

                {/* Cantidad */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-lg font-semibold px-4">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Precio total */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Precio base:</span>
                    <span className="text-sm">${selectedProduct.price}</span>
                  </div>
                  {selectedQuality && selectedQuality.priceMultiplier !== 1 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Calidad ({selectedQuality.name}):</span>
                      <span className="text-sm">x{selectedQuality.priceMultiplier}</span>
                    </div>
                  )}
                  {selectedColor && selectedColor.surcharge > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Color ({selectedColor.name}):</span>
                      <span className="text-sm">+{selectedColor.surcharge}%</span>
                    </div>
                  )}
                  {quantity > 1 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cantidad:</span>
                      <span className="text-sm">x{quantity}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="text-xl font-bold text-primary-600">${calculateTotalPrice()}</span>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex space-x-3">
                  <button
                    onClick={closeProductModal}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart size={16} />
                    <span>Agregar al Carrito</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
