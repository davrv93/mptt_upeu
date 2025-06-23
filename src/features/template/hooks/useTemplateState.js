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