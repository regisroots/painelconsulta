import { useState, useEffect } from 'react';
import { User } from '../../types';
import Layout from '../Layout';

interface AdminLogsProps {
  user: User;
  onLogout: () => void;
}

interface LogEntry {
  id: number;
  tipo: string;
  acao: string;
  detalhes: any;
  createdAt: string;
  User: {
    nome: string;
    email: string;
    tipo: string;
  };
}

export default function AdminLogs({ user, onLogout }: AdminLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/logs' + (filter !== 'all' ? `?tipo=${filter}` : ''), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getActionColor = (tipo: string) => {
    switch (tipo) {
      case 'admin_action': return 'bg-red-100 text-red-800';
      case 'revendedor_action': return 'bg-blue-100 text-blue-800';
      case 'consulta': return 'bg-green-100 text-green-800';
      case 'login': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Logs do Sistema
          </h1>
          <p className="text-gray-600 mb-6">
            Monitoramento completo de todas as ações realizadas no sistema
          </p>

          <div className="mb-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">Todos os logs</option>
              <option value="admin_action">Ações de Admin</option>
              <option value="revendedor_action">Ações de Revendedor</option>
              <option value="consulta">Consultas</option>
              <option value="login">Logins</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detalhes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{log.User?.nome}</div>
                          <div className="text-gray-500">{log.User?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.tipo)}`}>
                          {log.tipo.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.acao}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <pre className="text-xs bg-gray-100 p-2 rounded max-w-xs overflow-auto">
                          {JSON.stringify(log.detalhes, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
