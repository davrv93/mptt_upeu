import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionCard from './SectionCard';

const SyllabusContent = ({
  nodes,
  filteredNodes,
  syllabusData,
  expandedSections,
  searchTerm,
  onToggleSection,
  onFieldChange,
  onDebugStorage
}) => {
  const navigate = useNavigate();

  const renderSectionTree = useCallback((parentId = 1, depth = 0) => {
    const childNodes = filteredNodes.filter(node =>
      node.parent === parentId && node.id !== 1
    );

    if (childNodes.length === 0) return null;

    return childNodes.map(node => {
      const isExpanded = expandedSections[node.id] !== false;
      const hasChildren = nodes.some(n => n.parent === node.id);

      return (
        <SectionCard
          key={node.id}
          node={node}
          nodes={nodes}
          syllabusData={syllabusData}
          isExpanded={isExpanded}
          onToggle={onToggleSection}
          onFieldChange={onFieldChange}
        >
          {hasChildren && renderSectionTree(node.id, depth + 1)}
        </SectionCard>
      );
    });
  }, [filteredNodes, nodes, syllabusData, expandedSections, onToggleSection, onFieldChange]);

  if (nodes.length <= 1) {
    return (
      <div className="card border-0 shadow-sm text-center py-5" style={{ borderRadius: '16px' }}>
        <div className="card-body">
          <div style={{ fontSize: '4rem' }}>📋</div>
          <h4 className="text-muted mb-3">No hay plantilla cargada</h4>
          <p className="text-muted mb-4">
            Necesitas crear o cargar una plantilla en el Constructor de Plantillas.<br />
            <small>Actualmente tienes {nodes.length} nodos en localStorage.</small>
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/plantilla')}
              style={{ borderRadius: '12px' }}
            >
              Ir al Constructor de Plantillas
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={onDebugStorage}
              style={{ borderRadius: '12px' }}
            >
              🔍 Debug
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {filteredNodes.length <= 1 && searchTerm && (
        <div className="alert alert-info border-0" style={{ borderRadius: '12px' }}>
          <h6>🔍 Sin resultados</h6>
          No se encontraron secciones que coincidan con "{searchTerm}"
        </div>
      )}

      {renderSectionTree()}
    </div>
  );
};

export default SyllabusContent;