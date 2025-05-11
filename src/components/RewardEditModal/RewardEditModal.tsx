import React, { useState, useEffect } from 'react';
import './RewardEditModal.css';
import { Reward } from '../../types';
import { FiX } from 'react-icons/fi';

interface RewardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedReward: EditRewardData) => void;
  reward: Reward | null;
}

export interface EditRewardData {
  id: number;
  title: string;
  description: string;
  points: number;
  imageFile?: File | null;
  active?: boolean;
}

const RewardEditModal: React.FC<RewardEditModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  reward 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resetar os campos quando o modal abrir com uma nova recompensa
  useEffect(() => {
    if (reward) {
      setTitle(reward.title || '');
      setDescription(reward.description || '');
      setPoints(reward.points || 0);
      setActive(reward.active !== false); // Se active for undefined, assume true
      setImagePreview(reward.imageUrl || null);
      setImageFile(null); // Reset do arquivo ao carregar novos dados
    }
  }, [reward]);

  if (!isOpen || !reward) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('O título é obrigatório');
      return;
    }

    if (points <= 0) {
      setErrorMessage('Os pontos devem ser um valor positivo');
      return;
    }

    const editedReward: EditRewardData = {
      id: reward.id || 0,
      title,
      description,
      points,
      imageFile,
      active
    };

    onSave(editedReward);
  };

  return (
    <div className="reward-edit-modal-overlay">
      <div className="reward-edit-modal">
        <button className="close-button" onClick={onClose}>
          <FiX size={24} />
        </button>
        
        <h2>Editar Recompensa</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da recompensa"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite uma descrição para a recompensa"
            />
          </div>

          <div className="form-group">
            <label htmlFor="points">Pontos Necessários</label>
            <input
              type="number"
              id="points"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="active">Status</label>
            <select
              id="active"
              value={active ? "active" : "inactive"}
              onChange={(e) => setActive(e.target.value === "active")}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="image">Imagem</label>
            <div className="image-upload-container">
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
              />
              <p className="helper-text">
                {imageFile ? 'Nova imagem selecionada' : 'Manter imagem atual ou selecionar uma nova'}
              </p>
            </div>
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" className="save-button">
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RewardEditModal;