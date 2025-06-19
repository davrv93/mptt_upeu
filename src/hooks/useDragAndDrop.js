import { useState, useCallback } from 'react';

export const useDragAndDrop = (options = {}) => {
  const {
    onDrop,
    canDrop,
    onDragStart,
    onDragEnd,
    showToast
  } = options;

  // Estados del drag and drop
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [draggedData, setDraggedData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Función para iniciar el arrastre
  const handleDragStart = useCallback((e, itemId, itemData = null) => {
    setDraggedItem(itemId);
    setDraggedData(itemData);
    setIsDragging(true);
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId.toString());
    
    // Efecto visual opcional
    if (e.target) {
      e.target.style.opacity = '0.5';
    }

    // Callback personalizado
    if (onDragStart) {
      onDragStart(e, itemId, itemData);
    }
  }, [onDragStart]);

  // Función para terminar el arrastre
  const handleDragEnd = useCallback((e) => {
    // Restaurar opacidad
    if (e.target) {
      e.target.style.opacity = '1';
    }

    // Limpiar estados
    setDraggedItem(null);
    setDropTarget(null);
    setDraggedData(null);
    setIsDragging(false);

    // Callback personalizado
    if (onDragEnd) {
      onDragEnd(e);
    }
  }, [onDragEnd]);

  // Función para manejar el dragover
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Función para manejar el dragenter
  const handleDragEnter = useCallback((e, targetId) => {
    e.preventDefault();
    
    if (draggedItem && draggedItem !== targetId) {
      // Validar si se puede hacer drop
      if (canDrop && !canDrop(draggedItem, targetId, draggedData)) {
        setDropTarget(null);
        return;
      }
      
      setDropTarget(targetId);
    }
  }, [draggedItem, draggedData, canDrop]);

  // Función para manejar el dragleave
  const handleDragLeave = useCallback((e) => {
    // Solo limpiar si realmente salimos del elemento
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropTarget(null);
    }
  }, []);

  // Función para manejar el drop
  const handleDrop = useCallback((e, targetId) => {
    e.preventDefault();

    if (!draggedItem || draggedItem === targetId) {
      return;
    }

    // Validar si se puede hacer drop
    if (canDrop && !canDrop(draggedItem, targetId, draggedData)) {
      if (showToast) {
        showToast('❌ No se puede mover el elemento a esta posición', 'error');
      }
      return;
    }

    // Ejecutar la acción de drop
    if (onDrop) {
      const success = onDrop(draggedItem, targetId, draggedData);
      
      if (success && showToast) {
        showToast('✅ Elemento reubicado correctamente', 'success');
      }
    }

    // Limpiar estados
    setDraggedItem(null);
    setDropTarget(null);
    setDraggedData(null);
  }, [draggedItem, draggedData, canDrop, onDrop, showToast]);

  // Función para obtener estilos de drop zone
  const getDropZoneStyles = useCallback((itemId, baseStyles = {}) => {
    const isTarget = dropTarget === itemId;
    const isDraggedElement = draggedItem === itemId;

    return {
      ...baseStyles,
      opacity: isDraggedElement ? 0.5 : 1,
      border: isTarget ? '2px dashed #1A8D5A' : baseStyles.border || 'none',
      backgroundColor: isTarget ? 'rgba(26, 141, 90, 0.1)' : baseStyles.backgroundColor,
      transition: 'all 0.3s ease',
      transform: isDraggedElement ? 'rotate(2deg)' : 'none'
    };
  }, [draggedItem, dropTarget]);

  // Función para obtener props de drag para un elemento
  const getDragProps = useCallback((itemId, itemData = null, canDrag = true) => {
    if (!canDrag) {
      return {};
    }

    return {
      draggable: true,
      onDragStart: (e) => handleDragStart(e, itemId, itemData),
      onDragEnd: handleDragEnd,
    };
  }, [handleDragStart, handleDragEnd]);

  // Función para obtener props de drop para un elemento
  const getDropProps = useCallback((targetId) => ({
    onDragOver: handleDragOver,
    onDragEnter: (e) => handleDragEnter(e, targetId),
    onDragLeave: handleDragLeave,
    onDrop: (e) => handleDrop(e, targetId),
  }), [handleDragOver, handleDragEnter, handleDragLeave, handleDrop]);

  // Función para reordenar array basado en drag and drop
  const reorderArray = useCallback((array, fromIndex, toIndex) => {
    const result = Array.from(array);
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    return result;
  }, []);

  // Función helper para encontrar el índice de drop basado en posición del mouse
  const getDropIndex = useCallback((e, containerRef, itemHeight = 50) => {
    if (!containerRef.current) return 0;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    return Math.floor(y / itemHeight);
  }, []);

  return {
    // Estados
    draggedItem,
    dropTarget,
    draggedData,
    isDragging,

    // Handlers principales
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,

    // Helpers
    getDragProps,
    getDropProps,
    getDropZoneStyles,
    reorderArray,
    getDropIndex,

    // Estado helpers
    isDraggedItem: useCallback((itemId) => draggedItem === itemId, [draggedItem]),
    isDropTarget: useCallback((itemId) => dropTarget === itemId, [dropTarget]),
  };
};