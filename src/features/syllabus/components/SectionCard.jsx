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
  children
}) => {
  const nodeColor = getNodeColor(node.type || node.name);
  const nodeIcon = getNodeIcon(node.type || node.name);
  const hasChildren = nodes.some(n => n.parent === node.id);
  const hasFields = node.attributes && Object.keys(node.attributes).length > 0;

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
          onClick={() => onToggle(node.id)}
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
              {hasFields && (
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