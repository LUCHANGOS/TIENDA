import React, { useState } from 'react';
import { X, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginUser, loading } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      await loginUser(email, password);
      onClose();
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setError('Credenciales inválidas. Verifica tu email y contraseña.');
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={handleClose}
            >
              <X size={24} />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-poppins font-semibold text-gray-900 mb-4">
                🔐 Acceso Administrativo
              </h3>
              
              <p className="text-sm text-gray-500 mb-6 font-comic">
                ¡Hola admin! Introduce tus credenciales para acceder al panel de control 🚀
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2">
                    <AlertCircle size={20} className="text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="label">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={20} className="text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input pl-10"
                      placeholder="tu-email@ejemplo.com"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="label">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={20} className="text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pl-10"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn-secondary flex-1"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="loading-spinner mr-2" />
                        Iniciando...
                      </div>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-4 text-xs text-gray-500 text-center font-comic">
                💡 Tip: Presiona Ctrl+A en cualquier momento para abrir este panel
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
