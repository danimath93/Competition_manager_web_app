import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './PasswordInput.css';

const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  name,
  autoComplete = 'current-password',
  maxLength
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="password-input-container">
      {label && (
        <label htmlFor={id} className="password-input-label">
          <h6>
            {label}
            {required && <span className="required-asterisk">*</span>}
          </h6>
        </label>
      )}
      <div className="password-input-wrapper">
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="password-input-field"
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
