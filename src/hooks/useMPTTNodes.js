import { useState, useEffect, useCallback } from 'react';
import { useTemplateState } from './useTemplateState';

const LOCAL_STORAGE_KEY = 'mptt_template';
const TEMPLATE_BACKUP_KEY = 'mptt_template_backup';

const getNodeDepth = (nodes, nodeId, depth = 0) => {
  const node = nodes.find(n => n.id === nodeId);
  if (!node || node.parent === null) return depth;
  return getNodeDepth(nodes, node.parent, depth + 1);
};

const getDescendants = (nodes, parentId) => {
  const children = nodes.filter(n => n.parent === parentId);
  return children.flatMap(c => [c.id, ...getDescendants(nodes, c.id)]);
};

const getInitialData = () => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  return saved ? JSON.parse(saved) : [
    { id: 1, name: 'Root', type: '', parent: null, attributes: {} }
  ];
};

const createBackup = (nodes) => {
  try {
    localStorage.setItem(TEMPLATE_BACKUP_KEY, JSON.stringify({
      data: nodes,
      timestamp: new Date().toISOString(),
      version: '2.0'
    }));
  } catch (error) {
    console.error('Error creating backup:', error);
  }
};

const validateTemplate = (nodes) => {
  const errors = [];
  const warnings = [];

  // Validar referencias de padres
  nodes.forEach(node => {
    if (node.parent && !nodes.find(n => n.id === node.parent)) {
      errors.push(`Nodo "${node.name}" tiene un padre inexistente`);
    }
  });

  // Validar secciones recomendadas
  const recommendedSections = ['Información General', 'Sumilla', 'Referencias'];
  recommendedSections.forEach(section => {
    if (!nodes.find(n => n.type === section)) {
      warnings.push(`Sección recomendada "${section}" no encontrada`);
    }
  });

  // Validar profundidad excesiva
  nodes.forEach(node => {
    const depth = getNodeDepth(nodes, node.id);
    if (depth > 4) {
      warnings.push(`Nodo "${node.name}" tiene demasiados niveles anidados (${depth})`);
    }
  });

  return { errors, warnings };
};

// Plantillas predefinidas
const templates = {
  basico: [
    { id: 1, name: 'Root', type: '', parent: null, attributes: {} },
    { id: 2, name: 'Información General', type: 'Información General', parent: 1, attributes: {} },
    { id: 3, name: 'Sumilla', type: 'Sumilla', parent: 1, attributes: {} },
    { id: 4, name: 'Referencias', type: 'Referencias', parent: 1, attributes: {} }
  ],
  completo: [
    { id: 1, name: 'Root', type: '', parent: null, attributes: {} },
    { id: 2, name: 'Información General', type: 'Información General', parent: 1, attributes: {} },
    { id: 3, name: 'Docentes', type: 'Docentes', parent: 1, attributes: {} },
    { id: 4, name: 'Sumilla', type: 'Sumilla', parent: 1, attributes: {} },
    { id: 5, name: 'Competencias', type: 'Competencias', parent: 1, attributes: {} },
    { id: 6, name: 'Resultados de Aprendizaje', type: 'Resultados de Aprendizaje', parent: 1, attributes: {} },
    { id: 7, name: 'Unidades de Aprendizaje', type: 'Unidades de Aprendizaje', parent: 1, attributes: {} },
    { id: 8, name: 'Estrategias Metodológicas', type: 'Estrategias Metodológicas', parent: 1, attributes: {} },
    { id: 9, name: 'Recursos', type: 'Recursos', parent: 1, attributes: {} },
    { id: 10, name: 'Evaluación', type: 'Evaluación', parent: 1, attributes: {} },
    { id: 11, name: 'Referencias', type: 'Referencias', parent: 1, attributes: {} }
  ]
};

export const useMPTTNodes = () => {
  // Estados principales
  const [nodes, setNodes] = useState(getInitialData);
  const [selected, setSelected] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [validationResults, setValidationResults] = useState({ errors: [], warnings: [] });
  const [lastSaved, setLastSaved] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { triggerTemplateUpdate } = useTemplateState();

  // Función para mostrar toast notifications
  const showToast = useCallback((message, type = 'success') => {
    const toastColors = {
      success: 'alert-success',
      error: 'alert-danger',
      warning: 'alert-warning',
      info: 'alert-info'
    };

    const toast = document.createElement('div');
    toast.className = `alert ${toastColors[type]} position-fixed border-0 shadow-lg`;
    toast.style.cssText = `
      top: 90px; 
      right: 20px; 
      z-index: 9999; 
      min-width: 320px;
      border-radius: 12px;
      animation: slideInRight 0.3s ease-out;
    `;
    toast.innerHTML = `
      <div class="d-flex align-items-center">
        <div class="me-2">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</div>
        <div>${message}</div>
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => document.body.removeChild(toast), 300);
      }
    }, 4000);
  }, []);

  // Función para guardar la plantilla
  const saveTemplate = useCallback((newNodes) => {
    try {
      createBackup(newNodes);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newNodes));
      localStorage.setItem('template_last_modified', new Date().toISOString());
      setLastSaved(new Date());

      const validation = validateTemplate(newNodes);
      setValidationResults(validation);

      triggerTemplateUpdate();

      console.log('✅ Plantilla guardada automáticamente');
    } catch (error) {
      console.error('❌ Error al guardar plantilla:', error);
      showToast('❌ Error al guardar la plantilla', 'error');
    }
  }, [triggerTemplateUpdate, showToast]);

  // Auto-guardado cuando cambian los nodos
  useEffect(() => {
    if (nodes.length > 0) {
      saveTemplate(nodes);
    }
  }, [nodes, saveTemplate]);

  // Función para agregar un nuevo nodo
  const addNode = useCallback((nodeData) => {
    const { nodeType, nodeName, attributes, selectedParent } = nodeData;
    
    setIsLoading(true);

    try {
      if (nodeType === 'OTRO' && !nodeName.trim()) {
        showToast('❌ El nombre es requerido para secciones personalizadas', 'error');
        setIsLoading(false);
        return false;
      }

      const existingNode = nodes.find(n =>
        n.parent === selectedParent &&
        n.type === nodeType &&
        nodeType !== 'OTRO'
      );

      if (existingNode) {
        showToast(`⚠️ Ya existe una sección "${nodeType}" bajo este nodo`, 'warning');
        setIsLoading(false);
        return false;
      }

      const newId = Math.max(...nodes.map(n => n.id)) + 1;
      const attrObj = Object.fromEntries(
        attributes
          .filter(a => a.key.trim() !== '')
          .map(a => [a.key, a.value])
      );

      const newNode = {
        id: newId,
        name: nodeType === 'OTRO' ? nodeName.trim() : nodeType,
        type: nodeType,
        parent: selectedParent,
        attributes: attrObj
      };

      setNodes(prevNodes => [...prevNodes, newNode]);
      showToast(`✅ Sección "${newNode.name}" creada y guardada`, 'success');
      return true;
    } catch (error) {
      showToast('❌ Error al crear la sección', 'error');
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [nodes, showToast]);

  // Función para eliminar un nodo
  const deleteNode = useCallback((id) => {
    const nodeToDelete = nodes.find(n => n.id === id);
    const descendants = getDescendants(nodes, id);
    const totalToDelete = descendants.length + 1;

    if (confirm(`¿Eliminar "${nodeToDelete.name}" y ${totalToDelete > 1 ? `sus ${descendants.length} nodos hijos` : 'este nodo'}?\n\nEsta acción no se puede deshacer.`)) {
      const toDelete = [id, ...descendants];
      setNodes(prevNodes => prevNodes.filter(n => !toDelete.includes(n.id)));
      
      if (selected === id || toDelete.includes(selected)) {
        setSelected(null);
      }
      
      showToast(`🗑️ Eliminados ${totalToDelete} nodo(s)`, 'warning');
      return true;
    }
    return false;
  }, [nodes, selected, showToast]);

  // Función para mover un nodo
  const moveNode = useCallback((id, direction) => {
    const updated = [...nodes];
    const index = updated.findIndex(n => n.id === id);
    const parent = updated[index].parent;
    const siblings = updated
      .map((n, idx) => ({ ...n, _originalIndex: idx }))
      .filter(n => n.parent === parent);
    const siblingIndex = siblings.findIndex(n => n.id === id);
    const targetIndex = direction === "up" ? siblingIndex - 1 : siblingIndex + 1;

    if (targetIndex >= 0 && targetIndex < siblings.length) {
      const currentIdx = siblings[siblingIndex]._originalIndex;
      const swapIdx = siblings[targetIndex]._originalIndex;
      [updated[currentIdx], updated[swapIdx]] = [updated[swapIdx], updated[currentIdx]];
      setNodes(updated);
      showToast(`📍 Nodo movido ${direction === 'up' ? 'arriba' : 'abajo'}`, 'info');
      return true;
    }
    return false;
  }, [nodes, showToast]);

  // Funciones para drag and drop
  const handleDragStart = useCallback((e, nodeId) => {
    setDraggedNode(nodeId);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = '1';
    setDraggedNode(null);
    setDropTarget(null);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e, nodeId) => {
    e.preventDefault();
    if (draggedNode && draggedNode !== nodeId) {
      setDropTarget(nodeId);
    }
  }, [draggedNode]);

  const handleDrop = useCallback((e, targetId) => {
    e.preventDefault();

    if (!draggedNode || draggedNode === targetId) return;

    const descendants = getDescendants(nodes, draggedNode);
    if (descendants.includes(targetId)) {
      showToast('❌ No puedes mover un nodo a su propio descendiente', 'error');
      return;
    }

    setNodes(prevNodes =>
      prevNodes.map(n =>
        n.id === draggedNode ? { ...n, parent: targetId } : n
      )
    );

    showToast('✅ Nodo reubicado correctamente', 'success');
    setDraggedNode(null);
    setDropTarget(null);
  }, [draggedNode, nodes, showToast]);

  // Función para cargar plantilla predefinida
  const loadPredefinedTemplate = useCallback((templateName) => {
    if (templates[templateName]) {
      setNodes(templates[templateName]);
      setSelected(null);
      showToast(`✅ Plantilla "${templateName}" cargada correctamente`, 'success');
      return true;
    }
    return false;
  }, [showToast]);

  // Función para exportar plantilla
  const exportTemplate = useCallback(() => {
    try {
      const templateData = {
        version: '2.0',
        created: new Date().toISOString(),
        nodes: nodes,
        metadata: {
          totalNodes: nodes.length,
          sections: nodes.filter(n => n.parent === null && n.id !== 1).length
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templateData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `plantilla_silabo_${new Date().getTime()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      showToast('📥 Plantilla exportada correctamente', 'success');
      return true;
    } catch (error) {
      showToast('❌ Error al exportar la plantilla', 'error');
      return false;
    }
  }, [nodes, showToast]);

  // Función para importar plantilla
  const importTemplate = useCallback((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);

          let templateNodes;
          if (importedData.version && importedData.nodes) {
            templateNodes = importedData.nodes;
          } else if (Array.isArray(importedData)) {
            templateNodes = importedData;
          } else {
            throw new Error('Formato de archivo no válido');
          }

          if (!Array.isArray(templateNodes) || templateNodes.length === 0) {
            throw new Error('La plantilla está vacía o no es válida');
          }

          setNodes(templateNodes);
          setSelected(null);
          showToast('📂 Plantilla importada correctamente', 'success');
          resolve(true);
        } catch (error) {
          showToast(`❌ Error: ${error.message}`, 'error');
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  }, [showToast]);

  // Función para restaurar backup
  const restoreBackup = useCallback(() => {
    try {
      const backup = localStorage.getItem(TEMPLATE_BACKUP_KEY);
      if (backup) {
        const backupData = JSON.parse(backup);
        if (confirm(`¿Restaurar backup del ${new Date(backupData.timestamp).toLocaleString()}?`)) {
          setNodes(backupData.data);
          setSelected(null);
          showToast('🔄 Backup restaurado correctamente', 'success');
          return true;
        }
      } else {
        showToast('❌ No hay backup disponible', 'error');
      }
      return false;
    } catch (error) {
      showToast('❌ Error al restaurar backup', 'error');
      return false;
    }
  }, [showToast]);

  // Función para verificar localStorage
  const checkLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        showToast(`📋 localStorage: ${parsed.length} nodos guardados`, 'info');
      } else {
        showToast('❌ No hay plantilla en localStorage', 'warning');
      }
    } catch (error) {
      showToast('❌ Error al leer localStorage', 'error');
    }
  }, [showToast]);

  // Función para filtrar nodos
  const filterNodes = useCallback((searchTerm) => {
    return nodes.filter(node =>
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [nodes]);

  // Funciones de utilidad expuestas
  const utils = {
    getNodeDepth: useCallback((nodeId) => getNodeDepth(nodes, nodeId), [nodes]),
    getDescendants: useCallback((parentId) => getDescendants(nodes, parentId), [nodes]),
    validateTemplate: useCallback(() => validateTemplate(nodes), [nodes])
  };

  // Estadísticas de la plantilla
  const stats = {
    totalNodes: nodes.length,
    totalSections: nodes.filter(n => n.parent === null && n.id !== 1).length,
    totalFields: nodes.reduce((total, node) => total + Object.keys(node.attributes || {}).length, 0),
    maxDepth: nodes.length > 1 ? Math.max(...nodes.map(n => getNodeDepth(nodes, n.id))) : 0
  };

  return {
    // Estados
    nodes,
    selected,
    draggedNode,
    dropTarget,
    validationResults,
    lastSaved,
    isLoading,
    stats,

    // Setters
    setSelected,
    setNodes,

    // Funciones principales
    addNode,
    deleteNode,
    moveNode,

    // Drag and drop
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDrop,

    // Plantillas y persistencia
    loadPredefinedTemplate,
    exportTemplate,
    importTemplate,
    restoreBackup,
    checkLocalStorage,

    // Utilidades
    filterNodes,
    utils,
    showToast
  };
};