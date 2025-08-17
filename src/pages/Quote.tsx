import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  Zap
} from 'lucide-react';
import { useAppStore } from '../store';
import type { QuoteFile } from '../types';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

interface FileUpload {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

const Quote: React.FC = () => {
  const { materials, qualities, colors, settings, submitQuote, loading } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados del formulario
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    materialId: '',
    qualityId: '',
    colorId: '',
    quantity: 1,
    urgency: 'standard' as 'standard' | 'express' | 'urgent',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [quoteId, setQuoteId] = useState<string | null>(null);

  // Obtener objetos completos
  const selectedMaterial = materials.find(m => m.id === formData.materialId);
  const selectedQuality = qualities.find(q => q.id === formData.qualityId);
  const selectedColor = colors.find(c => c.id === formData.colorId);

  // Manejar carga de archivos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    
    uploadedFiles.forEach(file => {
      // Validar tipo de archivo
      const validTypes = settings.features.allowedFileTypes;
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(fileExtension)) {
        setErrors(prev => ({ ...prev, files: `Tipo de archivo no permitido: ${fileExtension}` }));
        return;
      }
      
      // Validar tamaño
      if (file.size > settings.features.maxFileSize * 1024 * 1024) {
        setErrors(prev => ({ ...prev, files: `Archivo muy grande. Máximo ${settings.features.maxFileSize}MB` }));
        return;
      }
      
      const fileUpload: FileUpload = {
        file,
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type
      };
      
      setFiles(prev => [...prev, fileUpload]);
      setErrors(prev => ({ ...prev, files: '' }));
    });
    
    // Limpiar input
    if (event.target) event.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validar formulario
  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};
    
    if (stepNumber === 1) {
      if (files.length === 0) {
        newErrors.files = 'Debes subir al menos un archivo';
      }
    }
    
    if (stepNumber === 2) {
      if (!formData.materialId) newErrors.material = 'Selecciona un material';
      if (!formData.qualityId) newErrors.quality = 'Selecciona una calidad';
      if (formData.quantity < 1) newErrors.quantity = 'La cantidad debe ser mayor a 0';
    }
    
    if (stepNumber === 3) {
      if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
      if (!formData.email.trim()) newErrors.email = 'El email es requerido';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
      if (settings.features.requirePhoneForQuotes && !formData.phone.trim()) {
        newErrors.phone = 'El teléfono es requerido';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  // Calcular estimación de precio
  const calculateEstimate = () => {
    if (!selectedMaterial || !selectedQuality) return null;
    
    // Estimación básica (en una implementación real, esto sería más sofisticado)
    const basePrice = 50; // Precio base por archivo
    const materialMultiplier = selectedMaterial.pricePerGram * 10; // Estimación de material
    const qualityMultiplier = selectedQuality.priceMultiplier;
    const colorSurcharge = selectedColor ? selectedColor.surcharge / 100 : 0;
    const urgencyMultiplier = settings.pricing.urgencyMultipliers[formData.urgency];
    
    const subtotal = (basePrice + materialMultiplier) * qualityMultiplier * (1 + colorSurcharge) * formData.quantity;
    const urgencyTotal = subtotal * urgencyMultiplier;
    const tax = urgencyTotal * settings.pricing.taxRate;
    const total = urgencyTotal + tax;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      urgencyTotal: Math.round(urgencyTotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  };

  const estimate = calculateEstimate();

  // Enviar cotización
  const handleSubmit = async () => {
    if (!validateStep(3) || !selectedMaterial || !selectedQuality) return;
    
    try {
      setErrors({ submit: '' });
      
      // Subir archivos a Firebase Storage
      console.log('🔄 Subiendo archivos a Firebase Storage...');
      const uploadPromises = files.map(async (file) => {
        try {
          // Crear un nombre único para el archivo
          const timestamp = Date.now();
          const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filename = `quotes/uploads/${timestamp}_${sanitizedName}`;
          
          // Crear referencia y subir archivo
          const fileRef = storageRef(storage, filename);
          console.log(`📤 Subiendo archivo: ${file.name}`);
          
          const uploadResult = await uploadBytes(fileRef, file.file);
          const downloadURL = await getDownloadURL(fileRef);
          
          console.log(`✅ Archivo subido exitosamente: ${file.name}`);
          
          return {
            name: file.name,
            size: file.size,
            type: file.type,
            url: downloadURL,
            storagePath: filename // Guardar la ruta para referencia
          } as QuoteFile;
        } catch (fileError) {
          console.error(`❌ Error subiendo archivo ${file.name}:`, fileError);
          throw new Error(`Error subiendo archivo ${file.name}: ${fileError}`);
        }
      });
      
      const uploadedFiles = await Promise.all(uploadPromises);
      console.log('🎉 Todos los archivos subidos exitosamente');
      
      const quoteData = {
        name: formData.name,
        email: formData.email,
        ...(formData.phone && formData.phone.trim() && { phone: formData.phone }),
        files: uploadedFiles,
        material: selectedMaterial,
        quality: selectedQuality,
        ...(selectedColor && { color: selectedColor }),
        quantity: formData.quantity,
        urgency: formData.urgency,
        ...(formData.notes && formData.notes.trim() && { notes: formData.notes }),
        ...(estimate?.total && { estimatedPrice: estimate.total })
      };
      
      const id = await submitQuote(quoteData);
      setQuoteId(id);
      setSubmitted(true);
    } catch (error) {
      console.error('Error al enviar cotización:', error);
      setErrors({ submit: `Error al enviar la cotización: ${error}` });
    }
  };

  // Si ya se envió la cotización
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-poppins font-bold text-gray-900 mb-2">
              ¡Cotización Enviada! 🎉
            </h1>
            <p className="text-gray-600 font-nunito mb-6">
              Hemos recibido tu solicitud de cotización.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-2">
                <strong>ID de cotización:</strong> {quoteId}
              </div>
              <div className="text-sm text-gray-600">
                <strong>Email de contacto:</strong> {formData.email}
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>✅ Recibirás un email de confirmación en breve</p>
              <p>✅ Analizaremos tus archivos y te enviaremos una cotización detallada</p>
              <p>✅ Tiempo estimado de respuesta: 24-48 horas</p>
            </div>
            
            <button
              onClick={() => {
                setSubmitted(false);
                setStep(1);
                setFiles([]);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  materialId: '',
                  qualityId: '',
                  colorId: '',
                  quantity: 1,
                  urgency: 'standard',
                  notes: ''
                });
                setQuoteId(null);
              }}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Nueva Cotización
            </button>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center space-x-2 ${
                  step >= stepNumber ? 'text-primary-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step >= stepNumber
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {stepNumber}
                </div>
                <span className="font-medium">
                  {stepNumber === 1 && 'Archivos'}
                  {stepNumber === 2 && 'Configuración'}
                  {stepNumber === 3 && 'Contacto'}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Paso 1: Subir archivos */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Sube tus archivos 3D</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                <Upload size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={settings.features.allowedFileTypes.join(',')}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Seleccionar Archivos
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Formatos: {settings.features.allowedFileTypes.join(', ')} | 
                  Máximo: {settings.features.maxFileSize}MB por archivo
                </p>
              </div>
              
              {errors.files && (
                <div className="flex items-center space-x-2 text-red-600 mb-4">
                  <AlertCircle size={16} />
                  <span className="text-sm">{errors.files}</span>
                </div>
              )}
              
              {files.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h3 className="font-medium text-gray-900">Archivos seleccionados:</h3>
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText size={20} className="text-primary-600" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={nextStep}
                  disabled={files.length === 0}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Paso 2: Configuración */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Configuración de Impresión</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Material */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material *
                  </label>
                  <select
                    value={formData.materialId}
                    onChange={(e) => setFormData(prev => ({ ...prev, materialId: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.material ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecciona un material</option>
                    {materials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name} - ${material.pricePerGram}/g
                      </option>
                    ))}
                  </select>
                  {errors.material && (
                    <p className="text-red-600 text-sm mt-1">{errors.material}</p>
                  )}
                  {selectedMaterial && (
                    <p className="text-sm text-gray-600 mt-1">{selectedMaterial.description}</p>
                  )}
                </div>
                
                {/* Calidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calidad *
                  </label>
                  <select
                    value={formData.qualityId}
                    onChange={(e) => setFormData(prev => ({ ...prev, qualityId: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.quality ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecciona una calidad</option>
                    {qualities.map((quality) => (
                      <option key={quality.id} value={quality.id}>
                        {quality.name} - {quality.layerHeight}mm
                      </option>
                    ))}
                  </select>
                  {errors.quality && (
                    <p className="text-red-600 text-sm mt-1">{errors.quality}</p>
                  )}
                  {selectedQuality && (
                    <p className="text-sm text-gray-600 mt-1">{selectedQuality.description}</p>
                  )}
                </div>
                
                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color (opcional)
                  </label>
                  <select
                    value={formData.colorId}
                    onChange={(e) => setFormData(prev => ({ ...prev, colorId: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Selecciona un color</option>
                    {colors
                      .filter(color => !selectedMaterial || selectedMaterial.colors.includes(color.id))
                      .map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name} {color.surcharge > 0 && `(+${color.surcharge}%)`}
                      </option>
                    ))}
                  </select>
                  {selectedColor && (
                    <div className="flex items-center space-x-2 mt-1">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: selectedColor.hex }}
                      ></div>
                      <span className="text-sm text-gray-600">{selectedColor.name}</span>
                    </div>
                  )}
                </div>
                
                {/* Cantidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.quantity ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.quantity && (
                    <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>
                  )}
                </div>
              </div>
              
              {/* Urgencia */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Urgencia
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { key: 'standard', label: 'Estándar', time: '5-7 días', multiplier: settings.pricing.urgencyMultipliers.standard },
                    { key: 'express', label: 'Express', time: '2-3 días', multiplier: settings.pricing.urgencyMultipliers.express },
                    { key: 'urgent', label: 'Urgente', time: '24-48 hrs', multiplier: settings.pricing.urgencyMultipliers.urgent }
                  ].map((option) => (
                    <label
                      key={option.key}
                      className={`relative flex items-center p-4 border rounded-lg cursor-pointer ${
                        formData.urgency === option.key
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={option.key}
                        checked={formData.urgency === option.key}
                        onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as any }))}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          {option.key === 'urgent' && <Zap size={16} className="text-orange-500" />}
                          {option.key === 'express' && <Clock size={16} className="text-blue-500" />}
                          <p className="font-medium text-gray-900">{option.label}</p>
                        </div>
                        <p className="text-sm text-gray-600">{option.time}</p>
                        {option.multiplier !== 1 && (
                          <p className="text-sm text-orange-600">+{Math.round((option.multiplier - 1) * 100)}% costo</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Estimación de precio */}
              {estimate && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Estimación Preliminar</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${estimate.subtotal}</span>
                    </div>
                    {formData.urgency !== 'standard' && (
                      <div className="flex justify-between">
                        <span>Con urgencia:</span>
                        <span>${estimate.urgencyTotal}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Impuestos ({Math.round(settings.pricing.taxRate * 100)}%):</span>
                      <span>${estimate.tax}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total estimado:</span>
                      <span>${estimate.total}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * Esta es una estimación preliminar. El precio final puede variar según el análisis detallado de tus archivos.
                  </p>
                </div>
              )}
              
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={nextStep}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Paso 3: Información de contacto */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <User size={16} />
                    <span>Nombre completo *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tu nombre completo"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} />
                    <span>Email *</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone size={16} />
                    <span>Teléfono {settings.features.requirePhoneForQuotes && '*'}</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+1 234 567 8900"
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare size={16} />
                  <span>Notas adicionales (opcional)</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Información adicional sobre tu proyecto, requisitos especiales, fechas límite, etc."
                />
              </div>
              
              {/* Resumen */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Resumen de tu cotización</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Archivos:</strong> {files.length} archivo(s)</div>
                  <div><strong>Material:</strong> {selectedMaterial?.name}</div>
                  <div><strong>Calidad:</strong> {selectedQuality?.name}</div>
                  {selectedColor && <div><strong>Color:</strong> {selectedColor.name}</div>}
                  <div><strong>Cantidad:</strong> {formData.quantity}</div>
                  <div><strong>Urgencia:</strong> {formData.urgency}</div>
                  {estimate && <div><strong>Total estimado:</strong> ${estimate.total}</div>}
                </div>
              </div>
              
              {errors.submit && (
                <div className="flex items-center space-x-2 text-red-600 mb-4">
                  <AlertCircle size={16} />
                  <span className="text-sm">{errors.submit}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {loading && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
                  <span>{loading ? 'Enviando...' : 'Enviar Cotización'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quote;
