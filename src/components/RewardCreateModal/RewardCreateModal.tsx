import React, { useState } from 'react';
import './RewardCreateModal.css';
import { RewardCreateModalProps } from '../../types';

const RewardCreateModal: React.FC<RewardCreateModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [rewardData, setRewardData] = useState({
    title: '',
    description: '',
    points: 0,
    active: true
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setRewardData((prev) => ({
        ...prev,
        [name]: value ? parseInt(value, 10) : 0
      }));
    } else {
      setRewardData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = () => {
    if (!rewardData.title || !rewardData.description || rewardData.points <= 0) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }
    
    if (!imageFile) {
      alert("Por favor, selecione uma imagem para a recompensa.");
      return;
    }

    onCreate({
      ...rewardData,
      imageFile
    });
    resetForm();
  };

  const resetForm = () => {
    setRewardData({
      title: '',
      description: '',
      points: 0,
      active: true
    });
    setImageFile(null);
    setImagePreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content reward-modal-content">
        <h2>Criar Nova Recompensa</h2>
        <div className="modal-divider"></div>
        
        <form autoComplete="off">
          <label>Título da Recompensa:</label>
          <input
            type="text"
            name="title"
            value={rewardData.title}
            onChange={handleInputChange}
            autoComplete="off"
            placeholder="Ex: Cartão presente Xbox"
          />

          <label>Descrição:</label>
          <textarea
            name="description"
            value={rewardData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Descreva a recompensa..."
          />

          <label>Pontos Necessários:</label>
          <input
            type="number"
            name="points"
            value={rewardData.points}
            onChange={handleInputChange}
            min="1"
            placeholder="Ex: 1000"
          />

          <label>Imagem da Recompensa:</label>
          <div className="image-upload-container">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            <div className="image-preview-container">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="image-preview" />
              ) : (
                <div className="no-image-placeholder">
                  <span>Nenhuma imagem selecionada</span>
                </div>
              )}
            </div>
          </div>

          <div className="active-status">
            <input
              type="checkbox"
              name="active"
              checked={rewardData.active}
              onChange={e => setRewardData(prev => ({ ...prev, active: e.target.checked }))}
              id="active-checkbox"
            />
            <label htmlFor="active-checkbox">Disponível para resgate</label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={handleCreate} className="create-reward-button">
              Criar
            </button>
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RewardCreateModal;