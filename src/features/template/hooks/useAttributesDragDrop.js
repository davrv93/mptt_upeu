import { useCallback } from 'react';
import { useDragAndDrop } from '../../../shared/hooks/useDragAndDrop';

/**
 * Hook para manejar drag and drop de atributos/campos en formularios
 * @param {Array} attributes - Array de atributos
 * @param {Function} setAttributes - Setter para actualizar atributos
 * @param {Function} showToast - Función para mostrar notificaciones
 */
export const useAttributesDragDrop = (attributes, setAttributes, showToast) => {
  
  // Configuración del drag and drop para atributos
  const attributesDragDrop = useDragAndDrop({
    onDrop: useCallback((draggedIndex, targetIndex) => {
      if (draggedIndex === targetIndex) return false;
      
      const newAttributes = [...attributes];
      const [draggedAttribute] = newAttributes.splice(draggedIndex, 1);
      newAttributes.splice(targetIndex, 0, draggedAttribute);
      
      setAttributes(newAttributes);
      return true;
    }, [attributes, setAttributes]),
    
    canDrop: useCallback((draggedIndex, targetIndex) => {
      return draggedIndex !== targetIndex;
    }, []),
    
    showToast
  });

  // Función para manejar cambios en atributos
  const handleAttributeChange = useCallback((index, field, value) => {
    const newAttrs = [...attributes];
    newAttrs[index][field] = value;
    setAttributes(newAttrs);
  }, [attributes, setAttributes]);

  // Función para agregar un nuevo atributo
  const handleAddAttribute = useCallback(() => {
    setAttributes([...attributes, { key: '', value: '' }]);
  }, [attributes, setAttributes]);

  // Función para eliminar un atributo
  const handleRemoveAttribute = useCallback((index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  }, [attributes, setAttributes]);

  // Función para obtener props de drag específicas para atributos
  const getAttributeDragProps = useCallback((index) => {
    return attributesDragDrop.getDragProps(index, { type: 'attribute', index });
  }, [attributesDragDrop]);

  // Función para obtener props de drop específicas para atributos
  const getAttributeDropProps = useCallback((index) => {
    return attributesDragDrop.getDropProps(index);
  }, [attributesDragDrop]);

  // Función para obtener estilos de zona de drop para atributos
  const getAttributeDropZoneStyles = useCallback((index, baseStyles = {}) => {
    return attributesDragDrop.getDropZoneStyles(index, {
      ...baseStyles,
      cursor: 'grab',
      userSelect: 'none'
    });
  }, [attributesDragDrop]);

  // Función para reordenar atributos manualmente (botones up/down)
  const moveAttribute = useCallback((index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= attributes.length) {
      return false;
    }

    const newAttributes = [...attributes];
    [newAttributes[index], newAttributes[newIndex]] = [newAttributes[newIndex], newAttributes[index]];
    
    setAttributes(newAttributes);
    
    if (showToast) {
      showToast(`📝 Campo movido ${direction === 'up' ? 'arriba' : 'abajo'}`, 'info');
    }
    
    return true;
  }, [attributes, setAttributes, showToast]);

  return {
    // Estados del drag and drop
    draggedAttribute: attributesDragDrop.draggedItem,
    dropTarget: attributesDragDrop.dropTarget,
    isDragging: attributesDragDrop.isDragging,

    // Handlers de atributos
    handleAttributeChange,
    handleAddAttribute,
    handleRemoveAttribute,
    moveAttribute,

    // Drag and drop específicos
    getAttributeDragProps,
    getAttributeDropProps,
    getAttributeDropZoneStyles,

    // Helpers de estado
    isDraggedAttribute: attributesDragDrop.isDraggedItem,
    isDropTarget: attributesDragDrop.isDropTarget,

    // Handlers de drag and drop básicos
    handleDragStart: attributesDragDrop.handleDragStart,
    handleDragEnd: attributesDragDrop.handleDragEnd,
    handleDragOver: attributesDragDrop.handleDragOver,
    handleDragEnter: attributesDragDrop.handleDragEnter,
    handleDrop: attributesDragDrop.handleDrop,
  };
};