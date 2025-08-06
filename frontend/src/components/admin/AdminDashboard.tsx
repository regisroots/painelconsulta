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

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setStats({
        totalUsers: 15,
        totalModules: 5,
        totalConsultations: 1247,
        activeUsers: 8,
        todayConsultations: 23,
        systemUptime: '15d 8h 32m'
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
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
            <h3 className="text-xl font-bold text-gray-900 mb-6">Atividade Recente</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Novo usuário registrado
                  </p>
                  <p className="text-xs text-gray-500">há 2 minutos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Consulta CPF realizada
                  </p>
                  <p className="text-xs text-gray-500">há 5 minutos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Módulo atualizado
                  </p>
                  <p className="text-xs text-gray-500">há 15 minutos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Créditos adicionados
                  </p>
                  <p className="text-xs text-gray-500">há 1 hora</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
