import { useState, useEffect } from 'react';
import { User } from '../../types';
import Layout from '../Layout';
import { Users, Filter, TrendingUp, BarChart3, UserCheck } from 'lucide-react';
import { userAPI } from '../../services/api';

interface AdminMetricsProps {
  user: User;
  onLogout: () => void;
}

interface MetricsData {
  usersByReseller: Array<{
    revendedor_id: number;
    total_users: number;
    creation_date: string;
    revendedor: { id: number; nome: string; email: string } | null;
  }>;
  totalMetrics: {
    total_users: number;
    active_users: number;
    total_resellers: number;
  };
  dateRange: { startDate?: string; endDate?: string };
}

export default function AdminMetrics({ user, onLogout }: AdminMetricsProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedReseller, setSelectedReseller] = useState<number | ''>('');
  const [resellers, setResellers] = useState<User[]>([]);

  useEffect(() => {
    loadResellers();
    loadMetrics();
  }, []);

  const loadResellers = async () => {
    try {
      const response = await userAPI.getUsers();
      const resellerUsers = response.users.filter((u: User) => u.tipo === 'revendedor');
      setResellers(resellerUsers);
    } catch (error) {
      console.error('Erro ao carregar revendedores:', error);
    }
  };

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedReseller) params.revendedorId = selectedReseller;

      const data = await userAPI.getUserMetrics(params);
      setMetrics(data);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    loadMetrics();
  };

  const resellerMetrics = metrics?.usersByReseller.reduce((acc, item) => {
    const resellerId = item.revendedor_id || 0;
    const resellerName = item.revendedor?.nome || 'Usuários Diretos';
    
    if (!acc[resellerId]) {
      acc[resellerId] = {
        name: resellerName,
        totalUsers: 0,
        dailyCreations: []
      };
    }
    
    acc[resellerId].totalUsers += parseInt(item.total_users.toString());
    acc[resellerId].dailyCreations.push({
      date: item.creation_date,
      count: parseInt(item.total_users.toString())
    });
    
    return acc;
  }, {} as Record<number, { name: string; totalUsers: number; dailyCreations: Array<{ date: string; count: number }> }>);

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6 space-y-8">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Métricas de Usuários</h1>
              <p className="text-purple-100 text-lg">
                Acompanhamento completo de criação de usuários por revendedor
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            {user.tipo === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Revendedor
                </label>
                <select
                  value={selectedReseller}
                  onChange={(e) => setSelectedReseller(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Todos os revendedores</option>
                  {resellers.map((reseller) => (
                    <option key={reseller.id} value={reseller.id}>
                      {reseller.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex items-end">
              <button
                onClick={handleFilterChange}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="ml-4 text-gray-600 text-lg">Carregando métricas...</p>
          </div>
        ) : (
          <>
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total de Usuários</p>
                      <p className="text-3xl font-bold text-gray-900">{metrics.totalMetrics.total_users}</p>
                    </div>
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Usuários Ativos</p>
                      <p className="text-3xl font-bold text-gray-900">{metrics.totalMetrics.active_users}</p>
                    </div>
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                      <UserCheck className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Revendedores</p>
                      <p className="text-3xl font-bold text-gray-900">{metrics.totalMetrics.total_resellers}</p>
                    </div>
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {resellerMetrics && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Usuários por Revendedor</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Revendedor</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Total de Usuários</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Criações Recentes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(resellerMetrics).map(([resellerId, data]) => (
                        <tr key={resellerId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{data.name}</td>
                          <td className="py-3 px-4 text-gray-700">{data.totalUsers}</td>
                          <td className="py-3 px-4 text-gray-700">
                            {data.dailyCreations.slice(0, 3).map((creation, idx) => (
                              <div key={idx} className="text-sm">
                                {creation.date}: {creation.count} usuários
                              </div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
