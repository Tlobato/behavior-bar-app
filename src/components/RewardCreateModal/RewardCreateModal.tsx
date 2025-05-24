import React, { useState, useEffect } from 'react';
import './RewardCreateModal.css';
import { RewardCreateModalProps } from '../../types';
import { FiUpload } from 'react-icons/fi';

const RewardCreateModal: React.FC<RewardCreateModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [rewardData, setRewardData] = useState({
    title: '',
    description: '',
    points: 0,
    active: true
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsEntering(true);
      setTimeout(() => setIsEntering(false), 50);
    }
  }, [isOpen]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      <div className="modal-content">
        <h2>Criar Nova Recompensa</h2>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="title">Título da Recompensa</label>
              <input
                type="text"
                id="title"
                name="title"
                value={rewardData.title}
                onChange={handleInputChange}
                placeholder="Ex: Cartão presente Xbox"
                required
              />
            </div>

            <div>
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                name="description"
                value={rewardData.description}
                onChange={handleInputChange}
                placeholder="Descreva a recompensa..."
                required
              />
            </div>

            <div>
              <label htmlFor="points">Pontos Necessários</label>
              <input
                type="number"
                id="points"
                name="points"
                value={rewardData.points}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div>
              <label>Imagem da Recompensa</label>
              <div className="image-upload-container">
                <div className="image-preview-container">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="no-image-placeholder">
                      Nenhuma imagem selecionada
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
              </div>
            </div>

            <div className="active-status">
              <input
                type="checkbox"
                id="isAvailable"
                name="active"
                checked={rewardData.active}
                onChange={e => setRewardData(prev => ({ ...prev, active: e.target.checked }))}
              />
              <label htmlFor="isAvailable">Disponível para resgate</label>
            </div>
          </form>
        </div>

        <div className="modal-actions">
          <button type="button" className="cancel-button" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="create-reward-button" onClick={handleSubmit}>
            Criar Recompensa
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardCreateModal;