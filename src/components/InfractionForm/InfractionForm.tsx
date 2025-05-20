import React, { useState, useEffect } from 'react';
import { InfractionCategory, InfractionFormProps } from '../../types';
import { getInfractionCategories } from '../../services/behaviorService';
import './InfractionForm.css';

const InfractionForm: React.FC<InfractionFormProps> = ({ categories, onAddInfraction }) => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [customDescription, setCustomDescription] = useState<string>('');
  const [customPoints, setCustomPoints] = useState<number>(5);
  const [useCustom, setUseCustom] = useState<boolean>(false);
  const [isPositive, setIsPositive] = useState<boolean>(false);
  const [saveAsPredefined, setSaveAsPredefined] = useState<boolean>(false);

  const [localCategories, setLocalCategories] = useState<InfractionCategory[]>(categories);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const initialCategories = await getInfractionCategories();
        setLocalCategories(initialCategories);
        console.log('Categorias carregadas ao iniciar:', initialCategories);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    fetchCategories();
  }, []);

  const updateCategories = async () => {
    try {
      const updatedCategories = await getInfractionCategories();
      setLocalCategories(updatedCategories);
      console.log('Categorias atualizadas:', updatedCategories);
    } catch (error) {
      console.error('Erro ao atualizar categorias:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (useCustom) {
      if (customDescription.trim() && customPoints > 0) {
        const points = isPositive ? customPoints : -customPoints;
        await onAddInfraction(customDescription.trim(), points, saveAsPredefined, null);
        await updateCategories();
        setCustomDescription('');
        setCustomPoints(5);
        setIsPositive(false);
        setSaveAsPredefined(false);
      }
    } else {
      if (selectedCategory !== null) {
        const category = localCategories.find(cat => cat.id === selectedCategory);
        if (category) {
          await onAddInfraction(category.description, category.pointsDeduction, false, selectedCategory);
          setSelectedCategory(null);
        }
      }
    }
  };

  return (
    <div className="infraction-form">
      <h3>Registrar Comportamento</h3>

      <div className="form-toggle" style={{
        marginBottom: '10px',
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
              value={selectedCategory ?? ''}
              onChange={(e) => setSelectedCategory(Number(e.target.value))}
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
              {localCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.pointsDeduction} pontos)
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="custom-infraction">
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="description">Descrição do comportamento:</label>
              <input
                id="description"
                type="text"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Ex: Ajudou um colega com a lição de casa"
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={isPositive}
                  onChange={(e) => setIsPositive(e.target.checked)}
                />
                {' '}É um comportamento positivo?
              </label>
            </div>

            <div>
              <label htmlFor="points">{isPositive ? 'Pontos a acrescentar:' : 'Pontos a deduzir:'}</label>
              <input
                id="points"
                type="number"
                min="1"
                max="20"
                value={customPoints}
                onChange={(e) => setCustomPoints(Number(e.target.value))}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>

            <div style={{ marginBottom: '10px', marginTop: '10px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={saveAsPredefined}
                  onChange={(e) => setSaveAsPredefined(e.target.checked)}
                />
                {' '}Salvar como pré-definido?
              </label>
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
              marginTop: '10px',
              cursor: 'pointer'
            }}
          >
            Registrar Comportamento
          </button>
        </div>
      </form>
    </div>
  );
};

export default InfractionForm;