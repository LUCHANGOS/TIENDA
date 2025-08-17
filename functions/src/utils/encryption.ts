import * as crypto from 'crypto';

// Configuración de cifrado
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits

// Clave maestra desde variables de entorno
const getMasterKey = (): Buffer => {
  const masterKey = process.env.ENCRYPTION_MASTER_KEY;
  if (!masterKey) {
    throw new Error('ENCRYPTION_MASTER_KEY environment variable is required');
  }
  return Buffer.from(masterKey, 'hex');
};

// Derivar clave usando PBKDF2
const deriveKey = (password: Buffer, salt: Buffer): Buffer => {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
};

// Generar salt aleatorio
const generateSalt = (): Buffer => {
  return crypto.randomBytes(SALT_LENGTH);
};

// Generar IV aleatorio
const generateIV = (): Buffer => {
  return crypto.randomBytes(IV_LENGTH);
};

/**
 * Cifra datos sensibles usando AES-256-GCM con derivación de clave PBKDF2
 */
export const encryptSensitiveData = (data: any): string => {
  try {
    const masterKey = getMasterKey();
    const salt = generateSalt();
    const iv = generateIV();
    
    // Derivar clave específica
    const derivedKey = deriveKey(masterKey, salt);
    
    // Serializar datos
    const plaintext = JSON.stringify(data);
    
    // Crear cipher con IV
    const cipher = crypto.createCipherGCM(ALGORITHM, derivedKey, iv);
    cipher.setAAD(Buffer.from('NewTonic3D-Internal-Data', 'utf8'));
    
    // Cifrar
    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Obtener tag de autenticación
    const tag = cipher.getAuthTag();
    
    // Combinar: salt + iv + tag + data cifrada
    const result = Buffer.concat([
      salt,
      iv, 
      tag,
      encrypted
    ]);
    
    return result.toString('base64');
  } catch (error) {
    console.error('Error encrypting data:', error);
    throw new Error('Encryption failed');
  }
};

/**
 * Descifra datos sensibles
 */
export const decryptSensitiveData = (encryptedData: string): any => {
  try {
    const masterKey = getMasterKey();
    const buffer = Buffer.from(encryptedData, 'base64');
    
    // Extraer componentes
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    // Derivar clave
    const derivedKey = deriveKey(masterKey, salt);
    
    // Crear decipher con IV
    const decipher = crypto.createDecipherGCM(ALGORITHM, derivedKey, iv);
    decipher.setAAD(Buffer.from('NewTonic3D-Internal-Data', 'utf8'));
    decipher.setAuthTag(tag);
    
    // Descifrar
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error decrypting data:', error);
    throw new Error('Decryption failed');
  }
};

/**
 * Cifra estimaciones internas específicamente
 */
export const encryptInternalEstimates = (estimates: any): string => {
  const sensitiveData = {
    ...estimates,
    timestamp: Date.now(),
    version: '1.0',
    checksum: crypto.createHash('sha256').update(JSON.stringify(estimates)).digest('hex')
  };
  
  return encryptSensitiveData(sensitiveData);
};

/**
 * Descifra estimaciones internas
 */
export const decryptInternalEstimates = (encryptedEstimates: string): any => {
  const decryptedData = decryptSensitiveData(encryptedEstimates);
  
  // Verificar integridad
  const { timestamp, version, checksum, ...estimates } = decryptedData;
  const calculatedChecksum = crypto.createHash('sha256').update(JSON.stringify(estimates)).digest('hex');
  
  if (checksum !== calculatedChecksum) {
    throw new Error('Data integrity check failed');
  }
  
  // Verificar timestamp (opcional - prevenir ataques de replay)
  const maxAge = 24 * 60 * 60 * 1000; // 24 horas
  if (Date.now() - timestamp > maxAge) {
    console.warn('Encrypted data is older than 24 hours');
  }
  
  return estimates;
};

/**
 * Genera hash seguro para IDs únicos
 */
export const generateSecureHash = (data: string): string => {
  return crypto.createHash('sha256').update(data + Date.now()).digest('hex');
};

/**
 * Cifra archivos sensibles (para URLs de descarga temporal)
 */
export const encryptFileReference = (fileInfo: {
  storagePath: string;
  originalName: string;
  quoteId: string;
}): string => {
  const dataWithExpiry = {
    ...fileInfo,
    expiresAt: Date.now() + (2 * 60 * 60 * 1000), // 2 horas
    nonce: crypto.randomBytes(16).toString('hex')
  };
  
  return encryptSensitiveData(dataWithExpiry);
};

/**
 * Descifra referencia de archivo
 */
export const decryptFileReference = (encryptedRef: string): any => {
  const fileData = decryptSensitiveData(encryptedRef);
  
  // Verificar expiración
  if (Date.now() > fileData.expiresAt) {
    throw new Error('File reference has expired');
  }
  
  return fileData;
};

/**
 * Middleware para validar integridad de datos
 */
export const validateDataIntegrity = (originalData: any, signature: string): boolean => {
  const calculatedSignature = crypto
    .createHmac('sha256', getMasterKey())
    .update(JSON.stringify(originalData))
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(calculatedSignature, 'hex')
  );
};

/**
 * Genera firma para datos
 */
export const signData = (data: any): string => {
  return crypto
    .createHmac('sha256', getMasterKey())
    .update(JSON.stringify(data))
    .digest('hex');
};

/**
 * Limpia memoria sensible (intento de borrado seguro)
 */
export const secureCleanup = (sensitiveBuffer: Buffer): void => {
  if (sensitiveBuffer && Buffer.isBuffer(sensitiveBuffer)) {
    sensitiveBuffer.fill(0);
  }
};

// Exportar constantes para configuración
export const ENCRYPTION_CONFIG = {
  ALGORITHM,
  KEY_LENGTH,
  IV_LENGTH,
  TAG_LENGTH,
  SALT_LENGTH
} as const;
