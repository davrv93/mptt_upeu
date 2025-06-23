import React from 'react';

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

const SelectedNodeInfo = ({ selected, nodes, setSelected, showToast }) => {
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

export default SelectedNodeInfo;