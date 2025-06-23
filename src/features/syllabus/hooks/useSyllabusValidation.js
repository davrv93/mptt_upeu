import { useMemo, useCallback } from 'react';

export const useSyllabusValidation = (nodes, syllabusData) => {
  const progressStats = useMemo(() => {
    const totalFields = nodes.reduce((total, node) =>
      total + Object.keys(node.attributes || {}).length, 0
    );

    const completedFields = nodes.reduce((total, node) => {
      const nodeData = syllabusData[node.id] || {};
      return total + Object.keys(nodeData).filter(key =>
        nodeData[key] && nodeData[key].toString().trim() !== ''
      ).length;
    }, 0);

    const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    return { totalFields, completedFields, percentage };
  }, [nodes, syllabusData]);

  const isValidSyllabus = useCallback(() => {
    const requiredSections = nodes.filter(node => node.parent === 1);
    return requiredSections.some(section =>
      syllabusData[section.id] && Object.keys(syllabusData[section.id]).length > 0
    );
  }, [syllabusData, nodes]);

  const validateRequiredFields = useCallback(() => {
    const errors = [];
    
    nodes.forEach(node => {
      if (node.attributes) {
        Object.keys(node.attributes).forEach(fieldKey => {
          const value = syllabusData[node.id]?.[fieldKey];
          if (!value || value.toString().trim() === '') {
            errors.push({
              nodeId: node.id,
              nodeName: node.name,
              fieldKey,
              message: `Campo "${fieldKey}" es requerido en "${node.name}"`
            });
          }
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [nodes, syllabusData]);

  return {
    progressStats,
    isValidSyllabus,
    validateRequiredFields
  };
};