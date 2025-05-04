import React, { useState } from 'react';
import { InfractionCategory } from '../types';

interface InfractionFormProps {
  categories: InfractionCategory[];
  onAddInfraction: (
    description: string,
    points: number,
    saveAsPredefined: boolean,
    behaviorTypeId: number | null // Adicionado o quarto parâmetro
  ) => void;
}

const InfractionForm: React.FC<InfractionFormProps> = ({ categories, onAddInfraction }) => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null); // Para categorias pré-definidas
  const [customDescription, setCustomDescription] = useState<string>(''); // Para descrição personalizada
  const [customPoints, setCustomPoints] = useState<number>(5); // Para pontos personalizados
  const [useCustom, setUseCustom] = useState<boolean>(false); // Alterna entre pré-definido e personalizado
  const [isPositive, setIsPositive] = useState<boolean>(false); // Define se é comportamento positivo ou negativo
  const [saveAsPredefined, setSaveAsPredefined] = useState<boolean>(false); // Define se o comportamento será salvo como pré-definido

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (useCustom) {
      // Comportamento Personalizado
      if (customDescription.trim() && customPoints > 0) {
        const points = isPositive ? customPoints : -customPoints; // Ajusta o sinal dos pontos
        onAddInfraction(customDescription.trim(), points, saveAsPredefined, null); // Passa null para behaviorTypeId
        setCustomDescription('');
        setCustomPoints(5);
        setIsPositive(false); // Reseta para comportamento negativo por padrão
        setSaveAsPredefined(false); // Reseta o estado do checkbox
      }
    } else {
      // Comportamento Pré-definido
      if (selectedCategory !== null) {
        const category = categories.find(cat => cat.id === selectedCategory);
        if (category) {
          onAddInfraction(category.description, category.pointsDeduction, false, selectedCategory); // Passa o ID da categoria
          setSelectedCategory(null); // Reseta o estado para nenhum selecionado
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
          // Comportamento Pré-definido
          <div className="category-selector">
            <label htmlFor="category-select">Selecione a categoria:</label>
            <select
              id="category-select"
              value={selectedCategory ?? ''} // Usa uma string vazia se selectedCategory for null
              onChange={(e) => setSelectedCategory(Number(e.target.value))} // Converte para número
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
                  {category.name} ({category.pointsDeduction} pontos)
                </option>
              ))}
            </select>
          </div>
        ) : (
          // Comportamento Personalizado
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
                  onChange={(e) => setIsPositive(e.target.checked)} // Alterna entre positivo e negativo
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
                  onChange={(e) => setSaveAsPredefined(e.target.checked)} // Alterna entre salvar ou não como pré-definido
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