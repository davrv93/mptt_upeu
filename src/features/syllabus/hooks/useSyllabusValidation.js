import { useMemo, useCallback } from 'react';

export const useSyllabusValidation = (nodes, syllabusData) => {
  const progressStats = useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return { 
        totalFields: 0, 
        completedFields: 0, 
        percentage: 0,
        totalSections: 0,
        completedSections: 0
      };
    }

    // Excluir nodo raíz (ID = 1) del cálculo
    const validNodes = nodes.filter(node => 
      node.id !== 1 && 
      node.attributes && 
      Object.keys(node.attributes).length > 0
    );
    
    
    // Calcular total de campos considerando múltiples instancias
    let totalFields = 0;
    validNodes.forEach(node => {
      const nodeFields = Object.keys(node.attributes || {}).length;
      
      if (node.allowMultipleInstances) {
        const nodeData = syllabusData[node.id] || {};
        const instanceCount = Object.keys(nodeData.instances || {}).length;
        // Si no hay instancias, contar como si fuera una instancia potencial
        totalFields += nodeFields * Math.max(1, instanceCount);
      } else {
        totalFields += nodeFields;
      }
    });

    let completedFields = 0;
    validNodes.forEach(node => {
      const nodeData = syllabusData[node.id] || {};
      const nodeFields = Object.keys(node.attributes || {});
      
      if (node.allowMultipleInstances && nodeData.instances) {
        // Contar campos en múltiples instancias
        const instances = nodeData.instances;
        Object.values(instances).forEach(instanceData => {
          const completedInInstance = nodeFields.filter(key =>
            instanceData[key] && instanceData[key].toString().trim() !== ''
          ).length;
          completedFields += completedInInstance;
        });
      } else {
        // Comportamiento original para secciones únicas
        const completedInNode = nodeFields.filter(key =>
          nodeData[key] && nodeData[key].toString().trim() !== ''
        ).length;
        completedFields += completedInNode;
      }
    });

    const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    // Calcular secciones completadas
    let completedSections = 0;
    const totalSections = validNodes.length;

    validNodes.forEach(node => {
      const nodeFields = Object.keys(node.attributes || {});
      const nodeData = syllabusData[node.id] || {};
      
      if (node.allowMultipleInstances && nodeData.instances) {
        // Para múltiples instancias, considerar completa si al menos una instancia está 80% llena
        const instances = nodeData.instances;
        const instancesArray = Object.values(instances);
        
        const hasCompleteInstance = instancesArray.some(instanceData => {
          const completedInInstance = nodeFields.filter(key =>
            instanceData[key] && instanceData[key].toString().trim() !== ''
          ).length;
          return nodeFields.length > 0 && (completedInInstance / nodeFields.length) >= 0.8;
        });
        
        if (hasCompleteInstance) {
          completedSections++;
        }
      } else {
        // Comportamiento original para secciones únicas
        const completedInNode = nodeFields.filter(key =>
          nodeData[key] && nodeData[key].toString().trim() !== ''
        ).length;

        if (nodeFields.length > 0 && (completedInNode / nodeFields.length) >= 0.8) {
          completedSections++;
        }
      }
    });

    const result = { 
      totalFields, 
      completedFields, 
      percentage,
      totalSections,
      completedSections
    };

    return result;
  }, [nodes, syllabusData]);

  const isValidSyllabus = useCallback(() => {
    // Verificar que hay nodos válidos (sin contar el raíz)
    const validNodes = nodes.filter(node => node.id !== 1);
    if (validNodes.length === 0) return false;

    // Verificar que al menos el 60% de los campos estén completados
    const hasMinimumProgress = progressStats.percentage >= 60;

    // Verificar que hay al menos una sección con datos
    const hasData = validNodes.some(node => {
      const nodeData = syllabusData[node.id];
      return nodeData && Object.keys(nodeData).length > 0;
    });

    return hasMinimumProgress && hasData;
  }, [syllabusData, nodes, progressStats.percentage]);

  const validateRequiredFields = useCallback(() => {
    const errors = [];
    const validNodes = nodes.filter(node => node.id !== 1);
    
    validNodes.forEach(node => {
      if (node.attributes) {
        Object.keys(node.attributes).forEach(fieldKey => {
          const value = syllabusData[node.id]?.[fieldKey];
          if (!value || value.toString().trim() === '') {
            
            // Determinar si es campo crítico
            const isCritical = fieldKey.toLowerCase().includes('nombre') ||
                              fieldKey.toLowerCase().includes('docente') ||
                              fieldKey.toLowerCase().includes('creditos') ||
                              fieldKey.toLowerCase().includes('ciclo');

            errors.push({
              nodeId: node.id,
              nodeName: node.name,
              fieldKey,
              isCritical,
              message: `Campo "${fieldKey}" ${isCritical ? '(crítico)' : ''} requerido en "${node.name}"`
            });
          }
        });
      }
    });

    // Separar errores críticos de advertencias
    const criticalErrors = errors.filter(e => e.isCritical);
    const warnings = errors.filter(e => !e.isCritical);

    return {
      isValid: criticalErrors.length === 0,
      errors: criticalErrors,
      warnings: warnings.slice(0, 10), // Limitar advertencias mostradas
      totalErrors: criticalErrors.length,
      totalWarnings: warnings.length
    };
  }, [nodes, syllabusData]);

  // Función para obtener progreso de una sección específica
  const getSectionProgress = useCallback((nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.attributes) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const fieldsPerInstance = Object.keys(node.attributes).length;
    const nodeData = syllabusData[nodeId] || {};
    
    if (node.allowMultipleInstances && nodeData.instances) {
      // Para múltiples instancias
      const instances = nodeData.instances;
      const instanceCount = Object.keys(instances).length;
      const totalFields = fieldsPerInstance * Math.max(1, instanceCount);
      
      let completedFields = 0;
      Object.values(instances).forEach(instanceData => {
        const completed = Object.keys(node.attributes).filter(key =>
          instanceData[key] && instanceData[key].toString().trim() !== ''
        ).length;
        completedFields += completed;
      });

      const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

      return {
        completed: completedFields,
        total: totalFields,
        percentage,
        instances: instanceCount
      };
    } else {
      // Para secciones únicas (comportamiento original)
      const totalFields = fieldsPerInstance;
      const completedFields = Object.keys(nodeData).filter(key =>
        nodeData[key] && nodeData[key].toString().trim() !== ''
      ).length;

      const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

      return {
        completed: completedFields,
        total: totalFields,
        percentage
      };
    }
  }, [nodes, syllabusData]);

  // Función para verificar si un campo es requerido
  const isFieldRequired = useCallback((fieldKey) => {
    const key = fieldKey.toLowerCase();
    return key.includes('nombre') || 
           key.includes('docente') || 
           key.includes('creditos') || 
           key.includes('ciclo') ||
           key.includes('programa') ||
           key.includes('facultad');
  }, []);

  return {
    progressStats,
    isValidSyllabus,
    validateRequiredFields,
    getSectionProgress,
    isFieldRequired
  };
};