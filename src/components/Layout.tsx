import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  ShoppingCart, 
  FileText, 
  Settings,
  Menu,
  X,
  User,
  LogOut,
  Zap
} from 'lucide-react';
import { useAppStore } from '../store';
import AdminLoginModal from './AdminLoginModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const { user, cart, logoutUser } = useAppStore();

  // Detector de teclas para modo admin (Ctrl+A)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'a') {
        event.preventDefault();
        setShowAdminModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigation = [
    { name: 'Inicio', href: '/', icon: Home, current: location.pathname === '/' },
    { name: 'Catálogo', href: '/catalog', icon: Search, current: location.pathname === '/catalog' },
    { name: 'Cotizar', href: '/quote', icon: FileText, current: location.pathname === '/quote' },
    { name: 'Carrito', href: '/cart', icon: ShoppingCart, current: location.pathname === '/cart' },
  ];

  const adminNavigation = [
    { name: 'Admin', href: '/admin', icon: Settings, current: location.pathname === '/admin' },
  ];

  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N3D</span>
                </div>
                {/* Mascota cómica */}
                <div className="absolute -top-1 -right-1 text-orange-500 animate-bounce">
                  <Zap size={16} />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-poppins font-bold text-gray-900">
                  New<span className="text-primary-600">Tonic</span>
                  <span className="text-orange-500">3D</span>
                </h1>
                <p className="text-xs text-gray-500 font-comic">¡Impresión que inspira! ✨</p>
              </div>
            </Link>

            {/* Navegación Desktop */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors wiggle-hover ${
                      item.current
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} className="mr-2" />
                    {item.name}
                    {item.name === 'Carrito' && cartItemCount > 0 && (
                      <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-1 cart-bounce">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                );
              })}
              
              {/* Navegación Admin */}
              {user?.isAdmin && adminNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    <Icon size={18} className="mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Usuario y menú móvil */}
            <div className="flex items-center space-x-4">
              {/* Usuario */}
              {user ? (
                <div className="hidden md:flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User size={20} className="text-gray-500" />
                    <span className="text-sm text-gray-700">{user.email}</span>
                    {user.isAdmin && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAdminModal(true)}
                  className="hidden md:inline-flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <User size={18} className="mr-2" />
                  Iniciar sesión
                </button>
              )}

              {/* Menú móvil */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      item.current
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.name}
                    {item.name === 'Carrito' && cartItemCount > 0 && (
                      <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                );
              })}
              
              {/* Admin móvil */}
              {user?.isAdmin && adminNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      item.current
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Usuario móvil */}
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center px-3 py-2">
                      <User size={20} className="text-gray-500 mr-3" />
                      <span className="text-sm text-gray-700">{user.email}</span>
                      {user.isAdmin && (
                        <span className="ml-auto bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <LogOut size={20} className="mr-3" />
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowAdminModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <User size={20} className="mr-3" />
                    Iniciar sesión
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Contenido principal */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">NewTonic3D</h3>
              <p className="text-gray-400 font-comic">
                Convirtiendo ideas en realidad, una capa a la vez 🎯
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Servicios</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Impresión 3D personalizada</li>
                <li>Prototipos rápidos</li>
                <li>Piezas industriales</li>
                <li>Figuras y decoración</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <div className="space-y-2 text-gray-400">
                <p>📧 contacto@newtonic3d.com</p>
                <p>📞 +1 234 567 8900</p>
                <p>📍 Calle de la Innovación 123</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 font-comic">
            <p>© 2024 NewTonic3D. Hecho con ❤️ y mucho filamento.</p>
          </div>
        </div>
      </footer>

      {/* Modal de login admin */}
      <AdminLoginModal 
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
    </div>
  );
};

export default Layout;
