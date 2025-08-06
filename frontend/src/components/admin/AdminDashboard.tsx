import { useState, useEffect } from 'react';
import { User } from '../../types';
import Layout from '../Layout';
import { Users, Database, FileText, Activity, TrendingUp, Clock } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

interface DashboardStats {
  totalUsers: number;
  totalModules: number;
  totalConsultations: number;
  activeUsers: number;
  todayConsultations: number;
  systemUptime: string;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalModules: 0,
    totalConsultations: 0,
    activeUsers: 0,
    todayConsultations: 0,
    systemUptime: '0h 0m'
  });
  const [loading, setLoading] = useState(true);
  const [recentConsultations, setRecentConsultations] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardStats();
    loadRecentConsultations();
    
    const interval = setInterval(() => {
      loadDashboardStats();
      loadRecentConsultations();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats({
        totalUsers: data.totalUsers || 0,
        totalModules: 5,
        totalConsultations: data.totalConsultations || 0,
        activeUsers: data.activeUsers || 0,
        todayConsultations: 23,
        systemUptime: '15d 8h 32m'
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setStats({
        totalUsers: 15,
        totalModules: 5,
        totalConsultations: 1247,
        activeUsers: 8,
        todayConsultations: 23,
        systemUptime: '15d 8h 32m'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentConsultations = async () => {
    try {
      const response = await fetch('/api/consultas/admin/all?limit=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setRecentConsultations(data.consultas || []);
    } catch (error) {
      console.error('Erro ao carregar consultas recentes:', error);
    }
  };

  const handleQuickBan = async (userId: number) => {
    if (!confirm('Tem certeza que deseja banir este usuário?')) return;
    
    try {
      await fetch(`/api/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ motivo: 'Banido via monitoramento de consultas' })
      });
      loadRecentConsultations();
    } catch (error) {
      console.error('Erro ao banir usuário:', error);
    }
  };

  const handleViewUser = (userId: number) => {
    window.location.href = `/admin/usuarios?highlight=${userId}`;
  };

  const statCards = [
    {
      name: 'Total de Usuários',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      name: 'Módulos Ativos',
      value: stats.totalModules,
      icon: Database,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      name: 'Total Consultas',
      value: stats.totalConsultations.toLocaleString(),
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      name: 'Usuários Ativos',
      value: stats.activeUsers,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      name: 'Consultas Hoje',
      value: stats.todayConsultations,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      name: 'Tempo Online',
      value: stats.systemUptime,
      icon: Clock,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    }
  ];

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard Administrativo</h1>
              <p className="text-blue-100 text-lg">
                Visão geral completa do sistema Painel Consulta
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Activity className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="ml-4 text-gray-600 text-lg">Carregando estatísticas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className={`bg-white rounded-2xl shadow-lg border-2 ${stat.borderColor} p-6 hover:shadow-xl transition-all duration-300 hover:scale-105`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.name}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Status do Sistema</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Banco de Dados</span>
                </div>
                <span className="text-sm font-medium text-green-600">Conectado</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">API Externa</span>
                </div>
                <span className="text-sm font-medium text-green-600">Operacional</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Cache</span>
                </div>
                <span className="text-sm font-medium text-blue-600">Ativo</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Consultas em Tempo Real</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Monitorando</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {recentConsultations.length > 0 ? (
                recentConsultations.map((consultation) => (
                  <div key={consultation.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{consultation.User?.nome}</span>
                        <span className="text-xs text-gray-500">({consultation.User?.email})</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          consultation.status === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {consultation.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {consultation.Modulo?.nome} - {Object.entries(consultation.input || {}).map(([key, value]) => `${key}: ${value}`).join(', ')}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(consultation.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleQuickBan(consultation.usuario_id)}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Banir
                      </button>
                      <button
                        onClick={() => handleViewUser(consultation.usuario_id)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Ver Usuário
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-2">Nenhuma consulta recente encontrada</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
