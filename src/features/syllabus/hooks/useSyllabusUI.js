import { useState, useCallback, useMemo } from 'react';

export const useSyllabusUI = (nodes) => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [expandedSections, setExpandedSections] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const showToast = useCallback((message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: 'info' });
  }, []);

  const toggleSection = useCallback((nodeId) => {
    setExpandedSections(prev => ({
      ...prev,
      [nodeId]: prev[nodeId] === false ? true : false
    }));
  }, []);

  const expandAllSections = useCallback(() => {
    const expandedState = {};
    nodes.forEach(node => {
      if (node.id !== 1) {
        expandedState[node.id] = true;
      }
    });
    setExpandedSections(expandedState);
  }, [nodes]);

  const collapseAllSections = useCallback(() => {
    setExpandedSections({});
  }, []);

  const filteredNodes = useMemo(() => {
    if (!searchTerm) return nodes;

    return nodes.filter(node =>
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.keys(node.attributes || {}).some(key =>
        key.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [nodes, searchTerm]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  return {
    toast,
    showToast,
    hideToast,
    expandedSections,
    toggleSection,
    expandAllSections,
    collapseAllSections,
    searchTerm,
    setSearchTerm,
    clearSearch,
    filteredNodes
  };
};