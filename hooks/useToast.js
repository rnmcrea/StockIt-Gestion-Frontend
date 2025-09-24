import { useState } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState({ 
    visible: false, 
    message: '', 
    type: 'success' 
  });

  const showToast = (message, explicitType = null) => {
    let type = explicitType;
    
    // Si no se especifica tipo, detectarlo automáticamente
    if (!explicitType) {
      const lowerMessage = message.toLowerCase();
      
      // Detectar errores - patrones comunes
      if (message.startsWith('X ') ||           // "X Error..."
          message.startsWith('✗ ') ||           // "✗ Error..."
          message.startsWith('❌') ||            // Emoji error
          lowerMessage.includes('error') ||      // Palabra "error"
          lowerMessage.includes('no se pudo') || // "No se pudo..."
          lowerMessage.includes('fallo') ||      // "Falló"
          lowerMessage.includes('conexión') ||   // Problemas de conexión
          lowerMessage.includes('invá') ||       // "Inválido"
          lowerMessage.includes('insuficient') || // "Insuficiente"
          lowerMessage.includes('obligatori') || // "Obligatorios"
          lowerMessage.includes('requerid') ||   // "Requeridos"
          lowerMessage.includes('debes') ||      // "Debes estar..."
          lowerMessage.includes('sin ') ||       // "Sin conexión"
          lowerMessage.includes('no hay') ||     // "No hay usuarios"
          lowerMessage.includes('no existe') ||  // "No existe"
          lowerMessage.includes('no encontrado') // "No encontrado"
          ) {
        type = 'error';
      }
      // Detectar éxitos - patrones positivos
      else if (message.startsWith('✓ ') ||      // "✓ Éxito..."
               message.startsWith('✅') ||       // Emoji success
               lowerMessage.includes('exitoso') ||    // "exitosamente"
               lowerMessage.includes('agregado') ||   // "agregado correctamente"
               lowerMessage.includes('actualizado') ||// "actualizado"
               lowerMessage.includes('completado') || // "completado"
               lowerMessage.includes('registrado') || // "registrado con éxito"
               lowerMessage.includes('enviado') ||    // "enviado correctamente"
               lowerMessage.includes('transferencia') || // "transferencia completada"
               lowerMessage.includes('aplicados') ||  // "filtros aplicados"
               lowerMessage.includes('limpiados') ||  // "filtros limpiados"
               lowerMessage.includes('recargados')    // "usuarios recargados"
               ) {
        type = 'success';
      }
      // Por defecto success para mensajes neutros
      else {
        type = 'success';
      }
    }

    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return { toast, showToast, hideToast };
};