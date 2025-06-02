import React, { useEffect, useState } from 'react';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import { rewardService } from '../services/rewardService';
import { userService } from '../services/userService';
import { RewardRedemption, User } from '../types';
import './RewardsPage/RewardsPage.css';
import { FaHistory } from 'react-icons/fa';

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
          <div className="rewards-container" style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ marginBottom: 24, fontWeight: 700, fontSize: 28 }}>Histórico de Resgates de Recompensas</h2>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: 24, marginBottom: 32 }}>
              <form
                className="redemptions-filters-grid"
                onSubmit={handleFilter}
              >
                <select
                  name="userId"
                  value={filters.userId}
                  onChange={handleInputChange}
                  style={{ width: '100%', borderRadius: 8, border: '1px solid #ccc', padding: '8px 12px', fontSize: 16 }}
                >
                  <option value="">Todos Usuários</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
                    name="rewardTitle"
                    placeholder="Nome da Recompensa"
                    value={filters.rewardTitle || ''}
                    onChange={handleRewardInputChange}
                    autoComplete="off"
                    style={{ width: '100%', borderRadius: 8, border: '1px solid #ccc', padding: '8px 12px', fontSize: 16 }}
                    onFocus={() => setShowRewardSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowRewardSuggestions(false), 150)}
                  />
                  {showRewardSuggestions && filters.rewardTitle && (
                    <div style={{ position: 'absolute', top: 40, left: 0, right: 0, background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', zIndex: 10, maxHeight: 180, overflowY: 'auto' }}>
                      {rewardOptions.filter(title => title.toLowerCase().includes(filters.rewardTitle.toLowerCase())).length === 0 ? (
                        <div style={{ padding: 10, color: '#888' }}>Nenhuma recompensa encontrada</div>
                      ) : (
                        rewardOptions.filter(title => title.toLowerCase().includes(filters.rewardTitle.toLowerCase())).map(title => (
                          <div key={title} style={{ padding: 10, cursor: 'pointer' }} onMouseDown={() => handleRewardSuggestionClick(title)}>
                            {title}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <select name="status" value={filters.status} onChange={handleInputChange} style={{ width: '100%', borderRadius: 8, border: '1px solid #ccc', padding: '8px 12px', fontSize: 16 }}>
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
                  style={{ width: '100%', borderRadius: 8, border: '1px solid #ccc', padding: '8px 12px', fontSize: 16 }}
                />
                <button type="submit" style={{ width: '100%', padding: '10px 0', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)' }}>
                  Filtrar
                </button>
              </form>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: 0, minHeight: 220 }}>
              {isLoading ? (
                <p style={{ padding: 32 }}>Carregando...</p>
              ) : error ? (
                <p className="error-message" style={{ padding: 32 }}>{error}</p>
              ) : redemptions.length === 0 ? (
                <div className="empty-rewards-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220, padding: 32 }}>
                  <FaHistory size={64} color="#bdbdbd" style={{ marginBottom: 16 }} />
                  <h3 style={{ color: '#888', fontWeight: 500 }}>Nenhum resgate de recompensa encontrado.</h3>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="rewards-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: 16 }}>
                    <thead>
                      <tr style={{ background: '#f5f7fa' }}>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 700, fontSize: 16, borderTopLeftRadius: 16 }}>ID</th>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 700, fontSize: 16 }}>Usuário</th>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 700, fontSize: 16 }}>Recompensa</th>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 700, fontSize: 16 }}>Pontos</th>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 700, fontSize: 16 }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 700, fontSize: 16 }}>Data do Resgate</th>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 700, fontSize: 16, borderTopRightRadius: 16 }}>Data de Entrega</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redemptions.map((r, idx) => (
                        <tr key={r.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc', transition: 'background 0.2s' }}>
                          <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{r.id}</td>
                          <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{r.userName}</td>
                          <td style={{ padding: '12px 16px', verticalAlign: 'middle', display: 'flex', alignItems: 'center' }}>
                            {r.rewardImage && (
                              <img src={r.rewardImage} alt={r.rewardTitle} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6, marginRight: 8, verticalAlign: 'middle', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }} />
                            )}
                            {r.rewardTitle}
                          </td>
                          <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{r.pointsSpent}</td>
                          <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{statusLabels[r.status] || r.status}</td>
                          <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{new Date(r.redemptionDate).toLocaleString('pt-BR')}</td>
                          <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{r.deliveryDate ? new Date(r.deliveryDate).toLocaleString('pt-BR') : '-'}</td>
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