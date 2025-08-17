import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Zap, 
  Clock, 
  Star, 
  CheckCircle,
  Package,
  Wrench,
  Gamepad2,
  Sparkles
} from 'lucide-react';

const Home: React.FC = () => {
  const services = [
    {
      id: 'prototypes',
      icon: Wrench,
      title: 'Prototipos Rápidos',
      description: 'Convierte tus ideas en realidad en tiempo récord',
      features: ['Desde 24 horas', 'Múltiples materiales', 'Calidad profesional'],
      color: 'from-primary-500 to-primary-700',
      emoji: '🚀'
    },
    {
      id: 'industrial',
      icon: Package,
      title: 'Piezas Industriales',
      description: 'Componentes técnicos y repuestos bajo demanda',
      features: ['Precisión micrométrica', 'Materiales resistentes', 'Certificación técnica'],
      color: 'from-gray-500 to-gray-700',
      emoji: '⚙️'
    },
    {
      id: 'figurines',
      icon: Gamepad2,
      title: 'Figuras & Decoración',
      description: 'Arte y creatividad en cada detalle',
      features: ['Acabado profesional', 'Colores vibrantes', 'Diseños únicos'],
      color: 'from-orange-500 to-orange-700',
      emoji: '🎭'
    },
    {
      id: 'custom',
      icon: Sparkles,
      title: 'Llaveros Personalizados',
      description: 'Pequeños detalles, grandes momentos',
      features: ['Diseño personalizado', 'Precio accesible', 'Entrega rápida'],
      color: 'from-lime-500 to-lime-700',
      emoji: '🔑'
    }
  ];

  const stats = [
    { label: 'Año de Fundación', value: '2025', icon: CheckCircle },
    { label: 'Entrega Local', value: '24-48h', icon: Clock },
    { label: 'Entrega Nacional', value: '5-7d', icon: Package },
    { label: 'Precisión', value: '0.2mm', icon: Star }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmMGY5ZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contenido */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-4xl animate-bounce">🚀</span>
                <span className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full font-comic">
                  ¡Somos nuevos y estamos listos!
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-poppins font-bold text-gray-900 mb-6">
                <span className="text-indigo-600">NZ</span><span className="text-purple-600">LAB</span>
                <br />
                <span className="text-orange-500">Diseño</span> e <span className="gradient-text">Impresión</span> <span className="text-pink-500">3D</span> ✨
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 font-nunito leading-relaxed">
                Somos una <strong>empresa nueva</strong> de diseño e impresión 3D en Copiapó. 
                Transformamos tus ideas en realidad con tecnología de vanguardia 
                y atención personalizada.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/catalog"
                  className="btn-primary text-lg px-8 py-4 group"
                >
                  Ver Catálogo
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/quote"
                  className="btn-orange text-lg px-8 py-4 group"
                >
                  Cotizar Proyecto
                  <Zap size={20} className="ml-2 group-hover:animate-pulse" />
                </Link>
              </div>
            </div>
            
            {/* Mascota/Ilustración */}
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="text-center">
                  {/* Cubo 3D sonriente como mascota */}
                  <div className="relative mx-auto w-64 h-64 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-purple-600 rounded-3xl transform rotate-6 animate-pulse-slow" />
                    <div className="absolute inset-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl transform -rotate-3" />
                    <div className="absolute inset-4 bg-white rounded-3xl flex items-center justify-center text-6xl animate-bounce">
                      😊
                    </div>
                    
                    {/* Partículas flotantes */}
                    <div className="absolute -top-4 -left-4 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
                    <div className="absolute -top-2 -right-6 text-xl animate-bounce" style={{ animationDelay: '1s' }}>🔥</div>
                    <div className="absolute -bottom-4 -right-2 text-2xl animate-bounce" style={{ animationDelay: '1.5s' }}>⚡</div>
                    <div className="absolute -bottom-2 -left-6 text-xl animate-bounce" style={{ animationDelay: '2s' }}>🎯</div>
                  </div>
                  
                  <h3 className="text-2xl font-poppins font-bold text-gray-900 mb-2">
                    ¡Hola! Soy Cubic 🎭
                  </h3>
                  <p className="text-gray-600 font-comic">
                    Tu asistente virtual de impresión 3D.
                    <br />
                    ¡Estoy aquí para hacer realidad tus sueños más geométricos!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={24} className="text-primary-600" />
                  </div>
                  <div className="text-3xl font-poppins font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-gray-900 mb-4">
              Nuestros Servicios <span className="text-orange-500">Estrella</span> ⭐
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-nunito">
              Desde prototipos industriales hasta figuras de colección, 
              tenemos la solución perfecta para cada proyecto
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 group hover:scale-105 transition-transform"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <span className="text-2xl group-hover:animate-bounce">
                      {service.emoji}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-poppins font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 font-nunito">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-500">
                        <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to={`/catalog?category=${service.id}`}
                    className="block w-full text-center py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors group-hover:bg-primary-100 group-hover:text-primary-700"
                  >
                    Ver Productos
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-poppins font-bold mb-4">
            ¿Listo para hacer realidad tu proyecto? 🚀
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto font-nunito">
            Súbenos tu archivo 3D y recibe una cotización personalizada en minutos. 
            ¡Es más fácil que hacer un cubo perfecto!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/quote"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-lg"
            >
              <Zap size={20} className="mr-2" />
              Cotizar Ahora
            </Link>
            <Link
              to="/catalog"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors text-lg"
            >
              Explorar Catálogo
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
