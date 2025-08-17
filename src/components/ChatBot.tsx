import React, { useState } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '¡Hola! 👋 Soy Cubic, el asistente virtual de NZLAB. ¿En qué puedo ayudarte hoy?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');

  const quickReplies = [
    '¿Qué servicios ofrecen?',
    '¿Cuánto cuesta una impresión?',
    '¿Dónde están ubicados?',
    '¿Cuáles son los tiempos de entrega?'
  ];

  const botResponses: { [key: string]: string } = {
    'servicios': '🔧 En NZLAB ofrecemos:\n• Diseño 3D personalizado\n• Impresión 3D profesional\n• Prototipos rápidos\n• Figuras y decoración\n• Piezas industriales\n\n¿Te interesa algún servicio en particular?',
    'costo': '💰 Los costos varían según:\n• Material elegido\n• Tamaño del objeto\n• Calidad de impresión\n• Cantidad de piezas\n\n¡Usa nuestro cotizador para obtener un precio exacto!',
    'ubicacion': '📍 Estamos ubicados en:\nEleuterio Ramírez 696, Copiapó\n\n📞 Contáctanos: +56 9 2614 3193\n📧 Email: soporte@wwwnewtonic.com',
    'tiempo': '⏱️ Nuestros tiempos de entrega:\n• En Copiapó: 24-48h\n• Fuera de Copiapó: 5-7 días\n• Proyectos complejos: +2-3 días\n\n¡Somos rápidos porque somos una empresa nueva con mucha energía! 🚀',
    'default': '🤔 Interesante pregunta. Como somos NZLAB, una empresa nueva de diseño e impresión 3D, te recomiendo:\n\n1. Visitar nuestro catálogo\n2. Usar nuestro cotizador\n3. Contactarnos directamente\n\n¿Hay algo específico en lo que pueda ayudarte?'
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Añadir mensaje del usuario
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Generar respuesta del bot
    setTimeout(() => {
      let botResponse = botResponses.default;
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes('servicio') || lowerText.includes('qué hacen') || lowerText.includes('ofrecen')) {
        botResponse = botResponses.servicios;
      } else if (lowerText.includes('costo') || lowerText.includes('precio') || lowerText.includes('cuanto')) {
        botResponse = botResponses.costo;
      } else if (lowerText.includes('ubicacion') || lowerText.includes('donde') || lowerText.includes('direccion')) {
        botResponse = botResponses.ubicacion;
      } else if (lowerText.includes('tiempo') || lowerText.includes('entrega') || lowerText.includes('demora')) {
        botResponse = botResponses.tiempo;
      }

      const botMessage: ChatMessage = {
        id: Date.now().toString() + '_bot',
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
        } text-white animate-pulse`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl z-50 flex flex-col border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Bot size={20} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Cubic - Asistente NZLAB</h3>
                <p className="text-xs text-indigo-100">En línea ahora</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm whitespace-pre-line ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-indigo-500 text-white'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Replies */}
          <div className="px-4 py-2 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {quickReplies.slice(0, 2).map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(reply)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-700 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleSendMessage(inputText)}
                className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
