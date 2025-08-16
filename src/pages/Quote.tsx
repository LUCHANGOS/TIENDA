import React from 'react';
import { Upload, FileText, Calculator } from 'lucide-react';

const Quote: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-2">
            Cotización Personalizada 📋
          </h1>
          <p className="text-gray-600 font-nunito">
            Sube tu archivo 3D y recibe una cotización detallada
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="empty-state">
            <div className="empty-state-icon">🚧</div>
            <h3 className="empty-state-title">
              Cotizador en construcción
            </h3>
            <p className="empty-state-message">
              Nuestros ingenieros están calibrando las mejores algoritmos de cotización... 
              <br />
              ¡Pronto podrás subir tus archivos STL aquí!
            </p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <Upload size={32} className="text-primary-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Sube archivos</h4>
                <p className="text-sm text-gray-600">STL, OBJ, 3MF</p>
              </div>
              <div className="text-center">
                <Calculator size={32} className="text-orange-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Cotización automática</h4>
                <p className="text-sm text-gray-600">En minutos</p>
              </div>
              <div className="text-center">
                <FileText size={32} className="text-lime-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Recibe presupuesto</h4>
                <p className="text-sm text-gray-600">Por email</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quote;
