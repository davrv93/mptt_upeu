import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const getTemplate = () => {
  const saved = localStorage.getItem('mptt_template');
  return saved ? JSON.parse(saved) : [];
};

const buildTree = (nodes, parent = null) => {
  return nodes
    .filter(n => n.parent === parent)
    .map(n => ({ ...n, children: buildTree(nodes, n.id) }));
};

const isGrouped = val => typeof val === 'object' && !Array.isArray(val) && val !== null;

const SyllabusEditor = () => {
  const [template] = useState(getTemplate);
  const [values, setValues] = useState({});
  const [expanded, setExpanded] = useState({});

  const tree = buildTree(template);

  const renderInputs = (nodeId, attributes, group = null) => {
    return Object.entries(attributes).map(([key, value]) => {
      if (isGrouped(value)) {
        return (
          <div className="mb-3" key={key}>
            <h5 className="text-secondary">{key}</h5>
            <table className="table table-bordered">
              <tbody>
                {Object.entries(value).reduce((rows, [k, v], i, arr) => {
                  if (i % 2 === 0) {
                    const next = arr[i + 1];
                    rows.push(
                      <tr key={i}>
                        <td><strong>{k}</strong></td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={values[nodeId]?.[key]?.[k] || ''}
                            onChange={e => {
                              setValues(prev => ({
                                ...prev,
                                [nodeId]: {
                                  ...prev[nodeId],
                                  [key]: {
                                    ...prev[nodeId]?.[key],
                                    [k]: e.target.value
                                  }
                                }
                              }));
                            }}
                          />
                        </td>
                        {next && (
                          <>
                            <td><strong>{next[0]}</strong></td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                value={values[nodeId]?.[key]?.[next[0]] || ''}
                                onChange={e => {
                                  setValues(prev => ({
                                    ...prev,
                                    [nodeId]: {
                                      ...prev[nodeId],
                                      [key]: {
                                        ...prev[nodeId]?.[key],
                                        [next[0]]: e.target.value
                                      }
                                    }
                                  }));
                                }}
                              />
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  }
                  return rows;
                }, [])}
              </tbody>
            </table>
          </div>
        );
      } else {
        return (
          <div className="mb-2" key={key}>
            <label className="form-label">{group ? `${group} - ${key}` : key}</label>
            <input
              type="text"
              className="form-control"
              value={values[nodeId]?.[key] || ''}
              onChange={e => {
                setValues(prev => ({
                  ...prev,
                  [nodeId]: { ...prev[nodeId], [key]: e.target.value }
                }));
              }}
            />
          </div>
        );
      }
    });
  };

  const renderEditor = (nodes) => {
    return nodes.map(node => (
      <li key={node.id} className="mb-3">
        <div className="card border-primary">
          <div className="card-header d-flex justify-content-between align-items-center">
            <strong>{node.name} ({node.type})</strong>
            <button className="btn btn-sm btn-outline-primary"
              onClick={() => setExpanded(prev => ({ ...prev, [node.id]: !prev[node.id] }))}>
              {expanded[node.id] ? "Ocultar" : "Ver"}
            </button>
          </div>
          {expanded[node.id] && (
            <div className="card-body">
              {renderInputs(node.id, node.attributes)}
            </div>
          )}
        </div>
        {node.children && node.children.length > 0 && (
          <ul className="mt-2 ms-4 list-unstyled">
            {renderEditor(node.children)}
          </ul>
        )}
      </li>
    ));
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Sílabus", 105, 10, null, null, "center");

    let y = 20;
    template.forEach(node => {
      if (values[node.id]) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 180);
        doc.text(`${node.name} (${node.type})`, 10, y);
        y += 6;
        doc.setTextColor(0);
        const val = values[node.id];
        const flat = isGrouped(node.attributes)
          ? Object.entries(val).flatMap(([gk, gv]) =>
              Object.entries(gv).map(([k, v]) => [`${gk} - ${k}`, v])
            )
          : Object.entries(val);
        flat.forEach(([k, v]) => {
          doc.text(`- ${k}: ${v}`, 12, y);
          y += 6;
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        });
        y += 4;
      }
    });

    doc.save("silabo.pdf");
  };

  return (
    <div className="container mt-4">
      <h2 className="text-primary">Editor de Sílabo</h2>
      <ul className="list-unstyled">{renderEditor(tree)}</ul>
      <button className="btn btn-primary mt-4" onClick={exportPDF}>📄 Exportar a PDF</button>
    </div>
  );
};

export default SyllabusEditor;