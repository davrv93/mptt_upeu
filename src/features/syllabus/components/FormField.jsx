import React from 'react';
import { determineFieldType, formatFieldLabel } from '../utils/syllabusUtils';

const FormField = ({ 
  nodeId, 
  fieldKey, 
  defaultValue, 
  value, 
  onChange 
}) => {
  const fieldType = determineFieldType(fieldKey, defaultValue);
  const fieldId = `field_${nodeId}_${fieldKey}`;

  const commonProps = {
    id: fieldId,
    value: value || '',
    onChange: (e) => onChange(nodeId, fieldKey, e.target.value),
    className: "form-control",
    style: { borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #86B7FE' },
    placeholder: defaultValue || `Ingrese ${fieldKey}`
  };

  const renderInput = () => {
    if (fieldType === 'textarea') {
      return (
        <textarea
          {...commonProps}
          rows="4"
          style={{ ...commonProps.style, resize: 'vertical', minHeight: '100px' }}
        />
      );
    }

    if (fieldType === 'select') {
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
    }

    return <input type={fieldType} {...commonProps} />;
  };

  return (
    <div className="col-md-6">
      <label
        htmlFor={fieldId}
        style={{ color: '#8F9BB3', fontSize: '12px', fontWeight: '700' }}
      >
        {formatFieldLabel(fieldKey)}
        {fieldType === 'textarea' && <span className="text-muted"> (Descripción extensa)</span>}
      </label>
      {renderInput()}
    </div>
  );
};

export default FormField;