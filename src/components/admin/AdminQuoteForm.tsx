import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  MessageSquare, 
  Save, 
  X, 
  Clock,
  Calculator,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  Shield,
  Unlock
} from 'lucide-react';
import type { Quote } from '../../types';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';

interface AdminQuoteFormProps {
  selectedQuote: Quote;
  onUpdateQuote: (id: string, status: Quote['status'], adminNotes?: string, estimatedPrice?: number, estimatedDays?: number) => Promise<void>;
  onClose: () => void;
}

const AdminQuoteForm: React.FC<AdminQuoteFormProps> = ({ 
  selectedQuote, 
  onUpdateQuote, 
  onClose 
}) => {
  const [formData, setFormData] = useState({
    finalPrice: selectedQuote.estimatedPrice || selectedQuote._internalEstimates?.price || 0,
    estimatedDays: selectedQuote.estimatedDays || selectedQuote._internalEstimates?.totalDays || 3,
    adminNotes: '',
    status: selectedQuote.status
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [decryptedEstimates, setDecryptedEstimates] = useState<any>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [securityInfo, setSecurityInfo] = useState<any>(null);
  
  // Función para descifrar estimaciones internas
  const decryptInternalEstimates = async () => {
    if (!selectedQuote._internalEstimates || typeof selectedQuote._internalEstimates !== 'string') {
      return;
    }
    
    setIsDecrypting(true);
    try {
      const decryptQuoteEstimates = httpsCallable(functions, 'decryptQuoteEstimates');
      const result = await decryptQuoteEstimates({ quoteId: selectedQuote.id });
      
      if (result.data.success) {
        setDecryptedEstimates(result.data.estimates);
        setSecurityInfo({
          securityLevel: result.data.securityLevel,
          lastCalculated: result.data.lastCalculated,
          warning: result.data.warning
        });
        console.log('🔓 Estimaciones descifradas exitosamente');
      }
    } catch (error) {
      console.error('❌ Error descifrando estimaciones:', error);
      alert('Error descifrando estimaciones. Verifica tus permisos.');
    } finally {
      setIsDecrypting(false);
    }
  };
  
  // Descifrar automáticamente si hay estimaciones cifradas
  useEffect(() => {
    if (selectedQuote._internalEstimates && typeof selectedQuote._internalEstimates === 'string') {
      decryptInternalEstimates();
    }
  }, [selectedQuote._internalEstimates]);

  // Calcular datos basados en análisis del archivo
  const calculateFileBasedEstimate = () => {
    if (!selectedQuote.files.length) return null;

    // Datos del primer archivo como referencia
    const mainFile = selectedQuote.files[0];
    const fileSizeMB = mainFile.size / (1024 * 1024);
    
    // Estimaciones basadas en el tamaño del archivo y parámetros
    // Un archivo STL típico de 1MB ≈ 50-100cm³ dependiendo de la complejidad
    const estimatedVolumeCm3 = Math.max(10, fileSizeMB * 75); // Base mínima de 10cm³
    const materialDensity = selectedQuote.material.density || 1.2; // g/cm³
    const estimatedWeight = estimatedVolumeCm3 * materialDensity * selectedQuote.quantity;
    
    // Tiempo de impresión basado en calidad y volumen
    const qualityMultipliers = {
      'draft': 0.8,
      'standard': 1.0, 
      'fine': 1.5,
      'ultrafine': 2.0
    };
    const qualityName = selectedQuote.quality.name.toLowerCase();
    const qualityMultiplier = qualityMultipliers[qualityName] || 1.0;
    
    // Base: 0.5 horas por cm³, ajustado por calidad
    const estimatedPrintTime = estimatedVolumeCm3 * 0.5 * qualityMultiplier;
    
    // Costo de material
    const materialCost = estimatedWeight * selectedQuote.material.pricePerGram;
    
    // Costo de trabajo ($8/hora)
    const laborCost = estimatedPrintTime * 8;
    
    // Recargo por color si aplica
    const colorSurcharge = selectedQuote.color ? (selectedQuote.color.surcharge / 100) : 0;
    
    // Multiplicador de urgencia
    const urgencyMultipliers = {
      'standard': 1.0,
      'express': 1.5,
      'urgent': 2.0
    };
    const urgencyMultiplier = urgencyMultipliers[selectedQuote.urgency] || 1.0;
    
    // Subtotal
    const subtotal = (materialCost + laborCost) * (1 + colorSurcharge) * urgencyMultiplier;
    
    // Margen del 20%
    const finalPrice = subtotal * 1.2;
    
    // Días de producción (8 horas por día) + 2 días de envío
    const productionDays = Math.ceil(estimatedPrintTime / 8);
    const totalDays = Math.max(2, productionDays + 2); // Mínimo 2 días
    
    return {
      estimatedVolume: estimatedVolumeCm3.toFixed(1),
      estimatedWeight: estimatedWeight.toFixed(1),
      estimatedPrintTime: estimatedPrintTime.toFixed(1),
      materialCost: materialCost.toFixed(2),
      laborCost: laborCost.toFixed(2),
      finalPrice: finalPrice.toFixed(2),
      totalDays: totalDays
    };
  };

  const fileAnalysis = calculateFileBasedEstimate();

  // Preferir estimaciones internas del backend si están disponibles
  const preferredEstimate = selectedQuote._internalEstimates || fileAnalysis;

  // Usar la estimación preferida como valor inicial si no hay precio establecido
  useEffect(() => {
    if (!selectedQuote.estimatedPrice && preferredEstimate) {
      const price = selectedQuote._internalEstimates?.price || parseFloat(fileAnalysis?.finalPrice || '0');
      const days = selectedQuote._internalEstimates?.totalDays || fileAnalysis?.totalDays || 3;
      
      setFormData(prev => ({
        ...prev,
        finalPrice: price,
        estimatedDays: days
      }));
    }
  }, [preferredEstimate, selectedQuote.estimatedPrice, selectedQuote._internalEstimates, fileAnalysis]);

  const handleSubmit = async (newStatus: Quote['status']) => {
    if (newStatus === 'quoted' && (!formData.finalPrice || formData.finalPrice <= 0)) {
      alert('Por favor ingresa un precio válido antes de enviar la cotización.');
      return;
    }

    setIsProcessing(true);
    try {
      await onUpdateQuote(
        selectedQuote.id,
        newStatus,
        formData.adminNotes || undefined,
        formData.finalPrice || undefined,
        formData.estimatedDays || undefined
      );
      onClose();
    } catch (error) {
      console.error('Error updating quote:', error);
      alert('Error al actualizar la cotización');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Cotización Manual del Administrador</h4>
      
      {/* Estimaciones internas cifradas del backend */}
      {selectedQuote._internalEstimates && typeof selectedQuote._internalEstimates === 'string' && (
        <div className="mb-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {isDecrypting ? (
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              ) : decryptedEstimates ? (
                <Unlock size={16} className="text-blue-600" />
              ) : (
                <Shield size={16} className="text-blue-600" />
              )}
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-blue-900">Estimación Cifrada del Sistema</h5>
                {securityInfo?.securityLevel && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {securityInfo.securityLevel === 'encrypted' ? '🔒 Cifrado' : '⚠️ Sin cifrar'}
                  </span>
                )}
              </div>
              
              {isDecrypting ? (
                <div className="text-sm text-blue-700 mt-2">
                  <p>🔓 Descifrando estimaciones seguras...</p>
                </div>
              ) : decryptedEstimates ? (
                <>
                  <div className="text-sm text-blue-700 mt-1 grid grid-cols-2 gap-4">
                    <div>
                      <p><strong>Volumen:</strong> {decryptedEstimates.volume?.toFixed(1) || 'N/A'} cm³</p>
                      <p><strong>Peso:</strong> {decryptedEstimates.weight?.toFixed(1) || 'N/A'}g</p>
                      <p><strong>Tiempo impresión:</strong> {decryptedEstimates.printTime?.toFixed(1) || 'N/A'}h</p>
                    </div>
                    <div>
                      <p><strong>Costo material:</strong> ${decryptedEstimates.materialCost?.toFixed(2) || 'N/A'}</p>
                      <p><strong>Costo trabajo:</strong> ${decryptedEstimates.laborCost?.toFixed(2) || 'N/A'}</p>
                      <p><strong>Precio calculado:</strong> ${decryptedEstimates.price?.toFixed(2) || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {securityInfo?.warning && (
                    <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                      ⚠️ {securityInfo.warning}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        finalPrice: decryptedEstimates?.price || prev.finalPrice,
                        estimatedDays: decryptedEstimates?.totalDays || prev.estimatedDays
                      }))}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Usar Estimación del Sistema
                    </button>
                    
                    <button
                      onClick={decryptInternalEstimates}
                      className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                    >
                      🔄 Actualizar
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-sm text-blue-700 mt-2">
                  <p className="mb-2">🔒 Estimaciones protegidas con cifrado AES-256-GCM</p>
                  <button
                    onClick={decryptInternalEstimates}
                    disabled={isDecrypting}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    🔓 Descifrar Estimaciones
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Análisis automático basado en archivo (solo si no hay estimaciones internas) */}
      {!selectedQuote._internalEstimates && fileAnalysis && (
        <div className="mb-4 p-3 bg-green-50 rounded border-l-4 border-green-400">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Calculator size={16} className="text-green-600" />
            </div>
            <div className="ml-3">
              <h5 className="text-sm font-medium text-green-900">Análisis Basado en Archivo 3D</h5>
              <div className="text-sm text-green-700 mt-1 grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Volumen estimado:</strong> {fileAnalysis.estimatedVolume} cm³</p>
                  <p><strong>Peso estimado:</strong> {fileAnalysis.estimatedWeight}g</p>
                  <p><strong>Tiempo impresión:</strong> {fileAnalysis.estimatedPrintTime}h</p>
                </div>
                <div>
                  <p><strong>Costo material:</strong> ${fileAnalysis.materialCost}</p>
                  <p><strong>Costo trabajo:</strong> ${fileAnalysis.laborCost}</p>
                  <p><strong>Precio sugerido:</strong> ${fileAnalysis.finalPrice}</p>
                </div>
              </div>
              <button
                onClick={() => setFormData(prev => ({
                  ...prev,
                  finalPrice: parseFloat(fileAnalysis.finalPrice),
                  estimatedDays: fileAnalysis.totalDays
                }))}
                className="mt-2 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Usar Precio Sugerido
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Precio final */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <DollarSign size={16} />
            <span>Precio Final (USD) *</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.finalPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, finalPrice: parseFloat(e.target.value) || 0 }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="0.00"
          />
          <p className="text-xs text-gray-500 mt-1">Precio que será enviado al cliente</p>
        </div>

        {/* Días estimados */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Clock size={16} />
            <span>Días de Entrega *</span>
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={formData.estimatedDays}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedDays: parseInt(e.target.value) || 1 }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-xs text-gray-500 mt-1">Incluye producción y envío</p>
        </div>
      </div>

      {/* Notas del administrador */}
      <div className="mb-4">
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
          <MessageSquare size={16} />
          <span>Mensaje al Cliente (opcional)</span>
        </label>
        <textarea
          value={formData.adminNotes}
          onChange={(e) => setFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Mensaje personalizado que se enviará al cliente junto con la cotización..."
        />
        <p className="text-xs text-gray-500 mt-1">Este mensaje aparecerá en el email de cotización</p>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={() => handleSubmit('processing')}
          disabled={isProcessing}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
        >
          <Clock size={16} />
          <span>Marcar en Proceso</span>
        </button>
        
        <button
          onClick={() => handleSubmit('quoted')}
          disabled={isProcessing || !formData.finalPrice}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2"
        >
          <Send size={16} />
          <span>Enviar Cotización</span>
        </button>
        
        <button
          onClick={() => handleSubmit('rejected')}
          disabled={isProcessing}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 flex items-center space-x-2"
        >
          <XCircle size={16} />
          <span>Rechazar</span>
        </button>

        {isProcessing && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
            <span>Procesando...</span>
          </div>
        )}
      </div>

      {/* Información de ayuda */}
      <div className="mt-4 p-3 bg-blue-50 rounded">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle size={16} className="text-blue-600" />
          </div>
          <div className="ml-3">
            <h6 className="text-sm font-medium text-blue-900">Consejos para Cotizaciones</h6>
            <div className="text-sm text-blue-700 mt-1">
              <ul className="list-disc list-inside space-y-1">
                <li>Descarga y analiza los archivos 3D antes de establecer el precio final</li>
                <li>Considera la complejidad del modelo, soportes necesarios y tiempo de post-procesamiento</li>
                <li>El precio sugerido es automático - ajústalo según tu análisis profesional</li>
                <li>Incluye un mensaje personalizado para mejorar la comunicación con el cliente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuoteForm;
