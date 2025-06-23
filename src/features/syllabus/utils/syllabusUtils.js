export const getNodeIcon = (type) => {
  const icons = {
    'INFORMACION_GENERAL': '📋',
    'Información General': '📋',
    'SUMILLA': '📝',
    'Sumilla': '📝',
    'COMPETENCIAS': '🎯',
    'Competencias': '🎯',
    'METODOLOGIA': '🔬',
    'Metodología': '🔬',
    'EVALUACION': '📊',
    'Evaluación': '📊',
    'RECURSOS': '📚',
    'Recursos': '📚',
    'BIBLIOGRAFIA': '📖',
    'Bibliografía': '📖',
    'CRONOGRAMA': '📅',
    'Cronograma': '📅'
  };
  return icons[type] || '📄';
};

export const getNodeColor = (type) => {
  let hash = 0;
  const str = type || 'default';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = ['#007bff', '#28a745', '#ffc107', '#17a2b8', '#dc3545', '#6f42c1', '#fd7e14', '#20c997'];
  return colors[Math.abs(hash) % colors.length];
};

export const formatFieldLabel = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

export const determineFieldType = (fieldKey, defaultValue) => {
  const key = fieldKey.toLowerCase();

  if (key.includes('email') || key.includes('correo')) return 'email';
  if (key.includes('fecha') || key.includes('date')) return 'date';
  if (key.includes('numero') || key.includes('creditos') || key.includes('horas')) return 'number';
  if (key.includes('descripcion') || key.includes('contenido') || key.includes('objetivo')) return 'textarea';
  if (defaultValue && defaultValue.includes(',')) return 'select';

  return 'text';
};

export const debugLocalStorage = (nodes, syllabusData) => {
  console.log('=== DEBUG SYLLABUS EDITOR ===');
  console.log('Nodos cargados:', nodes.length);
  
  nodes.forEach(node => {
    console.log(`  - ID: ${node.id}, Nombre: "${node.name}", Padre: ${node.parent}, Campos: ${Object.keys(node.attributes || {}).length}`);
  });

  const templateExists = localStorage.getItem('mptt_template');
  const dataExists = localStorage.getItem('syllabus_editor_data');

  console.log('Template en localStorage:', templateExists ? 'SÍ' : 'NO');
  console.log('Datos en localStorage:', dataExists ? 'SÍ' : 'NO');
  console.log('Nodos con datos:', Object.keys(syllabusData).length);
  console.log('==============================');

  return `📊 ${nodes.length} nodos | ${Object.keys(syllabusData).length} con datos | Template: ${templateExists ? '✅' : '❌'}`;
};