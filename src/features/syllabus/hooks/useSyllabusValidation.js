import { useMemo, useCallback } from 'react';

export const useSyllabusValidation = (nodes, syllabusData) => {
  const progressStats = useMemo(() => {
    console.log('🔍 Calculando progreso con:', { 
      nodes: nodes?.length, 
      syllabusData: Object.keys(syllabusData) 
    });

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
    
    console.log('📊 Nodos válidos encontrados:', validNodes.map(n => ({
      id: n.id,
      name: n.name,
      fieldsCount: Object.keys(n.attributes || {}).length
    })));
    
    const totalFields = validNodes.reduce((total, node) =>
      total + Object.keys(node.attributes || {}).length, 0
    );

    let completedFields = 0;
    validNodes.forEach(node => {
      const nodeData = syllabusData[node.id] || {};
      const nodeFields = Object.keys(node.attributes || {});
      
      console.log(`📝 Nodo ${node.id} (${node.name}):`, {
        fields: nodeFields,
        data: nodeData,
        completed: nodeFields.filter(key => 
          nodeData[key] && nodeData[key].toString().trim() !== ''
        )
      });
      
      const completedInNode = nodeFields.filter(key =>
        nodeData[key] && nodeData[key].toString().trim() !== ''
      ).length;
      
      completedFields += completedInNode;
    });

    const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    // Calcular secciones completadas
    let completedSections = 0;
    const totalSections = validNodes.length;

    validNodes.forEach(node => {
      const nodeFields = Object.keys(node.attributes || {});
      const nodeData = syllabusData[node.id] || {};
      const completedInNode = nodeFields.filter(key =>
        nodeData[key] && nodeData[key].toString().trim() !== ''
      ).length;

      // Considerar sección completa si tiene al menos 80% de campos llenos
      if (nodeFields.length > 0 && (completedInNode / nodeFields.length) >= 0.8) {
        completedSections++;
      }
    });

    const result = { 
      totalFields, 
      completedFields, 
      percentage,
      totalSections,
      completedSections
    };

    console.log('✅ Resultado del progreso:', result);
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

    console.log('🔍 Validación syllabus:', {
      hasMinimumProgress,
      hasData,
      percentage: progressStats.percentage,
      validNodes: validNodes.length
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

    const totalFields = Object.keys(node.attributes).length;
    const nodeData = syllabusData[nodeId] || {};
    const completedFields = Object.keys(nodeData).filter(key =>
      nodeData[key] && nodeData[key].toString().trim() !== ''
    ).length;

    const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    return {
      completed: completedFields,
      total: totalFields,
      percentage
    };
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