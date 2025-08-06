import { useState, useEffect } from 'react';
import { User, Modulo } from '../../types';
import Layout from '../Layout';
import { moduloAPI } from '../../services/api';
import { 
  Database, 
  Settings, 
  Clock, 
  Edit3, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle,
  Wrench,
  Power
} from 'lucide-react';

interface AdminModulesProps {
  user: User;
  onLogout: () => void;
}

export default function AdminModules({ user, onLogout }: AdminModulesProps) {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTimeout, setEditingTimeout] = useState<number | null>(null);
  const [tempTimeout, setTempTimeout] = useState<string>('');

  useEffect(() => {
    loadModulos();
  }, []);

  const loadModulos = async () => {
    try {
      const response = await moduloAPI.getAll();
      const modulosArray = response.modulos || [];
      setModulos(modulosArray);
    } catch (error) {
      console.error('Erro ao carregar módulos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeoutEdit = (modulo: Modulo) => {
    setEditingTimeout(modulo.id);
    setTempTimeout(String(modulo.timeout_segundos || 30));
  };

  const handleTimeoutSave = async (moduloId: number) => {
    try {
      const timeoutValue = parseInt(tempTimeout);
      if (isNaN(timeoutValue) || timeoutValue < 5 || timeoutValue > 300) {
        alert('Timeout deve ser entre 5 e 300 segundos');
        return;
      }

      await moduloAPI.updateTimeout(moduloId, timeoutValue);
      setEditingTimeout(null);
      loadModulos();
    } catch (error) {
      console.error('Erro ao atualizar timeout:', error);
      alert('Erro ao atualizar timeout');
    }
  };

  const handleTimeoutCancel = () => {
    setEditingTimeout(null);
    setTempTimeout('');
  };

  const handleStatusToggle = async (moduloId: number, field: 'ativo' | 'manutencao', currentValue: boolean) => {
    try {
      const updateData = { [field]: !currentValue };
      await moduloAPI.updateStatus(moduloId, updateData);
      loadModulos();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const getStatusBadge = (modulo: Modulo) => {
    if (!modulo.ativo) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Inativo
        </span>
      );
    }
    if (modulo.manutencao) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          <Wrench className="w-3 h-3 mr-1" />
          Manutenção
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Online
      </span>
    );
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gerenciamento de Módulos</h1>
              <p className="text-purple-100 text-lg">
                Configure timeouts, status e parâmetros dos módulos de consulta
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Database className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="ml-4 text-gray-600 text-lg">Carregando módulos...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Módulos Disponíveis</h2>
                  <p className="text-gray-600 mt-1">{modulos.length} módulos configurados</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Sistema Online</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900">Módulo</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Timeout</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Preço</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {modulos.map((modulo) => (
                    <tr key={modulo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Database className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{modulo.nome}</h3>
                            <p className="text-sm text-gray-600">{modulo.descricao}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6 text-center">
                        <div className="space-y-2">
                          {getStatusBadge(modulo)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-6 text-center">
                        {editingTimeout === modulo.id ? (
                          <div className="flex items-center justify-center space-x-2">
                            <input
                              type="number"
                              min="5"
                              max="300"
                              value={tempTimeout}
                              onChange={(e) => setTempTimeout(e.target.value)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="text-xs text-gray-500">s</span>
                            <button
                              onClick={() => handleTimeoutSave(modulo.id)}
                              className="p-1 text-green-600 hover:text-green-800 transition-colors"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleTimeoutCancel}
                              className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {modulo.timeout_segundos || 30}s
                            </span>
                            <button
                              onClick={() => handleTimeoutEdit(modulo)}
                              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-6 text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {modulo.tipo_limite === 'creditos' 
                            ? `${parseFloat(String(modulo.preco_por_consulta || 0)).toFixed(0)} créditos`
                            : 'Gratuito'
                          }
                        </div>
                      </td>
                      
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => handleStatusToggle(modulo.id, 'ativo', modulo.ativo)}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                              modulo.ativo 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            <Power className="w-3 h-3" />
                            <span>{modulo.ativo ? 'Ativo' : 'Inativo'}</span>
                          </button>
                          
                          <button
                            onClick={() => handleStatusToggle(modulo.id, 'manutencao', modulo.manutencao)}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                              modulo.manutencao 
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Settings className="w-3 h-3" />
                            <span>{modulo.manutencao ? 'Manutenção' : 'Normal'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
