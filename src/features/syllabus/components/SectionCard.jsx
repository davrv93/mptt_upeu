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
  const instanceBaseName = node.instanceBaseName || 'Elemento';

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
                  <span className="badge bg-light text-dark">
                    {Object.keys(syllabusData[node.id]?.instances || {}).length} instancia{Object.keys(syllabusData[node.id]?.instances || {}).length !== 1 ? 's' : ''}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddInstance(node.id);
                    }}
                    style={{ borderRadius: '6px' }}
                    title={`Agregar nueva ${instanceBaseName.toLowerCase()}`}
                  >
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>+</span>
                  </button>
                </div>
              )}

              {hasFields && !hasMultipleInstances && (
                <span className="badge" style={{ backgroundColor: '#003264', color: 'white' }}>
                  {Object.keys(node.attributes).length} campos
                </span>
              )}

              {hasChildren && (
                <span className="badge bg-light text-dark">
                  {nodes.filter(n => n.parent === node.id).length} subsecciones
                </span>
              )}

              <span style={{ fontSize: '1.2rem', color: '#003264' }}>
                {isExpanded ? '▼' : '▶'}
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
                            <h6 className="text-muted mb-3">No hay {instanceBaseName.toLowerCase()}s agregadas</h6>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => onAddInstance(node.id)}
                              style={{ borderRadius: '8px' }}
                            >
                              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>+</span> Agregar primera {instanceBaseName.toLowerCase()}
                            </button>
                          </div>
                        );
                      }

                      return instanceIds.map((instanceId, index) => (
                        <div 
                          key={instanceId}
                          className={`instance-container p-3 mb-3 ${index !== instanceIds.length - 1 ? 'border-bottom' : ''}`}
                          style={{ 
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            border: '1px solid #E9ECEF'
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0 fw-bold" style={{ color: nodeColor }}>
                              {instanceBaseName} {instanceId}
                            </h6>
                            
                            {instanceIds.length > 1 && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => onRemoveInstance(node.id, instanceId)}
                                style={{ borderRadius: '6px' }}
                                title={`Eliminar ${instanceBaseName} ${instanceId}`}
                              >
                                <span style={{ fontSize: '12px' }}>🗑️</span>
                              </button>
                            )}
                          </div>

                          <div className="row g-3">
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
                                instanceName={`${instanceBaseName} ${instanceId}`}
                              />
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  // Renderizar sección única (comportamiento original)
                  <div className="row g-3 mb-4">
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