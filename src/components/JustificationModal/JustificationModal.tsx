import React, { useState } from 'react';
import './JustificationModal.css';

interface JustificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (justification: string) => void;
  title: string;
  message?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  placeholder?: string;
}

const JustificationModal: React.FC<JustificationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title,
  message,
  confirmButtonText = "Confirmar",
  cancelButtonText = "Cancelar",
  placeholder = "Digite sua justificativa aqui..."
}) => {
  const [justification, setJustification] = useState<string>('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setJustification(e.target.value);
  };

  const handleConfirm = () => {
    if (!justification.trim()) {
      alert('Por favor, forneça uma justificativa.');
      return;
    }

    onConfirm(justification);
    resetForm();
  };

  const resetForm = () => {
    setJustification('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content justification-modal-content">
        <h2>{title}</h2>
        <div className="modal-divider"></div>

        <form autoComplete="off">
          {message && <p className="modal-message">{message}</p>}
          
          <label>Justificativa:</label>
          <textarea
            name="justification"
            value={justification}
            onChange={handleInputChange}
            rows={4}
            placeholder={placeholder}
            required
          />

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={handleConfirm} 
              className="confirm-button"
            >
              {confirmButtonText}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-button"
            >
              {cancelButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JustificationModal;