import React from 'react';
import './Button.css';

/**
 * Componente Button riutilizzabile
 * 
 * @param {Object} props - Proprietà del componente
 * @param {string} props.variant - Variante del bottone ('primary', 'secondary', 'info', 'success', 'warning', 'danger', 'outline')
 * @param {string} props.size - Dimensione del bottone ('xs', 's', 'medium', 'l', 'xl')
 * @param {React.ReactNode} props.icon - Icona da mostrare a sinistra (componente React Icon)
 * @param {React.ReactNode} props.children - Contenuto del bottone
 * @param {boolean} props.disabled - Se il bottone è disabilitato
 * @param {boolean} props.fullWidth - Se il bottone deve occupare tutta la larghezza disponibile
 * @param {boolean} props.inline - Previene full-width automatico su mobile (default: false)
 * @param {string} props.type - Tipo del bottone ('button', 'submit', 'reset')
 * @param {function} props.onClick - Funzione da chiamare al click
 * @param {string} props.className - Classi CSS aggiuntive
 */
const Button = ({ 
  variant = 'primary',
  size = 'm',
  icon: Icon,
  children,
  disabled = false,
  fullWidth = false,
  inline = false,
  type = 'button',
  onClick,
  className = '',
  ...rest
}) => {
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full-width' : '',
    inline ? 'btn-inline' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {Icon && (
        <span className="btn-icon">
          <Icon />
        </span>
      )}
      {children && (
        <span className="btn-text">
          {children}
        </span>
      )}
    </button>
  );
};

export default Button;
