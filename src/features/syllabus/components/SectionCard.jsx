import React from 'react';
import { getNodeIcon, getNodeColor } from '../utils/syllabusUtils';
import FormField from './FormField';

const SectionCard = ({
  node,
  nodes,
  syllabusData,
  isExpanded,
  onToggle,
  onFieldChange,
  onAddInstance,
  onRemoveInstance,
  children
}) => {
  const nodeColor = getNodeColor(node.type || node.name);
  const nodeIcon = getNodeIcon(node.type || node.name);
  const hasChildren = nodes.some(n => n.parent === node.id);
  const hasFields = node.attributes && Object.keys(node.attributes).length > 0;
  const hasMultipleInstances = node.allowMultipleInstances;

  return (
    <div className="mb-3">
      <div className="card" style={{ border: '1px solid #CFD8ED' }}>
        <div
          className="card-header"
          style={{
            backgroundColor: '#EAF8FF',
            borderRadius: '16px 16px 0 0',
            borderBottom: isExpanded ? '1px solid #CFD8ED' : 'none',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onToggle) {
              onToggle(node.id);
            } else {
              console.error('❌ onToggle is not defined!');
            }
          }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <span style={{ fontSize: '1.3rem', marginRight: '12px' }}>
                {nodeIcon}
              </span>
              <div>
                <h5 className="mb-1" style={{ color: '#276CA1', fontWeight: '600', fontSize: '15px' }}>
                  {node.name}
                </h5>
                {node.parent !== 1 && (
                  <small className="text-muted">
                    Sección de: {nodes.find(n => n.id === node.parent)?.name}
                  </small>
                )}
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              {hasFields && hasMultipleInstances && (
                <div className="d-flex align-items-center gap-2">
                  <span className="badge"
                    style={{ fontSize: '14px', fontWeight: 'bold', backgroundColor: '#FFECC7', color: '#F8A900', border: '1px solid #F8A900' }}>
                    {Object.keys(syllabusData[node.id]?.instances || {}).length} instancia{Object.keys(syllabusData[node.id]?.instances || {}).length !== 1 ? 's' : ''}
                  </span>
                  <button
                    className="btn btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddInstance(node.id);
                    }}
                    style={{ borderRadius: '6px', backgroundColor: '#B4F6D9', border: '1px solid #1A8D5A' }}
                    title="Agregar nueva instancia"
                  >
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1A8D5A' }}>+ Nuevo</span>
                  </button>
                </div>
              )}

              {hasFields && !hasMultipleInstances && (
                <span className="badge"
                  style={{
                    fontSize: '14px', fontWeight: 'bold', backgroundColor: '#C6E6FF', color: '#276CA1',
                    border: '1px solid #276CA1'
                  }}>
                  {Object.keys(node.attributes).length} campos
                </span>
              )}

              {hasChildren && (
                <span className="badge bg-light text-dark">
                  {nodes.filter(n => n.parent === node.id).length} subsecciones
                </span>
              )}

              <span
                style={{
                  fontSize: '1.3rem',
                  color: '#5F0B72',
                  backgroundColor: '#E9DCFF',
                  border: '1.5px dashed #5F0B72',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s ease-in-out',
                  transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                  cursor: 'pointer',
                }}
              >
                ▼
              </span>


            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="card-body" style={{ borderRadius: '0 0 16px 16px', background: '#F7F9FC' }}>
            {/* Campos de la sección */}
            {hasFields && (
              <div className="section-fields">
                {hasMultipleInstances ? (
                  // Renderizar múltiples instancias
                  <div className="instances-container">
                    {(() => {
                      const instances = syllabusData[node.id]?.instances || {};
                      const instanceIds = Object.keys(instances);

                      if (instanceIds.length === 0) {
                        return (
                          <div className="text-center py-4">
                            <div className="mb-3" style={{ fontSize: '2.5rem', opacity: 0.3 }}>📝</div>
                            <h6 className="text-muted mb-3">No hay instancias agregadas</h6>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => onAddInstance(node.id)}
                              style={{ borderRadius: '8px' }}
                            >
                              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>+</span> Agregar primera instancia
                            </button>
                          </div>
                        );
                      }

                      return instanceIds.map((instanceId, index) => (
                        <div
                          key={instanceId}
                          className={`instance-container mb-4 `}
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            border: '1px solid #C6E6FF',
                            boxShadow: '0 2px 6px rgba(39, 108, 161, 0.1)',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Barra lateral de color para identificar la instancia */}
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              bottom: 0,
                              width: '6px',
                              backgroundColor: '#276CA1'
                            }}
                          />

                          {/* Header de la instancia */}
                          <div
                            className="d-flex justify-content-between align-items-center px-4 py-2"
                            style={{
                              backgroundColor: '#EBF5FF',
                              borderBottom: '1px solid #C6E6FF'
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <span
                                className="me-3"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  backgroundColor: '#FFFFFF',
                                  border: '2px solid #276CA1',
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                  color: '#276CA1'
                                }}
                              >
                                {instanceId}
                              </span>
                              <div>
                                <h6 className="mb-0 fw-bold" style={{ color: '#003264', fontSize: '16px' }}>
                                  Elemento {instanceId}
                                </h6>
                              </div>
                            </div>

                            {instanceIds.length > 1 && (
                              <button
                                className="btn btn-sm"
                                onClick={() => onRemoveInstance(node.id, instanceId)}
                                style={{
                                  borderRadius: '8px',
                                  backgroundColor: '#FFFFFF',
                                  border: '2px solid #DB0000',
                                  color: '#DB0000',
                                  padding: '2px 10px',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#DB0000';
                                  e.target.style.color = '#FFFFFF';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = '#FFFFFF';
                                  e.target.style.color = '#DB0000';
                                }}
                                title={`Eliminar Elemento ${instanceId}`}
                              >
                                <span style={{ fontSize: '14px' }}>✕</span>
                                Eliminar
                              </button>
                            )}
                          </div>

                          {/* Contenido de los campos */}
                          <div className="px-4 py-1">
                            <div className="row">
                              {Object.entries(node.attributes).map(([fieldKey, defaultValue]) => (
                                <FormField
                                  key={`${instanceId}-${fieldKey}`}
                                  nodeId={node.id}
                                  fieldKey={fieldKey}
                                  defaultValue={defaultValue}
                                  value={instances[instanceId]?.[fieldKey] || ''}
                                  onChange={(nodeId, fieldKey, value) =>
                                    onFieldChange(nodeId, fieldKey, value, instanceId)
                                  }
                                  instanceId={instanceId}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  // Renderizar sección única (comportamiento original)
                  <div className="row mb-4">
                    {Object.entries(node.attributes).map(([fieldKey, defaultValue]) => (
                      <FormField
                        key={fieldKey}
                        nodeId={node.id}
                        fieldKey={fieldKey}
                        defaultValue={defaultValue}
                        value={syllabusData[node.id]?.[fieldKey]}
                        onChange={onFieldChange}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Secciones hijas */}
            {hasChildren && (
              <div
                className="children-container"
                style={{
                  paddingLeft: '15px',
                  borderLeft: '4px solid #1B70B1',
                  backgroundColor: `${nodeColor}05`,
                  borderRadius: '0 0 0 8px'
                }}
              >
                <div
                  className="children-header mb-3 small"
                  style={{ color: '#003264', fontWeight: '600' }}
                >
                  ↳ Subsecciones de "{node.name}" ({nodes.filter(n => n.parent === node.id).length})
                </div>
                {children}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionCard;