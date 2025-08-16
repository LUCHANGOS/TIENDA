import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-lg mx-auto text-center">
        {/* Ilustración 404 cómica */}
        <div className="mb-8">
          <div className="relative mx-auto w-48 h-48 mb-6">
            {/* Número 404 estilizado */}
            <div className="text-8xl font-poppins font-bold text-gray-300 flex items-center justify-center h-full">
              4<span className="text-orange-500 animate-bounce mx-2">🔍</span>4
            </div>
          </div>
          
          {/* Mensaje cómico */}
          <div className="space-y-4">
            <h1 className="text-3xl font-poppins font-bold text-gray-900">
              ¡Oops! Página extraviada 📦
            </h1>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="text-6xl mb-4 animate-wiggle">🤖</div>
              <p className="text-lg text-gray-600 font-comic leading-relaxed mb-4">
                Parece que esta página se fue a imprimir... 
                <br />
                ¡y se nos olvidó dónde la dejamos!
              </p>
              
              <div className="text-sm text-gray-500 font-nunito bg-gray-50 rounded-lg p-3 mb-6">
                <p className="mb-2">
                  <strong>Error 404:</strong> "Archivo no encontrado en la impresora virtual"
                </p>
                <p>
                  💡 Tal vez Cubic nuestro asistente se la llevó para hacerle mejoras...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn-primary text-lg px-6 py-3 group"
            >
              <Home size={20} className="mr-2" />
              Volver al Inicio
            </Link>
            
            <Link
              to="/catalog"
              className="btn-orange text-lg px-6 py-3 group"
            >
              <Search size={20} className="mr-2" />
              Explorar Catálogo
            </Link>
          </div>
          
          <button
            onClick={() => window.history.back()}
            className="btn-secondary px-6 py-2 group"
          >
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Página Anterior
          </button>
        </div>

        {/* Mensaje adicional */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 font-comic">
            Si crees que esto es un error, nuestro equipo de debugging está 
            <span className="text-orange-500"> trabajando 24/7 </span> 
            (bueno, cuando no están jugando con las impresoras 3D) 🎮
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
