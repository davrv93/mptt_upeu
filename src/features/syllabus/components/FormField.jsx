import React, { useCallback, useMemo } from 'react';
import { determineFieldType, formatFieldLabel } from '../utils/syllabusUtils';

const FormField = ({
  nodeId,
  fieldKey,
  defaultValue,
  value,
  onChange
}) => {
  const fieldType = useMemo(() => determineFieldType(fieldKey, defaultValue), [fieldKey, defaultValue]);
  const fieldId = useMemo(() => `field_${nodeId}_${fieldKey}`, [nodeId, fieldKey]);
  
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    
    console.log('📝 Input cambió:', {
      nodeId,
      fieldKey,
      oldValue: value,
      newValue,
      event: e.type
    });
    
    if (typeof onChange === 'function') {
      console.log('✅ Llamando a onChange...');
      onChange(nodeId, fieldKey, newValue);
    } else {
      console.error('❌ onChange no es una función:', typeof onChange);
    }
  }, [nodeId, fieldKey, value, onChange]);

  const commonProps = useMemo(() => ({
    id: fieldId,
    name: fieldKey,
    value: value || '',
    onChange: handleChange,
    className: "form-control",
    style: { 
      borderRadius: '8px', 
      fontSize: '0.9rem', 
      border: '1px solid #86B7FE',
      transition: 'border-color 0.2s ease'
    },
    placeholder: defaultValue || `Ingrese ${formatFieldLabel(fieldKey)}`
  }), [fieldId, fieldKey, value, handleChange, defaultValue]);

  const renderInput = () => {
    switch (fieldType) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows="4"
            style={{ 
              ...commonProps.style, 
              resize: 'vertical', 
              minHeight: '100px' 
            }}
          />
        );

      case 'select':
        const options = defaultValue?.split(',') || [];
        return (
          <select {...commonProps}>
            <option value="">Seleccione una opción</option>
            {options.map((option, idx) => (
              <option key={idx} value={option.trim()}>
                {option.trim()}
              </option>
            ))}
          </select>
        );

      case 'date':
        return <input {...commonProps} type="date" />;

      case 'number':
        return <input {...commonProps} type="number" min="0" step="1" />;

      case 'email':
        return <input {...commonProps} type="email" />;

      default:
        return <input {...commonProps} type="text" />;
    }
  };

  return (
    <div className="col-md-6 mb-3">
      <label
        htmlFor={fieldId}
        className="form-label"
        style={{ 
          color: '#8F9BB3', 
          fontSize: '12px', 
          fontWeight: '700',
          marginBottom: '5px'
        }}
      >
        {formatFieldLabel(fieldKey)}
        {fieldType === 'textarea' && (
          <span className="text-muted"> (Descripción extensa)</span>
        )}
      </label>
      {renderInput()}
    </div>
  );
};

export default React.memo(FormField);