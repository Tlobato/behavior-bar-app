import React from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean; // Controla se o modal está aberto ou fechado
  onClose: () => void; // Função chamada ao fechar o modal
  onConfirm: () => void; // Função chamada ao confirmar a ação
  title: string; // Título do modal
  message: string; // Mensagem exibida no modal
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) {
    return null; // Não renderiza nada se o modal estiver fechado
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <button onClick={onClose} className="modal-button cancel">
            Cancelar
          </button>
          <button onClick={onConfirm} className="modal-button confirm">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;