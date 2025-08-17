import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Image,
  Upload,
  Eye,
  EyeOff,
  Save,
  X,
  Package,
  DollarSign,
  Tag,
  FileText,
  Palette,
  Settings,
  Camera,
  Box
} from 'lucide-react';
import { useAppStore } from '../../store';
import type { Product, ProductCategory, Material, Color, Quality } from '../../types';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';

interface ProductFormData {
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
}

const ProductManager: React.FC = () => {
  const {
    products,
    categories,
    materials,
    colors,
    qualities,
    loading,
    loadProducts,
    addProduct,
    updateProduct,
    deleteProduct
  } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category: categories[0],
    materials: [materials[0]],
    colors: [colors[0]],
    qualities: [qualities[0]],
    images: [],
    model3d: '',
    visible: true
  });
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const model3dInputRef = useRef<HTMLInputElement>(null);

  // Cargar productos al montar
  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Manejar upload de imágenes
  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return;

    setUploadingFiles(true);
    try {
      console.log('🔄 Iniciando upload de imágenes...', {
        count: files.length,
        storage: storage.app.options.storageBucket
      });
      
      const uploadPromises = Array.from(files).map(async (file, index) => {
        try {
          console.log(`📤 Subiendo imagen ${index + 1}/${files.length}:`, file.name);
          const filename = `products/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const storageReference = storageRef(storage, filename);
          
          const uploadResult = await uploadBytes(storageReference, file);
          console.log(`✅ Imagen ${index + 1} subida:`, uploadResult.metadata.name);
          
          const url = await getDownloadURL(storageReference);
          console.log(`🔗 URL obtenida:`, url);
          
          return url;
        } catch (fileError) {
          console.error(`❌ Error subiendo imagen ${file.name}:`, fileError);
          throw fileError;
        }
      });

      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...urls]
      }));
      
      // Crear previsualizaciones
      const previews = Array.from(files).map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...previews]);
      
      console.log('🎉 Todas las imágenes subidas exitosamente');
    } catch (error: any) {
      console.error('❌ Error uploading images:', {
        error: error.message,
        code: error.code,
        serverResponse: error.serverResponse
      });
      alert(`Error subiendo imágenes: ${error.message}\n\nPor favor verifica la configuración de Firebase Storage.`);
    } finally {
      setUploadingFiles(false);
    }
  };

  // Manejar upload de modelo 3D
  const handleModel3DUpload = async (file: File) => {
    setUploadingFiles(true);
    try {
      const filename = `models/${Date.now()}_${file.name}`;
      const storageReference = storageRef(storage, filename);
      await uploadBytes(storageReference, file);
      const url = await getDownloadURL(storageReference);
      
      setFormData(prev => ({
        ...prev,
        model3d: url
      }));
    } catch (error) {
      console.error('Error uploading 3D model:', error);
    } finally {
      setUploadingFiles(false);
    }
  };

  // Abrir modal para nuevo producto
  const openNewProductModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: categories[0],
      materials: [materials[0]],
      colors: [colors[0]],
      qualities: [qualities[0]],
      images: [],
      model3d: '',
      visible: true
    });
    setPreviewImages([]);
    setIsModalOpen(true);
  };

  // Abrir modal para editar producto
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      materials: product.materials,
      colors: product.colors,
      qualities: product.qualities,
      images: product.images,
      model3d: product.model3d || '',
      visible: product.visible
    });
    setPreviewImages(product.images);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setPreviewImages([]);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (model3dInputRef.current) model3dInputRef.current.value = '';
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || formData.price <= 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const productData = {
        ...formData,
        images: formData.images.filter(img => img.trim() !== ''),
        model3d: formData.model3d?.trim() || undefined
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  // Eliminar imagen
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  // Eliminar producto
  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Gestión de Productos</h3>
        <button
          onClick={openNewProductModal}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      <div className="p-6">
        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No hay productos aún</p>
            <button
              onClick={openNewProductModal}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Crear tu primer producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Imagen del producto */}
                <div className="relative h-48 bg-gray-100">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Image size={48} className="text-gray-300" />
                    </div>
                  )}
                  
                  {/* Indicadores de visibilidad y 3D */}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {product.model3d && (
                      <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">
                        <Box size={12} className="inline" /> 3D
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.visible ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {product.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </span>
                  </div>
                </div>

                {/* Información del producto */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                    <span className="text-primary-600 font-bold">${product.price}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{product.category.name}</span>
                    <span>{product.images.length} fotos</span>
                  </div>

                  {/* Materiales disponibles */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.materials.slice(0, 3).map((material) => (
                      <span
                        key={material.id}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {material.name}
                      </span>
                    ))}
                    {product.materials.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        +{product.materials.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex justify-between">
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <Edit3 size={14} />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                    >
                      <Trash2 size={14} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de producto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package size={16} className="inline mr-1" />
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: Figura de dragón"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign size={16} className="inline mr-1" />
                    Precio (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-1" />
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Describe el producto, características, uso recomendado..."
                  required
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag size={16} className="inline mr-1" />
                  Categoría
                </label>
                <select
                  value={formData.category.id}
                  onChange={(e) => {
                    const category = categories.find(c => c.id === e.target.value);
                    if (category) setFormData(prev => ({ ...prev, category }));
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Materiales, Colores y Calidades */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Materiales */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Settings size={16} className="inline mr-1" />
                    Materiales
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                    {materials.map((material) => (
                      <label key={material.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.materials.some(m => m.id === material.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                materials: [...prev.materials, material]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                materials: prev.materials.filter(m => m.id !== material.id)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span>{material.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Colores */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Palette size={16} className="inline mr-1" />
                    Colores
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                    {colors.map((color) => (
                      <label key={color.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.colors.some(c => c.id === color.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                colors: [...prev.colors, color]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                colors: prev.colors.filter(c => c.id !== color.id)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <div 
                          className="w-4 h-4 rounded border border-gray-300" 
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Calidades */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Settings size={16} className="inline mr-1" />
                    Calidades
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                    {qualities.map((quality) => (
                      <label key={quality.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.qualities.some(q => q.id === quality.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                qualities: [...prev.qualities, quality]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                qualities: prev.qualities.filter(q => q.id !== quality.id)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span>{quality.name} ({quality.layerHeight}mm)</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Imágenes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Camera size={16} className="inline mr-1" />
                  Imágenes del Producto
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    ref={imageInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingFiles}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Upload size={16} />
                    <span>{uploadingFiles ? 'Subiendo...' : 'Subir Imágenes'}</span>
                  </button>
                  
                  {/* Vista previa de imágenes */}
                  {previewImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-2">
                      {previewImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Preview ${index}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modelo 3D */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Box size={16} className="inline mr-1" />
                  Modelo 3D (Opcional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    ref={model3dInputRef}
                    type="file"
                    accept=".glb,.gltf,.obj,.3mf"
                    onChange={(e) => e.target.files?.[0] && handleModel3DUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => model3dInputRef.current?.click()}
                    disabled={uploadingFiles}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Upload size={16} />
                    <span>{uploadingFiles ? 'Subiendo...' : 'Subir Modelo 3D'}</span>
                  </button>
                  
                  {formData.model3d && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                      <span className="text-sm text-green-700">✓ Modelo 3D cargado</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, model3d: '' }))}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Visibilidad */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.visible}
                    onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Producto visible en el catálogo
                  </span>
                </label>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingFiles}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>{loading ? 'Guardando...' : 'Guardar Producto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
