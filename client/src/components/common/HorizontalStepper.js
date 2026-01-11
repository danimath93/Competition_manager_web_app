import React from 'react';
import './HorizontalStepper.css';

/**
 * Componente HorizontalStepper - Stepper orizzontale riutilizzabile
 * 
 * @param {Object} props - Proprietà del componente
 * @param {Array} props.steps - Array di oggetti step { label: string, number: number }
 * @param {number} props.activeStep - Indice dello step attivo (0-based)
 * @param {function} props.onStepClick - Funzione chiamata al click su uno step (opzionale)
 */
const HorizontalStepper = ({ 
  steps = [], 
  activeStep = 0,
  onStepClick
}) => {
  // Calcola la larghezza della barra di progresso
  const progressWidth = steps.length > 1 
    ? (activeStep / (steps.length - 1)) * 100 
    : 0;

  const handleStepClick = (index) => {
    if (onStepClick) {
      onStepClick(index);
    }
  };

  const getStepClass = (index) => {
    if (index < activeStep) return 'completed';
    if (index === activeStep) return 'active';
    return 'pending';
  };

  return (
    <div className="horizontal-stepper">
      <div className="stepper-container">
        {/* Rendering degli step con linee */}
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div 
              className={`stepper-step ${getStepClass(index)}`}
              onClick={() => handleStepClick(index)}
            >
              {/* Label solo per step attivo */}
              {index === activeStep && (
                <div className="stepper-label-active">
                  {step.label}
                </div>
              )}
              <div className="stepper-circle">
                {step.number || index + 1}
              </div>
            </div>
            
            {/* Linea dopo ogni step tranne l'ultimo */}
            {index < steps.length - 1 && (
              <div className={`stepper-line ${index < activeStep ? 'completed' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default HorizontalStepper;
