import React, { useEffect, useState } from 'react';
import './RewardRedemptionsPage.css';
import { FaHistory } from 'react-icons/fa';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import { rewardService } from '../../services/rewardService';
import { userService } from '../../services/userService';
import { RewardRedemption, User } from '../../types';

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  COMPLETED: 'Entregue',
  CANCELED: 'Cancelado',
};

const RewardRedemptionsPage: React.FC = () => {
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({
    userId: '',
    status: '',
    rewardTitle: '',
    month: '', // yyyy-MM
  });
  const [rewardOptions, setRewardOptions] = useState<string[]>([]);
  const [showRewardSuggestions, setShowRewardSuggestions] = useState(false);
  const [rewards, setRewards] = useState<{ id: number; title: string }[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchRedemptions();
    fetchRewardOptions();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data.filter((u) => u.role === 'USER'));
    } catch (e) {
      // Silenciar erro
    }
  };

  const fetchRewardOptions = async () => {
    try {
      const rewardsData = await rewardService.getAllRewards();
      setRewards(rewardsData.map((r: any) => ({ id: r.id, title: r.title })));
      setRewardOptions(rewardsData.map((r: any) => r.title));
    } catch (e) {}
  };

  const fetchRedemptions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let startDate, endDate;
      if (filters.month) {
        const [year, month] = filters.month.split('-');
        startDate = `${year}-${month}-01T00:00:00`;
        const lastDay = new Date(Number(year), Number(month), 0).getDate();
        endDate = `${year}-${month}-${lastDay}T23:59:59`;
      }
      let rewardId: number | undefined = undefined;
      if (filters.rewardTitle) {
        const found = rewards.find(r => r.title.toLowerCase() === filters.rewardTitle.toLowerCase());
        if (found) rewardId = found.id;
      }
      const data = await rewardService.getRewardRedemptions({
        userId: filters.userId ? Number(filters.userId) : undefined,
        rewardId,
        status: filters.status || undefined,
        startDate,
        endDate,
      });
      setRedemptions(data);
    } catch (e) {
      setError('Erro ao buscar histórico de resgates.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleRewardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, rewardTitle: e.target.value });
    setShowRewardSuggestions(true);
  };

  const handleRewardSuggestionClick = (title: string) => {
    setFilters({ ...filters, rewardTitle: title });
    setShowRewardSuggestions(false);
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRedemptions();
  };

  return (
    <div className="RewardsPage">
      <Header projectName="Behavior Bar" userName="Administrador" onLogout={() => {}} pageName="Histórico de Resgates" />
      <div className="page-content">
        <Sidebar />
        <main className="main-content">
          <div className="rewards-container">
            <h2 className="rewards-title">Histórico de Resgates de Recompensas</h2>
            <div className="rewards-filters-box">
              <form
                className="redemptions-filters-grid"
                onSubmit={handleFilter}
              >
                <select
                  name="userId"
                  value={filters.userId}
                  onChange={handleInputChange}
                  className="input-default"
                >
                  <option value="">Todos Usuários</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <div className="reward-input-wrapper">
                  <input
                    type="text"
                    name="rewardTitle"
                    placeholder="Nome da Recompensa"
                    value={filters.rewardTitle || ''}
                    onChange={handleRewardInputChange}
                    autoComplete="off"
                    className="input-default"
                    onFocus={() => setShowRewardSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowRewardSuggestions(false), 150)}
                  />
                  {showRewardSuggestions && filters.rewardTitle && (
                    <div className="reward-suggestions">
                      {rewardOptions.filter(title => title.toLowerCase().includes(filters.rewardTitle.toLowerCase())).length === 0 ? (
                        <div className="reward-suggestion-empty">Nenhuma recompensa encontrada</div>
                      ) : (
                        rewardOptions.filter(title => title.toLowerCase().includes(filters.rewardTitle.toLowerCase())).map(title => (
                          <div key={title} className="reward-suggestion-item" onMouseDown={() => handleRewardSuggestionClick(title)}>
                            {title}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <select name="status" value={filters.status} onChange={handleInputChange} className="input-default">
                  <option value="">Todos Status</option>
                  <option value="PENDING">Pendente</option>
                  <option value="COMPLETED">Entregue</option>
                  <option value="CANCELED">Cancelado</option>
                </select>
                <input
                  type="month"
                  name="month"
                  value={filters.month}
                  onChange={handleInputChange}
                  className="input-default"
                />
                <button type="submit" className="filter-btn">
                  Filtrar
                </button>
              </form>
            </div>
            <div className="rewards-table-box">
              {isLoading ? (
                <p className="rewards-loading">Carregando...</p>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : redemptions.length === 0 ? (
                <div className="empty-rewards-container">
                  <FaHistory size={64} color="#bdbdbd" className="empty-history-icon" />
                  <h3 className="empty-rewards-title">Nenhum resgate de recompensa encontrado.</h3>
                </div>
              ) : (
                <div className="rewards-table-scroll">
                  <table className="rewards-table">
                    <thead>
                      <tr className="rewards-table-header-row">
                        <th>ID</th>
                        <th>Usuário</th>
                        <th>Recompensa</th>
                        <th>Pontos</th>
                        <th>Status</th>
                        <th>Data do Resgate</th>
                        <th>Data de Entrega</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redemptions.map((r, idx) => (
                        <tr key={r.id} className={idx % 2 === 0 ? 'rewards-table-row-even' : 'rewards-table-row-odd'}>
                          <td>{r.id}</td>
                          <td>{r.userName}</td>
                          <td className="reward-title-cell">
                            {r.rewardImage && (
                              <img src={r.rewardImage} alt={r.rewardTitle} className="reward-image" />
                            )}
                            {r.rewardTitle}
                          </td>
                          <td>{r.pointsSpent}</td>
                          <td>{statusLabels[r.status] || r.status}</td>
                          <td>{new Date(r.redemptionDate).toLocaleString('pt-BR')}</td>
                          <td>{r.deliveryDate ? new Date(r.deliveryDate).toLocaleString('pt-BR') : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RewardRedemptionsPage;