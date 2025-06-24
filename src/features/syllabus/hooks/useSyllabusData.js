import { useState, useEffect, useCallback } from 'react';

const LOCAL_STORAGE_KEY = 'mptt_template';
const SYLLABUS_DATA_KEY = 'syllabus_editor_data';
const TEMPLATE_LAST_MODIFIED_KEY = 'template_last_modified';

export const useSyllabusData = () => {
  const [nodes, setNodes] = useState([]);
  const [syllabusData, setSyllabusData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Función auxiliar para actualizar la fecha de guardado
  const updateLastSaved = useCallback(() => {
    const now = new Date();
    localStorage.setItem(TEMPLATE_LAST_MODIFIED_KEY, now.toISOString());
    setLastSaved(now);
    setHasUnsavedChanges(false);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const savedTemplate = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (savedTemplate) {
        const parsedNodes = JSON.parse(savedTemplate);

        if (Array.isArray(parsedNodes) && parsedNodes.length > 0) {
          setNodes(parsedNodes);
        } else {
          throw new Error('Plantilla no válida o vacía');
        }
      } else {
        throw new Error('No hay plantilla cargada');
      }

      const savedData = localStorage.getItem(SYLLABUS_DATA_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setSyllabusData(parsedData);
      }

      // Cargar la fecha de última modificación
      const lastModified = localStorage.getItem(TEMPLATE_LAST_MODIFIED_KEY);
      if (lastModified) {
        const lastModifiedDate = new Date(lastModified);
        if (!isNaN(lastModifiedDate.getTime())) {
          setLastSaved(lastModifiedDate);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error cargando datos:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveData = useCallback(() => {
    try {
      localStorage.setItem(SYLLABUS_DATA_KEY, JSON.stringify(syllabusData));
      updateLastSaved();
      return true;
    } catch (error) {
      console.error('Error guardando datos:', error);
      return false;
    }
  }, [syllabusData, updateLastSaved]);

  const handleFieldChange = useCallback((nodeId, fieldKey, value, instanceId = null) => {
    setSyllabusData(prev => {
      let updatedData;
      
      if (instanceId !== null) {
        // Manejo de múltiples instancias
        updatedData = {
          ...prev,
          [nodeId]: {
            ...prev[nodeId],
            instances: {
              ...prev[nodeId]?.instances,
              [instanceId]: {
                ...prev[nodeId]?.instances?.[instanceId],
                [fieldKey]: value
              }
            }
          }
        };
      } else {
        // Manejo de sección única (comportamiento original)
        updatedData = {
          ...prev,
          [nodeId]: {
            ...prev[nodeId],
            [fieldKey]: value
          }
        };
      }
      
      try {
        localStorage.setItem(SYLLABUS_DATA_KEY, JSON.stringify(updatedData));
        updateLastSaved();
      } catch (error) {
        console.error('❌ Error en guardado inmediato:', error);
        setHasUnsavedChanges(true);
      }
      
      return updatedData;
    });
  }, [updateLastSaved]);

  const addInstance = useCallback((nodeId) => {
    setSyllabusData(prev => {
      const nodeData = prev[nodeId] || {};
      const instances = nodeData.instances || {};
      const instanceIds = Object.keys(instances).map(id => parseInt(id));
      const nextInstanceId = instanceIds.length > 0 ? Math.max(...instanceIds) + 1 : 1;
      
      const updatedData = {
        ...prev,
        [nodeId]: {
          ...nodeData,
          instances: {
            ...instances,
            [nextInstanceId]: {}
          }
        }
      };
      
      try {
        localStorage.setItem(SYLLABUS_DATA_KEY, JSON.stringify(updatedData));
        updateLastSaved();
      } catch (error) {
        console.error('❌ Error guardando nueva instancia:', error);
        setHasUnsavedChanges(true);
      }
      
      return updatedData;
    });
  }, [updateLastSaved]);

  const removeInstance = useCallback((nodeId, instanceId) => {
    setSyllabusData(prev => {
      const nodeData = prev[nodeId] || {};
      const instances = { ...nodeData.instances };
      delete instances[instanceId];
      
      const updatedData = {
        ...prev,
        [nodeId]: {
          ...nodeData,
          instances
        }
      };
      
      try {
        localStorage.setItem(SYLLABUS_DATA_KEY, JSON.stringify(updatedData));
        updateLastSaved();
      } catch (error) {
        console.error('❌ Error eliminando instancia:', error);
        setHasUnsavedChanges(true);
      }
      
      return updatedData;
    });
  }, [updateLastSaved]);

  const resetData = useCallback(() => {
    setSyllabusData({});
    localStorage.removeItem(SYLLABUS_DATA_KEY);
    setHasUnsavedChanges(false);
  }, []);

  useEffect(() => {
    if (hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        saveData();
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [hasUnsavedChanges, saveData]);

  // Listener para cambios en localStorage (desde otras pestañas o componentes)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === TEMPLATE_LAST_MODIFIED_KEY && e.newValue) {
        const newDate = new Date(e.newValue);
        if (!isNaN(newDate.getTime())) {
          setLastSaved(newDate);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    nodes,
    syllabusData,
    isLoading,
    lastSaved,
    hasUnsavedChanges,
    loadData,
    saveData,
    handleFieldChange,
    addInstance,
    removeInstance,
    resetData
  };
};