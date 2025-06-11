// 👈🏻 NO OLVIDES este encabezado de imports y constantes
import React, { useState, useEffect } from 'react';
import nodeTypes from '../node_types_schema.json';

const LOCAL_STORAGE_KEY = 'mptt_template';

const getInitialData = () => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  return saved ? JSON.parse(saved) : [
    { id: 1, name: 'Root', type: '', parent: null, attributes: {} }
  ];
};

const TemplateBuilder = () => {
  const [nodes, setNodes] = useState(getInitialData);
  const [selected, setSelected] = useState(null);
  const [nodeName, setNodeName] = useState('');
  const [nodeType, setNodeType] = useState('');
  const [attributes, setAttributes] = useState([]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    if (nodeType && nodeTypes[nodeType]) {
      setAttributes(nodeTypes[nodeType].attributes.map(key => ({ key, value: '' })));
    } else if (nodeType === 'OTRO') {
      setAttributes([{ key: '¿Qué debería hacer este campo?', value: '' }]);
    }
  }, [nodeType]);

  const handleAddNode = (e) => {
    e.preventDefault();
    const newId = Math.max(...nodes.map(n => n.id)) + 1;
    const attrObj = Object.fromEntries(attributes.map(a => [a.key, a.value]));
    const newNode = { id: newId, name: nodeType === 'OTRO' ? nodeName : nodeType, type: nodeType, parent: selected, attributes: attrObj };
    setNodes([...nodes, newNode]);
    setNodeName('');
    setNodeType('');
    setAttributes([]);
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

  const handleDeleteNode = (id) => {
    const toDelete = [id, ...getDescendants(nodes, id)];
    setNodes(nodes.filter(n => !toDelete.includes(n.id)));
  };

  const getDescendants = (all, parentId) => {
    const children = all.filter(n => n.parent === parentId);
    return children.flatMap(c => [c.id, ...getDescendants(all, c.id)]);
  };

  const moveNode = (id, direction) => {
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
    }
  };

  const renderTree = (nodes, parent = null) => {
    return nodes.filter(n => n.parent === parent).map(node => (
      <li key={node.id} className="list-group-item">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            {node.id !== 1 && (
              <div>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={(e) => { e.preventDefault(); moveNode(node.id, 'up'); }}>⬆️</button>
                <button className="btn btn-sm btn-outline-secondary me-2" onClick={(e) => { e.preventDefault(); moveNode(node.id, 'down'); }}>⬇️</button>
              </div>
            )}
            <button className="btn btn-link text-primary p-0 me-2" onClick={() => setSelected(node.id)}>
              {node.name} ({node.type})
            </button>
          </div>
          {node.id !== 1 && (
            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteNode(node.id)}>Eliminar</button>
          )}
        </div>
        {renderTree(nodes, node.id).length > 0 && (
          <ul className="list-group mt-2 ms-3">
            {renderTree(nodes, node.id)}
          </ul>
        )}
      </li>
    ));
  };

  return (
    <div className="container mt-4">
      <h2 className="text-primary">Constructor de Plantilla</h2>
      <ul className="list-group mb-4">
        {renderTree(nodes)}
      </ul>
      <form onSubmit={handleAddNode}>
        <div className="mb-3">
          <label className="form-label">Tipo de sección</label>
          <select className="form-select" value={nodeType} onChange={e => setNodeType(e.target.value)} required>
            <option value="">Selecciona tipo</option>
            {Object.keys(nodeTypes).concat('OTRO').map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        {nodeType === 'OTRO' && (
          <div className="mb-3">
            <label className="form-label">Nombre de la sección personalizada</label>
            <input type="text" className="form-control" placeholder="Ej. Recomendaciones Finales"
              value={nodeName} onChange={e => setNodeName(e.target.value)} required />
            <small className="form-text text-muted">
              Esta sección será añadida como parte del sílabo con el nombre que especifiques.
            </small>
          </div>
        )}
        {attributes.map((attr, idx) => (
          <div className="row mb-2" key={idx}>
            <div className="col">
              <input type="text" className="form-control" placeholder="Clave"
                value={attr.key} onChange={e => handleAttributeChange(idx, 'key', e.target.value)} required />
            </div>
            <div className="col">
              <input type="text" className="form-control" placeholder="Valor"
                value={attr.value} onChange={e => handleAttributeChange(idx, 'value', e.target.value)} />
            </div>
            <div className="col-auto">
              <button type="button" className="btn btn-outline-danger" onClick={() => handleRemoveAttribute(idx)}>✕</button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-outline-primary mb-2" onClick={handleAddAttribute}>+ Atributo</button>
        <br />
        <button type="submit" className="btn btn-primary">Agregar nodo</button>
      </form>
    </div>
  );
};

export default TemplateBuilder;
