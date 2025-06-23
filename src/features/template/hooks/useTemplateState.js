// hooks/useTemplateState.js
import { useState, useEffect } from 'react';

export const useTemplateState = () => {
  const [templateExists, setTemplateExists] = useState(false);
  const [templateStats, setTemplateStats] = useState({ nodes: 0, sections: 0, lastModified: null });

  const checkTemplate = () => {
    const template = localStorage.getItem('mptt_template');
    if (template) {
      try {
        const parsed = JSON.parse(template);
        const exists = parsed.length > 1;
        setTemplateExists(exists);
        setTemplateStats({
          nodes: parsed.length,
          sections: parsed.filter(n => n.parent === null && n.id !== 1).length,
          lastModified: localStorage.getItem('template_last_modified') || new Date().toISOString()
        });
      } catch (error) {
        setTemplateExists(false);
        setTemplateStats({ nodes: 0, sections: 0, lastModified: null });
      }
    } else {
      setTemplateExists(false);
      setTemplateStats({ nodes: 0, sections: 0, lastModified: null });
    }
  };

  useEffect(() => {
    checkTemplate();
    
    // Escuchar eventos de storage
    const handleStorageChange = (e) => {
      if (e.key === 'mptt_template' || e.key === 'template_last_modified') {
        checkTemplate();
      }
    };
    
    // Escuchar evento personalizado
    const handleTemplateUpdate = () => {
      checkTemplate();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('templateUpdated', handleTemplateUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('templateUpdated', handleTemplateUpdate);
    };
  }, []);

  const triggerTemplateUpdate = () => {
    checkTemplate();
    window.dispatchEvent(new CustomEvent('templateUpdated'));
  };

  return { templateExists, templateStats, triggerTemplateUpdate };
};


// ara reducir codigo del componente TemplateBuilder y también los styles  y en lo visual haz mejorad para que el diseño sea un diseño intuitivo y claro que permite a los usuarios encontrar lo que necesitan rápidamente y sin complicaciones y que en '**Agregar Nueva Sección**' los **Campo **se puedan mover para arriba y abajo y también creo que sería bueno separa los modals en otro componente para refacturizar el codigo y reducir las linas de codigo esto como un programador senior y esto debuelme en archivos separados y sin el test