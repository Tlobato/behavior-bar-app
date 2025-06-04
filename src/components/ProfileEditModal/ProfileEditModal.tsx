import React, { useState, useRef } from 'react';
import './ProfileEditModal.css';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    email: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    imageFile?: File | null;
  }) => void;
  user: {
    name: string;
    email: string;
    profileImageUrl?: string | null;
  } | null;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose, onSave, user }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profileImageUrl || null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setImagePreview(user?.profileImageUrl || null);
  }, [user, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      alert('Nova senha e confirmação não coincidem.');
      return;
    }
    onSave({ name, email, currentPassword, newPassword, confirmPassword, imageFile });
  };

  if (!isOpen) return null;

  return (
    <div className="profile-edit-modal-overlay">
      <div className="profile-edit-modal">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>Editar Perfil</h2>
        <form onSubmit={handleSubmit}>
          <div className="profile-image-section">
            <div className="profile-image-preview" onClick={() => fileInputRef.current?.click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="Foto de perfil" />
              ) : (
                <span className="profile-placeholder">👤</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <button type="button" className="change-photo-btn" onClick={() => fileInputRef.current?.click()}>
              Alterar foto
            </button>
          </div>
          <label>
            Nome
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </label>
          <label>
            E-mail
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label className="password-label">
            Senha atual
            <div className="password-input-wrapper">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <span
                className="password-visibility-icon"
                onClick={() => setShowCurrentPassword(v => !v)}
                title={showCurrentPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showCurrentPassword ? '🙈' : '👁️'}
              </span>
            </div>
          </label>
          <label className="password-label">
            Nova senha
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <span
                className="password-visibility-icon"
                onClick={() => setShowNewPassword(v => !v)}
                title={showNewPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showNewPassword ? '🙈' : '👁️'}
              </span>
            </div>
          </label>
          <label className="password-label">
            Confirmar nova senha
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <span
                className="password-visibility-icon"
                onClick={() => setShowConfirmPassword(v => !v)}
                title={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </span>
            </div>
          </label>
          <div className="profile-edit-modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancelar</button>
            <button type="submit" className="save-btn">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal; 