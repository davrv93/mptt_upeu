import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import nodeTypes from '../node_types_schema.json';
import { useMPTTNodes } from '../hooks/useMPTTNodes';

const ModalPortal = ({ children, isOpen }) => {
  if (!isOpen) return null;
  
  return ReactDOM.createPortal(
    children,
    document.body
  );
};

const getNodeIcon = (nodeType) => {
  const icons = {
    'Root': '🏠',
    'Información General': '📋',
    'Docentes': '👨‍🏫',
    'Sumilla': '📝',
    'Competencias': '🎯',
    'Resultados de Aprendizaje': '📊',
    'Unidades de Aprendizaje': '📚',
    'Estrategias Metodológicas': '🧠',
    'Recursos': '🛠️',
    'Evaluación': '📈',
    'Referencias': '📖',
    'UNIDAD': '📚',
    'SESION': '🎓',
    'OTRO': '⚙️'
  };
  return icons[nodeType] || '📄';
};

const getNodeColor = (nodeType) => {
  const colors = {
    'Root': '#003264',
    'Información General': '#1A8D5A',
    'Docentes': '#276CA1',
    'Sumilla': '#E97E00',
    'Competencias': '#DB0000',
    'Resultados de Aprendizaje': '#08C1B8',
    'Unidades de Aprendizaje': '#1A8D5A',
    'Estrategias Metodológicas': '#276CA1',
    'Recursos': '#08C1B8',
    'Evaluación': '#E97E00',
    'Referencias': '#DB0000',
    'UNIDAD': '#1A8D5A',
    'SESION': '#276CA1',
    'OTRO': '#666666'
  };
  return colors[nodeType] || '#276CA1';
};

const TemplateBuilder = () => {
  const {
    nodes,
    selected,
    draggedNode,
    dropTarget,
    validationResults,
    lastSaved,
    isLoading,
    stats,
    setSelected,
    addNode,
    deleteNode,
    moveNode,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDrop,
    loadPredefinedTemplate,
    exportTemplate,
    importTemplate,
    restoreBackup,
    checkLocalStorage,
    filterNodes,
    utils,
    showToast
  } = useMPTTNodes();

  const [nodeName, setNodeName] = useState('');
  const [nodeType, setNodeType] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    if (nodeType && nodeTypes[nodeType]) {
      setAttributes(nodeTypes[nodeType].attributes.map(key => ({ key, value: '' })));
    } else if (nodeType === 'OTRO') {
      setAttributes([{ key: '¿Qué debería hacer este campo?', value: '' }]);
    } else {
      setAttributes([]);
    }
  }, [nodeType]);

  // Manejadores del formulario
  const handleAddNode = (e) => {
    e.preventDefault();
    
    const nodeData = {
      nodeType,
      nodeName,
      attributes,
      selectedParent: selected
    };

    const success = addNode(nodeData);
    
    if (success) {
      // Limpiar formulario
      setNodeName('');
      setNodeType('');
      setAttributes([]);
    }
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttrs = [...attributes];
    newAttrs[index][field] = value;
    setAttributes(newAttrs);
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { key: '', value: '' }]);
  };

  const handleRemoveAttribute = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleImportTemplate = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    await importTemplate(file);
    event.target.value = ''; // Reset input
  };

  const handleLoadPredefinedTemplate = (templateName) => {
    loadPredefinedTemplate(templateName);
    setShowTemplateModal(false);
  };

  // Obtener nodos filtrados
  const filteredNodes = filterNodes(searchTerm);

  // Función para renderizar el árbol
  const renderTree = (nodes, parent = null, depth = 0) => {
    const childNodes = filteredNodes.filter(n => n.parent === parent);
    if (childNodes.length === 0) return null;

    return (
      <div className={`${depth > 0 ? 'ms-4' : ''}`}>
        {childNodes.map((node) => {
          const nodeColor = getNodeColor(node.type);
          const isSelected = selected === node.id;
          const hasChildren = nodes.some(n => n.parent === node.id);
          const isRoot = node.id === 1;
          const isDropTarget = dropTarget === node.id;
          const isDragging = draggedNode === node.id;

          return (
            <div key={node.id} className="mb-3">
              <div
                className={`card shadow-sm border-0 hover-card ${isSelected ? 'border-primary' : ''} ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''}`}
                style={{
                  borderLeft: `5px solid ${nodeColor}`,
                  backgroundColor: isSelected ? '#EAF8FF' : '#FFFFFF',
                  transition: 'all 0.3s ease',
                  borderRadius: '16px',
                  opacity: isDragging ? 0.5 : 1
                }}
                draggable={!isRoot}
                onDragStart={(e) => !isRoot && handleDragStart(e, node.id)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, node.id)}
                onDrop={(e) => handleDrop(e, node.id)}
              >
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    {/* Información del nodo */}
                    <div className="d-flex align-items-center flex-grow-1">
                      {/* Icono del tipo */}
                      <div
                        className="me-3 d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: '50px',
                          height: '50px',
                          backgroundColor: nodeColor,
                          color: 'white',
                          fontSize: '1.5rem'
                        }}
                      >
                        {getNodeIcon(node.type)}
                      </div>

                      {/* Contenido del nodo */}
                      <div className="flex-grow-1">
                        <button
                          className={`btn btn-link text-decoration-none p-0 text-start ${isSelected ? 'fw-bold' : ''}`}
                          style={{ color: nodeColor }}
                          onClick={() => setSelected(node.id)}
                        >
                          <div className="d-flex flex-column">
                            <span className="fs-5 fw-semibold">{node.name}</span>
                            <small className="text-muted">
                              {node.type} • Nivel {depth}
                              {Object.keys(node.attributes || {}).length > 0 &&
                                ` • ${Object.keys(node.attributes).length} campos`
                              }
                            </small>
                          </div>
                        </button>

                        {/* Indicador de nodo seleccionado */}
                        {isSelected && (
                          <div className="children-container mt-3">
                            <span
                              className="badge rounded-pill px-3 py-2"
                              style={{ backgroundColor: nodeColor, color: 'white', fontSize: '0.75rem' }}
                            >
                              🎯 Seleccionado - Los nuevos nodos se crearán aquí
                            </span>
                          </div>
                        )}

                        {/* Renderizar nodos hijos con contenedor visual mejorado */}
                        {hasChildren && (
                          <div className="children-container position-relative mt-3">
                            {/* Línea conectora principal del padre */}
                            <div
                              className="parent-connector"
                              style={{
                                position: 'absolute',
                                left: '25px',
                                top: '-10px',
                                width: '3px',
                                height: '20px',
                                backgroundColor: nodeColor,
                                borderRadius: '0 0 3px 3px'
                              }}
                            />

                            {/* Contenedor visual mejorado para los hijos */}
                            <div
                              className="children-wrapper"
                              style={{
                                marginLeft: '15px',
                                paddingLeft: '25px',
                                paddingTop: '15px',
                                paddingBottom: '10px',
                                paddingRight: '15px',
                                borderLeft: `4px solid ${nodeColor}`,
                                borderBottom: `2px solid ${nodeColor}40`,
                                borderRadius: '0 0 0 16px',
                                position: 'relative',
                                background: `linear-gradient(135deg, ${nodeColor}05, transparent)`,
                                backdropFilter: 'blur(1px)'
                              }}
                            >
                              {/* Header visual del grupo de hijos */}
                              <div
                                className="children-header mb-3"
                                style={{
                                  fontSize: '0.85rem',
                                  color: nodeColor,
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 12px',
                                  background: `linear-gradient(90deg, ${nodeColor}15, ${nodeColor}05)`,
                                  borderRadius: '8px',
                                  border: `1px solid ${nodeColor}30`,
                                  position: 'relative'
                                }}
                              >
                                {/* Indicador de conexión con el padre */}
                                <div
                                  style={{
                                    position: 'absolute',
                                    left: '-13px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '12px',
                                    height: '2px',
                                    backgroundColor: nodeColor
                                  }}
                                />

                                <span style={{ fontSize: '1rem' }}>📁</span>
                                <span>Elementos de "{node.name}"</span>
                                <span
                                  className="badge"
                                  style={{
                                    backgroundColor: nodeColor,
                                    color: 'white',
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  {nodes.filter(n => n.parent === node.id).length}
                                </span>

                                {/* Indicador visual de jerarquía */}
                                <div className="ms-auto d-flex align-items-center gap-1">
                                  <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                                    Nivel {depth + 1}
                                  </span>
                                  <div
                                    style={{
                                      width: '8px',
                                      height: '8px',
                                      backgroundColor: nodeColor,
                                      borderRadius: '50%',
                                      opacity: 0.6
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Renderizar los nodos hijos */}
                              <div className="children-nodes">
                                {renderTree(nodes, node.id, depth + 1)}
                              </div>

                              {/* Decoración inferior del contenedor */}
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: '0',
                                  left: '0',
                                  right: '0',
                                  height: '2px',
                                  background: `linear-gradient(90deg, ${nodeColor}, transparent)`,
                                  borderRadius: '0 2px 0 0'
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Mostrar algunos atributos si existen */}
                        {node.attributes && Object.keys(node.attributes).length > 0 && (
                          <div className="mt-2">
                            <small className="text-muted">
                              <span className="me-1">📋</span>
                              Campos: {Object.keys(node.attributes).slice(0, 3).join(', ')}
                              {Object.keys(node.attributes).length > 3 && '...'}
                            </small>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Controles de acción */}
                    <div className="d-flex align-items-center gap-2">
                      {/* Indicador de arrastre */}
                      {!isRoot && (
                        <div
                          className="drag-handle me-2"
                          style={{
                            cursor: 'grab',
                            color: nodeColor,
                            fontSize: '1.2rem'
                          }}
                          title="Arrastra para reordenar"
                        >
                          ⋮⋮
                        </div>
                      )}

                      {/* Botones de movimiento */}
                      {!isRoot && (
                        <div className="btn-group me-2" role="group">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={(e) => { e.preventDefault(); moveNode(node.id, 'up'); }}
                            style={{
                              borderColor: nodeColor,
                              color: nodeColor,
                              borderRadius: '8px 0 0 8px'
                            }}
                            title="Mover arriba"
                          >
                            ⬆️
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={(e) => { e.preventDefault(); moveNode(node.id, 'down'); }}
                            style={{
                              borderColor: nodeColor,
                              color: nodeColor,
                              borderRadius: '0 8px 8px 0'
                            }}
                            title="Mover abajo"
                          >
                            ⬇️
                          </button>
                        </div>
                      )}

                      {/* Indicador de nivel */}
                      <span
                        className="badge rounded-pill me-2"
                        style={{
                          backgroundColor: `${nodeColor}20`,
                          color: nodeColor,
                          border: `1px solid ${nodeColor}50`
                        }}
                      >
                        Nivel {depth}
                      </span>

                      {/* Botón eliminar */}
                      {!isRoot && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => deleteNode(node.id)}
                          title="Eliminar nodo"
                          style={{ borderRadius: '8px' }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSelectedNodeInfo = () => {
    if (!selected) {
      // Si no hay selección pero existe Root, sugerir seleccionarlo
      const rootNode = nodes.find(n => n.id === 1);
      if (rootNode && nodes.length === 1) {
        return (
          <div className="alert border-0 mb-4 d-flex flex-column justify-content-center" style={{ backgroundColor: '#FFF3CD', borderRadius: '16px', borderLeft: '4px solid #FFC107' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <span className="me-3" style={{ fontSize: '2rem' }}>🏠</span>
                <div>
                  <strong className="text-warning">Selecciona el nodo Root para empezar</strong>
                  <br />
                  <small className="text-muted">Haz clic en el nodo Root para seleccionarlo como padre de las nuevas secciones.</small>
                </div>
              </div>
            </div>
            <button
              className="btn btn-warning btn-sm"
              onClick={() => {
                setSelected(1);
                showToast('🎯 Root seleccionado como padre', 'success');
              }}
            >
              Seleccionar Nodo ROOT
            </button>
          </div>
        );
      }

      return (
        <div className="alert border-0 mb-4" style={{ backgroundColor: '#EAF8FF', borderRadius: '16px' }}>
          <div className="d-flex align-items-center">
            <span className="me-3" style={{ fontSize: '2rem' }}>🎯</span>
            <div>
              <strong className="text-primary">Selecciona un nodo padre</strong>
              <br />
              <small className="text-muted">Haz clic en cualquier nodo del árbol para seleccionarlo como padre del nuevo nodo que crearás.</small>
            </div>
          </div>
        </div>
      );
    }

    const selectedNode = nodes.find(n => n.id === selected);
    if (!selectedNode) return null;

    const nodeColor = getNodeColor(selectedNode.type);

    return (
      <div
        className="alert border-0 mb-4"
        style={{
          backgroundColor: `${nodeColor}10`,
          borderLeft: `4px solid ${nodeColor}`,
          borderRadius: '16px'
        }}
      >
        <div className="d-flex align-items-center">
          <span className="me-3" style={{ fontSize: '2rem' }}>
            {getNodeIcon(selectedNode.type)}
          </span>
          <div>
            <strong style={{ color: nodeColor }}>
              Padre seleccionado: {selectedNode.name}
            </strong>
            <br />
            <small className="text-muted">
              Los nuevos nodos se crearán como hijos de "{selectedNode.name}"
              {selectedNode.id === 1 && ' (Nodo principal)'}
            </small>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid mt-4" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0" style={{ borderRadius: '20px' }}>
            <div
              className="card-header border-0 py-4"
              style={{
                background: 'linear-gradient(135deg, #003264 0%, #1A8D5A 100%)',
                color: 'white',
                borderRadius: '20px 20px 0 0'
              }}
            >
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h2 className="mb-0 d-flex align-items-center">
                    <span className="me-3">🏗️</span>
                    Constructor de Plantillas
                  </h2>
                  <small className="opacity-75">
                    Diseña la estructura de tu sílabo de forma profesional
                  </small>
                  {lastSaved && (
                    <div className="mt-2">
                      <small className="opacity-75">
                        <span className="me-1">💾</span>
                        Guardado: {lastSaved.toLocaleTimeString()}
                      </small>
                    </div>
                  )}
                </div>
                <div className="col-md-6 text-md-end">
                  <div className="d-flex align-items-center justify-content-md-end gap-3">
                    <div className="text-center">
                      <div className="h4 mb-0">{stats.totalNodes}</div>
                      <small>Nodos</small>
                    </div>
                    <div className="text-center">
                      <div className="h4 mb-0">{stats.totalSections}</div>
                      <small>Secciones</small>
                    </div>
                    <div className="text-center">
                      <div className={`h4 mb-0 ${validationResults.errors.length > 0 ? 'text-danger' : 'text-success'}`}>
                        {validationResults.errors.length > 0 ? '❌' : '✅'}
                      </div>
                      <small>Estado</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Columna del árbol */}
        <div className="col-lg-8">
          {/* Controles y búsqueda */}
          <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0">
                      <span>🔍</span>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Buscar nodos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ borderRadius: '0 12px 12px 0' }}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => setShowTemplateModal(true)}
                      style={{ borderRadius: '12px' }}
                    >
                      <span className="me-1">📋</span>
                      Plantillas
                    </button>
                    <button
                      className="btn btn-outline-success"
                      onClick={exportTemplate}
                      style={{ borderRadius: '12px' }}
                    >
                      <span className="me-1">📥</span>
                      Exportar
                    </button>
                    <label className="btn btn-outline-info mb-0" style={{ borderRadius: '12px' }}>
                      <span className="me-1">📤</span>
                      Importar
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportTemplate}
                        className="d-none"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Validación y estado */}
              {(validationResults.errors.length > 0 || validationResults.warnings.length > 0) && (
                <div className="mt-3">
                  {validationResults.errors.length > 0 && (
                    <div className="alert alert-danger border-0 mb-2" style={{ borderRadius: '12px' }}>
                      <strong>❌ Errores encontrados:</strong>
                      <ul className="mb-0 mt-2">
                        {validationResults.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {validationResults.warnings.length > 0 && (
                    <div className="alert alert-warning border-0 mb-0" style={{ borderRadius: '12px' }}>
                      <strong>⚠️ Advertencias:</strong>
                      <ul className="mb-0 mt-2">
                        {validationResults.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Árbol de nodos */}
          <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
            <div className="card-header bg-transparent border-0 py-3">
              <h5 className="mb-0 fw-bold">
                <span className="me-2">🌳</span>
                Estructura del Sílabo
              </h5>
              <small className="text-muted">
                Arrastra los nodos para reordenar • Haz clic para seleccionar padre
              </small>
            </div>
            <div className="card-body p-4">
              {filteredNodes.length <= 1 ? (
                <div className="text-center py-5">
                  <span style={{ fontSize: '4rem', opacity: 0.5 }}>🌳</span>
                  <h5 className="text-muted mt-3">Plantilla vacía</h5>
                  <p className="text-muted">Comienza agregando secciones a tu sílabo</p>
                </div>
              ) : (
                <div className="tree-container">
                  {renderTree(filteredNodes)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna del formulario */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: '1rem' }}>
            {/* Información del nodo seleccionado */}
            {renderSelectedNodeInfo()}

            {/* Formulario para agregar nodos */}
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
              <div
                className="card-header border-0 py-3"
                style={{
                  backgroundColor: '#1A8D5A',
                  color: 'white',
                  borderRadius: '16px 16px 0 0'
                }}
              >
                <h5 className="mb-0 d-flex align-items-center">
                  <span className="me-2">➕</span>
                  Agregar Nueva Sección
                </h5>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleAddNode}>
                  {/* Selector de tipo */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <span className="me-2">🏷️</span>
                      Tipo de sección
                    </label>
                    <select
                      className="form-select border-2"
                      value={nodeType}
                      onChange={e => setNodeType(e.target.value)}
                      required
                      style={{
                        borderColor: nodeType ? getNodeColor(nodeType) : '#DEE2E6',
                        borderRadius: '12px'
                      }}
                    >
                      <option value="">Selecciona tipo</option>
                      {Object.keys(nodeTypes).concat('OTRO').map(type => (
                        <option key={type} value={type}>
                          {getNodeIcon(type)} {type}
                        </option>
                      ))}
                    </select>
                    {nodeType && (
                      <small className="form-text text-muted mt-2">
                        <span className="me-1">{getNodeIcon(nodeType)}</span>
                        {nodeType === 'OTRO'
                          ? 'Sección personalizada - Define tu propio nombre'
                          : `Sección estándar con ${nodeTypes[nodeType]?.attributes?.length || 0} campos predefinidos`
                        }
                      </small>
                    )}
                  </div>

                  {/* Campo para nombre personalizado */}
                  {nodeType === 'OTRO' && (
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        <span className="me-2">✏️</span>
                        Nombre de la sección
                      </label>
                      <input
                        type="text"
                        className="form-control border-2"
                        placeholder="Ej. Cronograma, Metodología..."
                        value={nodeName}
                        onChange={e => setNodeName(e.target.value)}
                        required
                        style={{
                          borderColor: '#E97E00',
                          borderRadius: '12px'
                        }}
                      />
                      <small className="form-text text-muted mt-1">
                        Nombre descriptivo para la sección personalizada
                      </small>
                    </div>
                  )}

                  {/* Sección de atributos */}
                  {attributes.length > 0 && (
                    <div className="mb-4">
                      <label className="form-label fw-semibold mb-3">
                        <span className="me-2">📝</span>
                        Campos de la sección
                        <span className="badge bg-secondary ms-2">{attributes.length}</span>
                      </label>

                      <div className="attribute-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {attributes.map((attr, idx) => (
                          <div
                            className="card border-1 mb-3"
                            key={idx}
                            style={{
                              borderColor: nodeType ? `${getNodeColor(nodeType)}30` : '#DEE2E6',
                              borderRadius: '12px'
                            }}
                          >
                            <div className="card-body p-3">
                              <div className="row g-2">
                                <div className="col-12">
                                  <label className="form-label small fw-semibold">
                                    Campo {idx + 1}
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm mb-2"
                                    placeholder="Nombre del campo"
                                    value={attr.key}
                                    onChange={e => handleAttributeChange(idx, 'key', e.target.value)}
                                    required
                                    style={{ borderRadius: '8px' }}
                                  />
                                </div>
                                <div className="col-9">
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Valor por defecto (opcional)"
                                    value={attr.value}
                                    onChange={e => handleAttributeChange(idx, 'value', e.target.value)}
                                    style={{ borderRadius: '8px' }}
                                  />
                                </div>
                                <div className="col-3">
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm w-100"
                                    onClick={() => handleRemoveAttribute(idx)}
                                    title="Eliminar campo"
                                    style={{ borderRadius: '8px' }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm w-100 mt-2"
                        onClick={handleAddAttribute}
                        style={{ borderRadius: '12px' }}
                      >
                        <span className="me-2">➕</span>
                        Agregar otro campo
                      </button>
                    </div>
                  )}

                  {/* Botón de agregar */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-lg"
                      style={{
                        backgroundColor: nodeType ? getNodeColor(nodeType) : '#1A8D5A',
                        borderColor: nodeType ? getNodeColor(nodeType) : '#1A8D5A',
                        color: 'white',
                        borderRadius: '12px'
                      }}
                      disabled={!nodeType || !selected || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creando...
                        </>
                      ) : (
                        <>
                          <span className="me-2">✨</span>
                          Crear Sección
                        </>
                      )}
                    </button>
                  </div>

                  {(!selected || !nodeType) && (
                    <div className="mt-3 text-center">
                      <small className="text-muted">
                        {!selected && '👆 Selecciona un nodo padre primero'}
                        {selected && !nodeType && '👆 Elige el tipo de sección'}
                      </small>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Estadísticas y herramientas */}
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h6 className="card-title mb-3 fw-bold">📊 Estadísticas</h6>
                <div className="row text-center g-3">
                  <div className="col-4">
                    <div className="border rounded p-3" style={{ borderRadius: '12px' }}>
                      <div className="text-primary fw-bold fs-5">{stats.totalNodes}</div>
                      <small className="text-muted">Nodos</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="border rounded p-3" style={{ borderRadius: '12px' }}>
                      <div className="text-success fw-bold fs-5">{stats.maxDepth}</div>
                      <small className="text-muted">Niveles</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="border rounded p-3" style={{ borderRadius: '12px' }}>
                      <div className="text-warning fw-bold fs-5">{stats.totalSections}</div>
                      <small className="text-muted">Secciones</small>
                    </div>
                  </div>
                </div>

                <div className="mt-3 d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm flex-fill"
                    onClick={restoreBackup}
                    style={{ borderRadius: '8px' }}
                  >
                    🔄 Backup
                  </button>
                  <button
                    className="btn btn-outline-info btn-sm flex-fill"
                    onClick={() => setShowPreview(!showPreview)}
                    style={{ borderRadius: '8px' }}
                  >
                    👁️ Preview
                  </button>
                  <button
                    className="btn btn-outline-info btn-sm flex-fill"
                    onClick={checkLocalStorage}
                    style={{ borderRadius: '8px' }}
                  >
                    🔍 Check Storage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de plantillas predefinidas usando Portal */}
      <ModalPortal isOpen={showTemplateModal}>
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTemplateModal(false);
            }
          }}
        >
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0" style={{ backgroundColor: '#003264', color: 'white', borderRadius: '16px 16px 0 0' }}>
                <h5 className="modal-title">
                  <span className="me-2">📋</span>
                  Plantillas Predefinidas
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowTemplateModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                      <div className="card-body p-4 text-center">
                        <div className="mb-3" style={{ fontSize: '3rem' }}>📝</div>
                        <h5 className="card-title">Plantilla Básica</h5>
                        <p className="card-text text-muted">
                          Incluye las secciones esenciales: Información General, Sumilla y Referencias.
                        </p>
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleLoadPredefinedTemplate('basico')}
                          style={{ borderRadius: '8px' }}
                        >
                          Usar Plantilla Básica
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                      <div className="card-body p-4 text-center">
                        <div className="mb-3" style={{ fontSize: '3rem' }}>📚</div>
                        <h5 className="card-title">Plantilla Completa</h5>
                        <p className="card-text text-muted">
                          Incluye todas las secciones estándar: Información, Docentes, Competencias, Evaluación, etc.
                        </p>
                        <button 
                          className="btn btn-success"
                          onClick={() => handleLoadPredefinedTemplate('completo')}
                          style={{ borderRadius: '8px' }}
                        >
                          Usar Plantilla Completa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="alert alert-info border-0 mt-4" style={{ borderRadius: '12px' }}>
                  <h6 className="alert-heading">💡 ¿Qué plantilla elegir?</h6>
                  <ul className="mb-0">
                    <li><strong>Básica:</strong> Ideal para sílabos simples o como punto de partida</li>
                    <li><strong>Completa:</strong> Para sílabos académicos formales con todos los requisitos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalPortal>

      {/* Preview modal usando Portal */}
      <ModalPortal isOpen={showPreview}>
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPreview(false);
            }
          }}
        >
          <div className="modal-dialog modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0" style={{ backgroundColor: '#003264', color: 'white', borderRadius: '16px 16px 0 0' }}>
                <h5 className="modal-title">
                  <span className="me-2">👁️</span>
                  Vista Previa de la Plantilla
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowPreview(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">📊 Estructura</h6>
                    <div className="border rounded p-3" style={{ borderRadius: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                      {nodes.filter(n => n.id !== 1).map(node => (
                        <div key={node.id} className="mb-2">
                          <div className="d-flex align-items-center">
                            <span className="me-2">{getNodeIcon(node.type)}</span>
                            <span className="fw-semibold">{node.name}</span>
                            <span className="badge bg-light text-dark ms-2">
                              {Object.keys(node.attributes || {}).length} campos
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">📋 Resumen</h6>
                    <div className="border rounded p-3" style={{ borderRadius: '12px' }}>
                      <div className="row text-center g-3">
                        <div className="col-4">
                          <div className="fw-bold text-primary fs-4">{stats.totalNodes}</div>
                          <small className="text-muted">Total Nodos</small>
                        </div>
                        <div className="col-4">
                          <div className="fw-bold text-success fs-4">{stats.totalSections}</div>
                          <small className="text-muted">Secciones Principales</small>
                        </div>
                        <div className="col-4">
                          <div className="fw-bold text-info fs-4">{stats.totalFields}</div>
                          <small className="text-muted">Total Campos</small>
                        </div>
                      </div>
                      
                      <hr />
                      
                      <h6 className="fw-bold mb-2">Validación:</h6>
                      <div className="d-flex align-items-center">
                        <span className={`me-2 ${validationResults.errors.length > 0 ? 'text-danger' : 'text-success'}`}>
                          {validationResults.errors.length > 0 ? '❌' : '✅'}
                        </span>
                        <span className="text-muted">
                          {validationResults.errors.length > 0 
                            ? `${validationResults.errors.length} errores encontrados`
                            : 'Plantilla válida'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalPortal>

      <style jsx>{`
        .hover-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important;
        }
        
        .dragging {
          opacity: 0.5 !important;
          transform: rotate(2deg);
        }
        
        .drop-target {
          border: 2px dashed #1A8D5A !important;
          background-color: rgba(26, 141, 90, 0.1) !important;
        }
        
        .drag-handle:hover {
          cursor: grab;
          transform: scale(1.1);
        }
        
        .drag-handle:active {
          cursor: grabbing;
        }
        
        .tree-container {
          position: relative;
        }
        
        .attribute-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .attribute-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .attribute-container::-webkit-scrollbar-thumb {
          background: #1A8D5A;
          border-radius: 3px;
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        
        .btn:hover {
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }
        
        .form-control:focus, .form-select:focus {
          border-color: #1A8D5A;
          box-shadow: 0 0 0 0.2rem rgba(26, 141, 90, 0.25);
        }
        
        .modal {
          backdrop-filter: blur(4px);
        }
        
        .sticky-top {
          z-index: 1020;
        }
      `}</style>
    </div>
  );
};

export default TemplateBuilder;