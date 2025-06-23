import { useState, useEffect, useCallback } from 'react';

const LOCAL_STORAGE_KEY = 'mptt_template';
const SYLLABUS_DATA_KEY = 'syllabus_editor_data';

export const useSyllabusData = () => {
  const [nodes, setNodes] = useState([]);
  const [syllabusData, setSyllabusData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('Error guardando datos:', error);
      return false;
    }
  }, [syllabusData]);

  const handleFieldChange = useCallback((nodeId, fieldKey, value) => {
    setSyllabusData(prev => {
      const updatedData = {
        ...prev,
        [nodeId]: {
          ...prev[nodeId],
          [fieldKey]: value
        }
      };
      
      try {
        localStorage.setItem(SYLLABUS_DATA_KEY, JSON.stringify(updatedData));
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('❌ Error en guardado inmediato:', error);
        setHasUnsavedChanges(true);
      }
      
      return updatedData;
    });
  }, []);

  const resetData = useCallback(() => {
    setSyllabusData({});
    localStorage.removeItem(SYLLABUS_DATA_KEY);
    setHasUnsavedChanges(false);
  }, []);

  useEffect(() => {
    if (hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        console.log('💾 Auto-guardado de respaldo');
        saveData();
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [hasUnsavedChanges, saveData]);

  return {
    nodes,
    syllabusData,
    isLoading,
    lastSaved,
    hasUnsavedChanges,
    loadData,
    saveData,
    handleFieldChange,
    resetData
  };
};