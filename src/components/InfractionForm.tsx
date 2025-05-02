// src/components/InfractionForm.tsx
import React, { useState } from 'react';
import { InfractionCategory } from '../types';

interface InfractionFormProps {
  categories: InfractionCategory[];
  onAddInfraction: (description: string, points: number) => void;
}

const InfractionForm: React.FC<InfractionFormProps> = ({ categories, onAddInfraction }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [customPoints, setCustomPoints] = useState<number>(5);
  const [useCustom, setUseCustom] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useCustom) {
      // Usar dados personalizados
      if (customDescription.trim() && customPoints > 0) {
        onAddInfraction(customDescription.trim(), customPoints);
        setCustomDescription('');
        setCustomPoints(5);
      }
    } else {
      // Usar categoria pré-definida
      if (selectedCategory) {
        const category = categories.find(cat => cat.id === selectedCategory);
        if (category) {
          onAddInfraction(category.description, category.pointsDeduction);
          setSelectedCategory('');
        }
      }
    }
  };

  return (
    <div className="infraction-form">
      <h3>Registrar Comportamento</h3>
      
      <div className="form-toggle" style={{ 
        marginBottom: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <label>
          <input
            type="radio"
            checked={!useCustom}
            onChange={() => setUseCustom(false)}
          />
          {' '}Usar categoria pré-definida
        </label>
        <label>
          <input
            type="radio"
            checked={useCustom}
            onChange={() => setUseCustom(true)}
          />
          {' '}Personalizado
        </label>
      </div>
      
      <form onSubmit={handleSubmit}>
        {!useCustom ? (
          <div className="category-selector">
            <label htmlFor="category-select">Selecione a categoria:</label>
            <select 
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #ccc' 
              }}
            >
              <option value="">-- Selecione uma opção --</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} (-{category.pointsDeduction} pontos)
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="custom-infraction">
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="description">Descrição da infração:</label>
              <input
                id="description"
                type="text"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Ex: Não fez a lição de casa"
                required={useCustom}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #ccc' 
                }}
              />
            </div>
            
            <div>
              <label htmlFor="points">Pontos a deduzir:</label>
              <input
                id="points"
                type="number"
                min="1"
                max="20"
                value={customPoints}
                onChange={(e) => setCustomPoints(Number(e.target.value))}
                required={useCustom}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #ccc' 
                }}
              />
            </div>
          </div>
        )}
        
        <div className="form-buttons">
          <button 
            type="submit"
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 15px',
              marginTop: '15px',
              cursor: 'pointer'
            }}
          >
            Registrar Infração
          </button>
        </div>
      </form>
    </div>
  );
};

export default InfractionForm;