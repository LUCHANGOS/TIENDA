import React from 'react';
import { Shield, Package, FileText, Users, BarChart3 } from 'lucide-react';
import { useAppStore } from '../store';
import { Navigate } from 'react-router-dom';

const Admin: React.FC = () => {
  const { user } = useAppStore();

  // Redirigir si no es admin
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="empty-state">
            <div className="empty-state-icon">🚧</div>
            <h3 className="empty-state-title">
              Panel de Admin en desarrollo
            </h3>
            <p className="empty-state-message">
              Nuestros desarrolladores están construyendo las mejores herramientas de administración... 
              <br />
              ¡Pronto podrás gestionar productos, cotizaciones y más!
            </p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Package size={32} className="text-purple-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Productos</h4>
                <p className="text-sm text-gray-600">CRUD completo</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <FileText size={32} className="text-orange-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Cotizaciones</h4>
                <p className="text-sm text-gray-600">Gestión y respuesta</p>
              </div>
              <div className="text-center p-4 bg-lime-50 rounded-lg">
                <Users size={32} className="text-lime-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Usuarios</h4>
                <p className="text-sm text-gray-600">Administración</p>
              </div>
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <BarChart3 size={32} className="text-primary-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Estadísticas</h4>
                <p className="text-sm text-gray-600">Analytics</p>
              </div>
            </div>

            <div className="mt-8 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield size={16} className="text-green-500" />
                <span>Acceso autorizado como administrador</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
