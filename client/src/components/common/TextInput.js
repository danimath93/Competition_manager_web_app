import React from 'react';
import './TextInput.css';

const TextInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  type = 'text',
  name,
  autoComplete,
  maxLength
}) => {
  return (
    <div className="text-input-container">
      {label && (
        <label htmlFor={id} className="text-input-label">
          <h6>
            {label}
            {required && <span className="required-asterisk">*</span>}
          </h6>
        </label>
      )}
      <div className="text-input-wrapper">
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="text-input-field"
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
        />
      </div>
    </div>
  );
};

export default TextInput;
