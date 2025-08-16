import React, { useState, useEffect } from 'react';
import {
  Shield,
  Package,
  FileText,
  BarChart3,
  Edit3,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Settings,
  Save,
  X
} from 'lucide-react';
import { useAppStore } from '../store';
import { Navigate } from 'react-router-dom';
import type { Quote, Material } from '../types';

type AdminSection = 'dashboard' | 'quotes' | 'products' | 'materials' | 'settings';

const Admin: React.FC = () => {
  const {
    user,
    quotes,
    products,
    materials,
    loading,
    loadQuotes,
    updateQuoteStatus,
    deleteQuote,
    updateMaterials
  } = useAppStore();

  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [editingMaterials, setEditingMaterials] = useState(false);
  const [tempMaterials, setTempMaterials] = useState<Material[]>(materials);

  // Redirigir si no es admin
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Cargar datos al montar
  useEffect(() => {
    if (user?.isAdmin) {
      loadQuotes();
    }
  }, [user, loadQuotes]);

  // Estadísticas del dashboard
  const stats = {
    totalQuotes: quotes.length,
    pendingQuotes: quotes.filter(q => q.status === 'pending').length,
    quotedQuotes: quotes.filter(q => q.status === 'quoted').length,
    acceptedQuotes: quotes.filter(q => q.status === 'accepted').length,
    totalProducts: products.length,
    visibleProducts: products.filter(p => p.visible).length
  };

  // Manejar actualización de cotización
  const handleUpdateQuote = async (id: string, status: Quote['status'], adminNotes?: string, estimatedPrice?: number, estimatedDays?: number) => {
    try {
      await updateQuoteStatus(id, status, adminNotes, estimatedPrice, estimatedDays);
      setSelectedQuote(null);
    } catch (error) {
      console.error('Error updating quote:', error);
    }
  };

  // Renderizar sección del dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <FileText size={24} className="text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cotizaciones</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuotes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <Clock size={24} className="text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingQuotes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <CheckCircle size={24} className="text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cotizadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.quotedQuotes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <Package size={24} className="text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Productos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cotizaciones recientes */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Cotizaciones Recientes</h3>
        </div>
        <div className="p-6">
          {quotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No hay cotizaciones aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.slice(0, 5).map((quote) => (
                <div key={quote.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{quote.name}</p>
                    <p className="text-sm text-gray-600">{quote.email}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(quote.createdAt).toLocaleDateString()} - {quote.files.length} archivo(s)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      quote.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      quote.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
                      quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {quote.status}
                    </span>
                    <button
                      onClick={() => setSelectedQuote(quote)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Renderizar sección de cotizaciones
  const renderQuotes = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Gestión de Cotizaciones</h3>
      </div>
      <div className="p-6">
        {quotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No hay cotizaciones para gestionar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div key={quote.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{quote.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        quote.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        quote.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
                        quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {quote.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><Mail size={14} className="inline mr-1" />{quote.email}</p>
                        {quote.phone && <p><Phone size={14} className="inline mr-1" />{quote.phone}</p>}
                        <p><Calendar size={14} className="inline mr-1" />{new Date(quote.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p>Material: {quote.material.name}</p>
                        <p>Calidad: {quote.quality.name}</p>
                        <p>Cantidad: {quote.quantity}</p>
                        <p>Urgencia: {quote.urgency}</p>
                      </div>
                    </div>
                    
                    {quote.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                        <strong>Notas:</strong> {quote.notes}
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Archivos: {quote.files.map(f => f.name).join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedQuote(quote)}
                      className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700"
                    >
                      Gestionar
                    </button>
                    <button
                      onClick={() => deleteQuote(quote.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Renderizar sección de materiales
  const renderMaterials = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Gestión de Materiales</h3>
        <button
          onClick={() => {
            setEditingMaterials(!editingMaterials);
            setTempMaterials(materials);
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 flex items-center space-x-2"
        >
          <Edit3 size={16} />
          <span>{editingMaterials ? 'Cancelar' : 'Editar'}</span>
        </button>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(editingMaterials ? tempMaterials : materials).map((material, index) => (
            <div key={material.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                {editingMaterials ? (
                  <input
                    type="text"
                    value={material.name}
                    onChange={(e) => {
                      const updated = [...tempMaterials];
                      updated[index] = { ...updated[index], name: e.target.value };
                      setTempMaterials(updated);
                    }}
                    className="font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1"
                  />
                ) : (
                  <h4 className="font-semibold text-gray-900">{material.name}</h4>
                )}
                <span className={`px-2 py-1 text-xs rounded ${
                  material.category === 'plastic' ? 'bg-blue-100 text-blue-800' :
                  material.category === 'resin' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {material.category}
                </span>
              </div>
              
              {editingMaterials ? (
                <div className="space-y-2">
                  <textarea
                    value={material.description}
                    onChange={(e) => {
                      const updated = [...tempMaterials];
                      updated[index] = { ...updated[index], description: e.target.value };
                      setTempMaterials(updated);
                    }}
                    className="w-full text-sm text-gray-600 border border-gray-300 rounded px-2 py-1"
                    rows={2}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.001"
                      value={material.pricePerGram}
                      onChange={(e) => {
                        const updated = [...tempMaterials];
                        updated[index] = { ...updated[index], pricePerGram: parseFloat(e.target.value) };
                        setTempMaterials(updated);
                      }}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                      placeholder="Precio/g"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={material.density}
                      onChange={(e) => {
                        const updated = [...tempMaterials];
                        updated[index] = { ...updated[index], density: parseFloat(e.target.value) };
                        setTempMaterials(updated);
                      }}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                      placeholder="Densidad"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                  <div className="text-sm space-y-1">
                    <p><DollarSign size={12} className="inline mr-1" />${material.pricePerGram}/g</p>
                    <p>Densidad: {material.density} g/cm³</p>
                    <p>Colores: {material.colors.length}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {material.properties.map((prop, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {prop}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {editingMaterials && (
          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={() => {
                setEditingMaterials(false);
                setTempMaterials(materials);
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                await updateMaterials(tempMaterials);
                setEditingMaterials(false);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Guardar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-2">
            Panel de Administración 🛡️
          </h1>
          <p className="text-gray-600 font-nunito">
            Bienvenido al centro de control, {user.email}
          </p>
        </div>

        {/* Navegación de secciones */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
                { id: 'quotes', name: 'Cotizaciones', icon: FileText },
                { id: 'products', name: 'Productos', icon: Package },
                { id: 'materials', name: 'Materiales', icon: Settings },
              ].map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as AdminSection)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeSection === section.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{section.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenido de la sección activa */}
        <div>
          {activeSection === 'dashboard' && renderDashboard()}
          {activeSection === 'quotes' && renderQuotes()}
          {activeSection === 'materials' && renderMaterials()}
          {activeSection === 'products' && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestión de Productos</h3>
              <p className="text-gray-600">Funcionalidad de productos en desarrollo</p>
            </div>
          )}
        </div>

        {/* Modal de gestión de cotización */}
        {selectedQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Gestionar Cotización - {selectedQuote.name}
                  </h3>
                  <button
                    onClick={() => setSelectedQuote(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Email:</strong> {selectedQuote.email}</p>
                      <p><strong>Teléfono:</strong> {selectedQuote.phone || 'N/A'}</p>
                      <p><strong>Material:</strong> {selectedQuote.material.name}</p>
                      <p><strong>Calidad:</strong> {selectedQuote.quality.name}</p>
                    </div>
                    <div>
                      <p><strong>Cantidad:</strong> {selectedQuote.quantity}</p>
                      <p><strong>Urgencia:</strong> {selectedQuote.urgency}</p>
                      <p><strong>Estado actual:</strong> {selectedQuote.status}</p>
                      <p><strong>Precio estimado:</strong> ${selectedQuote.estimatedPrice || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {selectedQuote.notes && (
                    <div className="p-3 bg-gray-50 rounded">
                      <strong>Notas del cliente:</strong>
                      <p className="text-sm mt-1">{selectedQuote.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateQuote(selectedQuote.id, 'processing')}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Marcar en Proceso
                    </button>
                    <button
                      onClick={() => handleUpdateQuote(selectedQuote.id, 'quoted', 'Cotización enviada', selectedQuote.estimatedPrice)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Marcar Cotizada
                    </button>
                    <button
                      onClick={() => handleUpdateQuote(selectedQuote.id, 'rejected', 'Cotización rechazada')}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Indicador de acceso autorizado */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield size={16} className="text-green-500" />
            <span>Acceso autorizado como administrador</span>
            {loading && (
              <div className="ml-auto">
                <div className="animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
