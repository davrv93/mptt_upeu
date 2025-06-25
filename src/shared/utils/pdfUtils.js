import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const PDF_CONFIG = {
  format: 'a4',
  orientation: 'portrait',
  unit: 'mm',
  margin: {
    top: 20,
    right: 15,
    bottom: 20,
    left: 15
  },
  quality: 1.0,
  scale: 2,
  useCORS: true,
  allowTaint: true
};


export const PDF_STYLES = `
  .pdf-container {
    background: white;
    font-family: 'Times New Roman', serif;
    font-size: 12px;
    line-height: 1.6;
    color: #000;
    padding: 20px;
    max-width: 210mm;
    margin: 0 auto;
  }

  .pdf-header {
    background: #003264;
    text-align: center;
    margin-bottom: 30px;
    padding-bottom: 15px;
  }

  .pdf-university {
    padding-top: 20px;
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 5px;
  }

  .pdf-info {
    font-size: 12px;
    color: #fff;
    margin-bottom: 10px;
  }

  .pdf-title {
    font-size: 18px;
    font-weight: bold;
    text-transform: uppercase;
    color: #F8A900;
  }

  .pdf-section {
    margin-bottom: 25px;
    page-break-inside: avoid;
  }

  .pdf-section-title {
    font-size: 14px;
    font-weight: bold;
    color: #000;
    margin-bottom: 10px;
    padding: 8px 12px;
    text-transform: uppercase;
  }

  .pdf-subsection {
    margin-bottom: 15px;
    margin-left: 10px;
  }

  .pdf-subsection-title {
    font-size: 12px;
    font-weight: bold;
    color: #000;
    margin-bottom: 8px;
    text-decoration: underline;
    border: 1px solid blue;
  }

  .pdf-field {
    margin-bottom: 6px;
    display: flex;
    align-items: flex-start;
  }

  .pdf-field-label {
    font-weight: bold;
    min-width: 120px;
    margin-right: 8px;
    color: #333;
    margin-left: 20px;
  }

  .pdf-field-value {
    flex: 1;
    word-wrap: break-word;
  }

  .pdf-footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
    text-align: center;
    font-size: 10px;
    color: #666;
  }

  .pdf-signature-section {
    margin-top: 50px;
    display: flex;
    justify-content: space-around;
    text-align: center;
  }

  .pdf-signature {
    width: 200px;
  }

  .pdf-signature-line {
    border-top: 1px solid #000;
    margin-top: 60px;
    padding-top: 5px;
    font-size: 10px;
  }

  .table-countainer {
    margin-left: 20px;
  }

  .pdf-instances-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
    font-size: 11px;
  }

  .pdf-instances-table th,
  .pdf-instances-table td {
    border: 1px solid #CFD8ED;
    padding: 8px;
    text-align: left;
    vertical-align: top;
  }

  .pdf-instances-table th {
    background-color: #EAF8FF;
    font-weight: bold;
    color: #276CA1;
  }

  .pdf-instances-table tr:nth-child(even) {
    background-color: #F3F6F8;
  }


  @media print {
    .pdf-container {
      margin: 0;
      padding: 15mm;
    }
    
    .pdf-section {
      page-break-inside: avoid;
    }
    
    .no-print {
      display: none !important;
    }
  }
`;

/**
 * Extrae información básica del sílabo para el header
 * @param {Object} syllabusData - Datos del sílabo
 * @param {Array} nodes - Nodos de la plantilla
 * @returns {Object} Información básica extraída
 */
const extractBasicInfo = (syllabusData, nodes) => {
  let faculty = 'Facultad de Ciencias de la Salud';
  let program = 'EP Medicina';
  let courseName = 'Biofísica';

  nodes.forEach(node => {
    const nodeData = syllabusData[node.id];
    if (nodeData) {
      if (nodeData['Facultad/EPG']) faculty = nodeData['Facultad/EPG'];
      if (nodeData['Facultad']) faculty = nodeData['Facultad'];

      if (nodeData['Programa de Estudio']) program = nodeData['Programa de Estudio'];
      if (nodeData['Programa']) program = nodeData['Programa'];

      if (nodeData['Nombre de asignatura']) courseName = nodeData['Nombre de asignatura'];
      if (nodeData['Asignatura']) courseName = nodeData['Asignatura'];
      if (nodeData['Curso']) courseName = nodeData['Curso'];
    }
  });

  return { faculty, program, courseName };
};

/**
 * Genera el HTML estructurado para el PDF
 * @param {Object} syllabusData - Datos del sílabo
 * @param {Array} nodes - Nodos de la plantilla
 * @returns {string} HTML estructurado
 */
export const generatePDFHTML = (syllabusData, nodes) => {
  const basicInfo = extractBasicInfo(syllabusData, nodes);

  const rootChildren = nodes.filter(node => node.parent === 1 && node.id !== 1);

  let html = `
    <div class="pdf-container">
      <!-- Header del documento -->
      <div class="pdf-header">
        <div class="pdf-university">Universidad Peruana Unión</div>
        <div class="pdf-info">Carret. Central km. 19.5 Ñaña. T elf. 01-6186300 Casilla 3564 Lima 1, Perú</div>
        <div class="pdf-title">SÍLABO: ${basicInfo.courseName.toUpperCase()}</div>
      </div>
  `;

  rootChildren.forEach((section, index) => {
    html += generateSectionHTML(section, syllabusData, nodes, index);
  });

  html += `
      <!-- Footer del documento -->
      <div class="pdf-footer">
        <p>Documento generado el ${new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}</p>
      </div>

    </div>
  `;

  return html;
};

/**
 * Genera HTML para una sección específica
 * @param {Object} section - Sección del sílabo
 * @param {Object} syllabusData - Datos del sílabo
 * @param {Array} nodes - Todos los nodos
 * @param {number} index - Índice de la sección para numeración
 * @returns {string} HTML de la sección
 */
const generateSectionHTML = (section, syllabusData, nodes, index = 0) => {
  let html = `<div class="pdf-section">`;
  html += `<div class="pdf-section-title">${index + 1}. ${section.name}</div>`;

  if (section.attributes && Object.keys(section.attributes).length > 0) {
    // Verificar si la sección permite múltiples instancias
    if (section.allowMultipleInstances) {
      // Generar tabla para instancias múltiples
      html += generateInstancesTableHTML(section, syllabusData);
    } else {
      // Generar campos normales para sección única
      Object.entries(section.attributes).forEach(([key, defaultValue]) => {
        const value = syllabusData[section.id]?.[key] || defaultValue || '';

        if (value && value.toString().trim() !== '') {
          html += `
            <div class="pdf-field">
              <span class="pdf-field-label">${formatFieldLabel(key)}:</span>
              <span class="pdf-field-value">${formatFieldValue(value)}</span>
            </div>
          `;
        }
      });
    }
  }

  const subsections = nodes.filter(node => node.parent === section.id);
  subsections.forEach(subsection => {
    html += `<div class="pdf-subsection">`;
    html += `<div class="pdf-subsection-title">${subsection.name}</div>`;

    if (subsection.attributes && Object.keys(subsection.attributes).length > 0) {
      // Verificar si la subsección permite múltiples instancias
      if (subsection.allowMultipleInstances) {
        // Generar tabla para instancias múltiples
        html += generateInstancesTableHTML(subsection, syllabusData);
      } else {
        // Generar campos normales para subsección única
        Object.entries(subsection.attributes).forEach(([key, defaultValue]) => {
          const value = syllabusData[subsection.id]?.[key] || defaultValue || '';

          if (value && value.toString().trim() !== '') {
            html += `
              <div class="pdf-field">
                <span class="pdf-field-label">${formatFieldLabel(key)}:</span>
                <span class="pdf-field-value">${formatFieldValue(value)}</span>
              </div>
            `;
          }
        });
      }
    }

    const subSubsections = nodes.filter(node => node.parent === subsection.id);
    subSubsections.forEach(subSub => {
      html += generateSectionHTML(subSub, syllabusData, nodes, 0);
    });

    html += `</div>`;
  });

  html += `</div>`;
  return html;
};

/**
 * Genera HTML de tabla para instancias múltiples
 * @param {Object} section - Sección con múltiples instancias
 * @param {Object} syllabusData - Datos del sílabo
 * @returns {string} HTML de la tabla
 */
const generateInstancesTableHTML = (section, syllabusData) => {
  const instances = syllabusData[section.id]?.instances || {};
  const instanceIds = Object.keys(instances).sort((a, b) => parseInt(a) - parseInt(b));

  if (instanceIds.length === 0) {
    return '<p><em>No hay instancias agregadas</em></p>';
  }

  const fieldKeys = Object.keys(section.attributes || {});

  if (fieldKeys.length === 0) {
    return '<p><em>No hay campos configurados</em></p>';
  }

  let tableHTML = '<div class="table-countainer"> <table class="pdf-instances-table">';

  // Crear header de la tabla
  tableHTML += '<thead><tr>';
  fieldKeys.forEach(fieldKey => {
    tableHTML += `<th>${formatFieldLabel(fieldKey)}</th>`;
  });
  tableHTML += '</tr></thead>';

  // Crear filas de datos
  tableHTML += '<tbody>';
  instanceIds.forEach(instanceId => {
    const instanceData = instances[instanceId] || {};
    tableHTML += '<tr>';

    fieldKeys.forEach(fieldKey => {
      const value = instanceData[fieldKey] || section.attributes[fieldKey] || '';
      tableHTML += `<td>${formatFieldValue(value)}</td>`;
    });

    tableHTML += '</tr>';
  });
  tableHTML += '</tbody>';

  tableHTML += '</table>';

  return tableHTML;
};

/**
 * Formatea el label de un campo
 * @param {string} key - Clave del campo
 * @returns {string} Label formateado
 */
const formatFieldLabel = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/\//g, ' / ')
    .trim();
};

/**
 * Formatea el valor de un campo
 * @param {any} value - Valor del campo
 * @returns {string} Valor formateado
 */
const formatFieldValue = (value) => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value || '').replace(/\n/g, '<br>');
};

/**
 * Genera PDF usando html2canvas y jsPDF
 * @param {string} htmlContent - Contenido HTML
 * @param {string} filename - Nombre del archivo
 * @param {Object} options - Opciones adicionales
 * @returns {Promise} Promise que resuelve cuando el PDF se genera
 */
export const generatePDF = async (htmlContent, filename = 'silabo.pdf', options = {}) => {
  try {
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = `
      <style>${PDF_STYLES}</style>
      ${htmlContent}
    `;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '210mm';
    tempContainer.style.background = 'white';

    document.body.appendChild(tempContainer);

    const canvas = await html2canvas(tempContainer, {
      scale: options.scale || PDF_CONFIG.scale,
      useCORS: options.useCORS || PDF_CONFIG.useCORS,
      allowTaint: options.allowTaint || PDF_CONFIG.allowTaint,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      scrollX: 0,
      scrollY: 0
    });

    document.body.removeChild(tempContainer);

    const pdf = new jsPDF({
      orientation: options.orientation || PDF_CONFIG.orientation,
      unit: options.unit || PDF_CONFIG.unit,
      format: options.format || PDF_CONFIG.format
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    );

    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
      heightLeft -= pageHeight;
    }

    pdf.save(filename);

    return {
      success: true,
      message: 'PDF generado exitosamente',
      filename
    };

  } catch (error) {
    console.error('Error generando PDF:', error);
    return {
      success: false,
      message: 'Error al generar PDF: ' + error.message,
      error
    };
  }
};

/**
 * Genera PDF optimizado para impresión
 * @param {Object} syllabusData - Datos del sílabo
 * @param {Array} nodes - Nodos de la plantilla
 * @param {string} filename - Nombre del archivo
 * @returns {Promise} Promise con el resultado
 */
export const generateOptimizedPDF = async (syllabusData, nodes, filename) => {
  const htmlContent = generatePDFHTML(syllabusData, nodes);

  return await generatePDF(htmlContent, filename, {
    scale: 2,
    quality: 1.0,
    useCORS: true,
    allowTaint: true
  });
};

/**
 * Vista previa del PDF en una nueva ventana
 * @param {Object} syllabusData - Datos del sílabo
 * @param {Array} nodes - Nodos de la plantilla
 */
export const previewPDF = (syllabusData, nodes) => {
  const htmlContent = generatePDFHTML(syllabusData, nodes);

  const previewWindow = window.open('', '_blank');
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vista Previa - Sílabo</title>
      <style>${PDF_STYLES}</style>
      <style>
        body { margin: 0; padding: 20px; background: #f5f5f5; }
        .preview-actions { 
          position: fixed; 
          top: 10px; 
          right: 10px; 
          z-index: 1000;
          background: white;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .preview-actions button {
          margin: 0 5px;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-print { background: #003264; color: white; }
        .btn-close { background: #DB0000; color: white; }
      </style>
    </head>
    <body>
      <div class="preview-actions no-print">
        <button class="btn-print" onclick="window.print()">🖨️ Imprimir</button>
        <button class="btn-close" onclick="window.close()">❌ Cerrar</button>
      </div>
      ${htmlContent}
    </body>
    </html>
  `);
  previewWindow.document.close();
};

export default {
  generatePDF,
  generateOptimizedPDF,
  previewPDF,
  generatePDFHTML,
  PDF_CONFIG,
  PDF_STYLES
};