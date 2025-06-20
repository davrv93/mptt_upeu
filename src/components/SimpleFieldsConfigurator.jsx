import React, { useState, useRef } from 'react';

const SimpleFieldsConfigurator = ({ 
  fields, 
  setFields, 
  showToast, 
  nodeType, 
  getNodeColor 
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const dragCounter = useRef(0);

  // Estados para el modal de agregar campo
  const [newField, setNewField] = useState({
    type: 'text',
    label: '',
    required: false,
    count: 1 // Nueva propiedad para cantidad de valores
  });

  const fieldTypes = [
    { value: 'text', label: 'Texto', icon: '📝' },
    { value: 'textarea', label: 'Texto Largo', icon: '📄' },
    { value: 'number', label: 'Número', icon: '🔢' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'url', label: 'URL', icon: '🔗' },
    { value: 'date', label: 'Fecha', icon: '📅' },
    { value: 'select', label: 'Lista Desplegable', icon: '📋' }
  ];

  const getFieldIcon = (type) => {
    const field = fieldTypes.find(f => f.value === type);
    return field ? field.icon : '📝';
  };

  const getFieldLabel = (type) => {
    const field = fieldTypes.find(f => f.value === type);
    return field ? field.label : 'Texto';
  };

  // Manejar el drag and drop
  const handleDragStart = (index) => {
    setDraggedIndex(index);
    dragCounter.current = 0;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current++;
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current--;
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newFields = [...fields];
    const draggedItem = newFields[draggedIndex];
    
    // Remover el item arrastrado
    newFields.splice(draggedIndex, 1);
    
    // Insertar en la nueva posición
    const finalDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newFields.splice(finalDropIndex, 0, draggedItem);
    
    setFields(newFields);
    setDraggedIndex(null);
    dragCounter.current = 0;
    
    showToast?.('✅ Campo reordenado', 'success');
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    dragCounter.current = 0;
  };

  // Agregar nuevo campo
  const handleAddField = () => {
    if (!newField.label.trim()) {
      showToast?.('❌ El nombre del campo es obligatorio', 'error');
      return;
    }

    // NUEVO: Crear un campo con múltiples valores si count > 1
    const fieldData = {
      id: Date.now(),
      type: newField.type,
      label: newField.label.trim(),
      required: newField.required,
      // NUEVO: Manejar múltiples valores
      values: Array(newField.count).fill(''), // Array de valores
      isMultiple: newField.count > 1 // Flag para saber si es múltiple
    };

    setFields([...fields, fieldData]);
    setNewField({
      type: 'text',
      label: '',
      required: false,
      count: 1
    });
    setShowAddModal(false);
    
    showToast?.(`✅ Campo "${fieldData.label}" agregado${fieldData.isMultiple ? ` con ${newField.count} valores` : ''}`, 'success');
  };

  // Actualizar valor de campo
  const updateFieldValue = (fieldIndex, valueIndex = 0, newValue) => {
    const newFields = [...fields];
    
    if (newFields[fieldIndex].isMultiple) {
      // Para campos múltiples, actualizar el valor específico
      newFields[fieldIndex].values[valueIndex] = newValue;
    } else {
      // Para campos simples, mantener compatibilidad con el formato anterior
      newFields[fieldIndex].value = newValue;
    }
    
    setFields(newFields);
  };

  // Actualizar propiedades del campo
  const updateFieldProperty = (index, property, value) => {
    const newFields = [...fields];
    newFields[index][property] = value;
    setFields(newFields);
  };

  // Eliminar campo
  const removeField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    showToast?.('🗑️ Campo eliminado', 'info');
  };

  // Agregar valor a campo múltiple
  const addValueToField = (fieldIndex) => {
    const newFields = [...fields];
    newFields[fieldIndex].values.push('');
    setFields(newFields);
    showToast?.('➕ Valor agregado', 'success');
  };

  // Eliminar valor de campo múltiple
  const removeValueFromField = (fieldIndex, valueIndex) => {
    const newFields = [...fields];
    if (newFields[fieldIndex].values.length > 1) {
      newFields[fieldIndex].values.splice(valueIndex, 1);
      setFields(newFields);
      showToast?.('➖ Valor eliminado', 'info');
    }
  };

  const nodeColor = getNodeColor?.(nodeType) || '#1A8D5A';

  return (
    <div className="simple-fields-configurator">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0 fw-bold">
          <span className="me-2">🔧</span>
          Configuración de Campos
        </h6>
        <button
          type="button"
          className="btn btn-sm"
          style={{
            backgroundColor: nodeColor,
            borderColor: nodeColor,
            color: 'white',
            borderRadius: '8px'
          }}
          onClick={() => setShowAddModal(true)}
        >
          <span className="me-1">➕</span>
          Agregar Campo
        </button>
      </div>

      {/* Lista de campos */}
      <div className="fields-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {fields.length === 0 ? (
          <div className="text-center py-4">
            <span style={{ fontSize: '2rem', opacity: 0.5 }}>📝</span>
            <p className="text-muted mt-2 mb-0">No hay campos configurados</p>
            <small className="text-muted">Agrega campos personalizados para esta sección</small>
          </div>
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              className={`card mb-3 ${draggedIndex === index ? 'dragging' : ''}`}
              style={{
                borderLeft: `4px solid ${nodeColor}`,
                borderRadius: '12px',
                opacity: draggedIndex === index ? 0.7 : 1
              }}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center flex-grow-1">
                    <div
                      className="drag-handle me-2"
                      style={{
                        cursor: 'grab',
                        opacity: 0.6,
                        fontSize: '1rem'
                      }}
                    >
                      ⋮⋮
                    </div>
                    <span className="me-2" style={{ fontSize: '1.2rem' }}>
                      {getFieldIcon(field.type)}
                    </span>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2">
                        <strong>{field.label}</strong>
                        <span className="badge bg-light text-dark">
                          {getFieldLabel(field.type)}
                        </span>
                        {field.required && (
                          <span className="badge bg-danger">Requerido</span>
                        )}
                        {field.isMultiple && (
                          <span className="badge" style={{ backgroundColor: nodeColor, color: 'white' }}>
                            {field.values.length} valores
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => updateFieldProperty(index, 'required', !field.required)}
                      style={{ borderRadius: '6px' }}
                      title={field.required ? 'Hacer opcional' : 'Hacer requerido'}
                    >
                      {field.required ? '❗' : '❓'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeField(index)}
                      style={{ borderRadius: '6px' }}
                      title="Eliminar campo"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* NUEVO: Renderizado de valores */}
                {field.isMultiple ? (
                  // Campo con múltiples valores (FILA con múltiples COLUMNAS)
                  <div className="multiple-values">
                    <small className="text-muted mb-2 d-block">Valores para "{field.label}":</small>
                    <div className="row g-2">
                      {field.values.map((value, valueIndex) => (
                        <div key={valueIndex} className="col-md-6">
                          <div className="input-group input-group-sm">
                            <span className="input-group-text" style={{ fontSize: '0.8rem' }}>
                              #{valueIndex + 1}
                            </span>
                            <input
                              type={field.type}
                              className="form-control"
                              placeholder={`Valor ${valueIndex + 1}`}
                              value={value}
                              onChange={(e) => updateFieldValue(index, valueIndex, e.target.value)}
                              style={{ borderRadius: '0 6px 6px 0' }}
                            />
                            {field.values.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeValueFromField(index, valueIndex)}
                                style={{ borderRadius: '0 6px 6px 0' }}
                              >
                                ✖️
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="col-12">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => addValueToField(index)}
                          style={{ borderRadius: '6px' }}
                        >
                          <span className="me-1">➕</span>
                          Agregar Valor
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Campo simple (compatibilidad con formato anterior)
                  <div className="single-value">
                    <input
                      type={field.type}
                      className="form-control form-control-sm"
                      placeholder={`Ingrese ${field.label.toLowerCase()}`}
                      value={field.value || ''}
                      onChange={(e) => updateFieldValue(index, 0, e.target.value)}
                      style={{ borderRadius: '6px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para agregar nuevo campo */}
      {showAddModal && (
        <div 
          className="modal fade show d-block" 
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 10000
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
            }
          }}
        >
          <div className="modal-dialog modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: '12px' }}>
              <div 
                className="modal-header border-0" 
                style={{ 
                  backgroundColor: nodeColor, 
                  color: 'white', 
                  borderRadius: '12px 12px 0 0' 
                }}
              >
                <h6 className="modal-title">
                  <span className="me-2">➕</span>
                  Nuevo Campo
                </h6>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Tipo de campo</label>
                  <select
                    className="form-select form-select-sm"
                    value={newField.type}
                    onChange={(e) => setNewField({...newField, type: e.target.value})}
                    style={{ borderRadius: '8px' }}
                  >
                    {fieldTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Nombre del campo</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ej: Nombre del estudiante"
                    value={newField.label}
                    onChange={(e) => setNewField({...newField, label: e.target.value})}
                    style={{ borderRadius: '8px' }}
                  />
                </div>

                {/* NUEVO: Campo para cantidad de valores */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Cantidad de valores</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    min="1"
                    max="10"
                    value={newField.count}
                    onChange={(e) => setNewField({...newField, count: Math.max(1, parseInt(e.target.value) || 1)})}
                    style={{ borderRadius: '8px' }}
                  />
                  <small className="form-text text-muted">
                    {newField.count === 1 
                      ? 'Campo simple con un valor' 
                      : `Campo múltiple con ${newField.count} valores (fila con ${newField.count} columnas)`
                    }
                  </small>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={newField.required}
                    onChange={(e) => setNewField({...newField, required: e.target.checked})}
                    id="fieldRequired"
                  />
                  <label className="form-check-label" htmlFor="fieldRequired">
                    Campo requerido
                  </label>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddModal(false)}
                  style={{ borderRadius: '8px' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: nodeColor,
                    borderColor: nodeColor,
                    color: 'white',
                    borderRadius: '8px'
                  }}
                  onClick={handleAddField}
                >
                  Agregar Campo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleFieldsConfigurator;