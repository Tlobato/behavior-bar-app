import React from 'react';
import './NewRegistrationComponent.css';
import { NewRegistrationComponentProps } from '../../types';

const NewRegistrationComponent: React.FC<NewRegistrationComponentProps> = ({
  title,
  buttonText,
  onButtonClick,
  width // Nova propriedade
}) => {
  // Só aplicamos o estilo inline se a largura for fornecida
  const containerStyle = width ? { width } : {};

  return (
    <div className="new-registration-container" style={containerStyle}>
      <div className="new-registration-section">
        <h2>{title}</h2>
        <button 
          onClick={onButtonClick} 
          className="new-registration-button"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default NewRegistrationComponent;