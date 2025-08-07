import { useState, useEffect } from 'react';
import { User, Modulo } from '../../types';
import Layout from '../Layout';
import { moduloAPI } from '../../services/api';
import { 
  Database, 
  Settings, 
  Clock, 
  Edit3, 
  X,
  AlertCircle,
  CheckCircle,
  Wrench,
  Power,
  Plus,
  Trash2
} from 'lucide-react';

interface AdminModulesProps {
  user: User;
  onLogout: () => void;
}

interface CreateModuleForm {
  nome: string;
  descricao: string;
  api_url: string;
  tipo_limite: 'creditos' | 'quantidade';
  preco_por_consulta: number;
  timeout_segundos: number;
  ativo: boolean;
}

export default function AdminModules({ user, onLogout }: AdminModulesProps) {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Modulo | null>(null);
  const [editForm, setEditForm] = useState<{
    nome: string;
    descricao: string;
    api_url: string;
    tipo_limite: 'creditos' | 'quantidade';
    preco_por_consulta: number;
    timeout_segundos: number;
    ativo: boolean;
    manutencao: boolean;
    limite_padrao_quantidade: number;
  }>({
    nome: '',
    descricao: '',
    api_url: '',
    tipo_limite: 'creditos',
    preco_por_consulta: 1,
    timeout_segundos: 30,
    ativo: true,
    manutencao: false,
    limite_padrao_quantidade: 1000
  });
  const [createForm, setCreateForm] = useState<CreateModuleForm>({
    nome: '',
    descricao: '',
    api_url: '',
    tipo_limite: 'creditos',
    preco_por_consulta: 1,
    timeout_segundos: 30,
    ativo: true
  });

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

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await moduloAPI.create(createForm);
      setShowCreateForm(false);
      setCreateForm({
        nome: '',
        descricao: '',
        api_url: '',
        tipo_limite: 'creditos',
        preco_por_consulta: 1,
        timeout_segundos: 30,
        ativo: true
      });
      loadModulos();
    } catch (error) {
      console.error('Erro ao criar módulo:', error);
      alert('Erro ao criar módulo');
    }
  };


  const handleDeleteModule = async (moduloId: number) => {
    if (confirm('Tem certeza que deseja deletar este módulo?')) {
      try {
        await moduloAPI.delete(moduloId);
        loadModulos();
      } catch (error) {
        console.error('Erro ao deletar módulo:', error);
        alert('Erro ao deletar módulo');
      }
    }
  };

  const handleEditModule = (modulo: Modulo) => {
    setEditingModule(modulo);
    setEditForm({
      nome: modulo.nome,
      descricao: modulo.descricao || '',
      api_url: modulo.api_url,
      tipo_limite: modulo.tipo_limite,
      preco_por_consulta: modulo.preco_por_consulta || 1,
      timeout_segundos: modulo.timeout_segundos || 30,
      ativo: modulo.ativo,
      manutencao: modulo.manutencao || false,
      limite_padrao_quantidade: (modulo as any).limite_padrao_quantidade || 1000
    });
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;
    
    try {
      await moduloAPI.update(editingModule.id, editForm);
      setEditingModule(null);
      loadModulos();
    } catch (error) {
      console.error('Erro ao atualizar módulo:', error);
      alert('Erro ao atualizar módulo');
    }
  };

  const handleCancelEdit = () => {
    setEditingModule(null);
    setEditForm({
      nome: '',
      descricao: '',
      api_url: '',
      tipo_limite: 'creditos',
      preco_por_consulta: 1,
      timeout_segundos: 30,
      ativo: true,
      manutencao: false,
      limite_padrao_quantidade: 1000
    });
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
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Módulos Disponíveis</h2>
              <p className="text-gray-600 mt-1">{modulos.length} módulos configurados</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Módulo</span>
            </button>
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Criar Novo Módulo</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateModule} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={createForm.nome}
                  onChange={(e) => setCreateForm({ ...createForm, nome: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <input
                  type="text"
                  value={createForm.descricao}
                  onChange={(e) => setCreateForm({ ...createForm, descricao: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">URL da API</label>
                <input
                  type="url"
                  value={createForm.api_url}
                  onChange={(e) => setCreateForm({ ...createForm, api_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="https://api.exemplo.com/consulta"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Limite</label>
                <select
                  value={createForm.tipo_limite}
                  onChange={(e) => setCreateForm({ ...createForm, tipo_limite: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="creditos">Por Créditos</option>
                  <option value="quantidade">Por Quantidade</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preço por Consulta</label>
                <input
                  type="number"
                  value={createForm.preco_por_consulta}
                  onChange={(e) => setCreateForm({ ...createForm, preco_por_consulta: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeout (segundos)</label>
                <input
                  type="number"
                  value={createForm.timeout_segundos}
                  onChange={(e) => setCreateForm({ ...createForm, timeout_segundos: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  min="5"
                  max="300"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={createForm.ativo}
                  onChange={(e) => setCreateForm({ ...createForm, ativo: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="ativo" className="ml-2 text-sm font-medium text-gray-700">
                  Módulo ativo
                </label>
              </div>
              
              <div className="md:col-span-2 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Criar Módulo
                </button>
              </div>
            </form>
          </div>
        )}

        {editingModule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Editar Módulo: {editingModule.nome}</h3>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSaveModule} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Módulo</label>
                  <input
                    type="text"
                    value={editForm.nome}
                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <input
                    type="text"
                    value={editForm.descricao}
                    onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL da API</label>
                  <input
                    type="url"
                    value={editForm.api_url}
                    onChange={(e) => setEditForm({ ...editForm, api_url: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://api.exemplo.com/consulta"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Limite</label>
                  <select
                    value={editForm.tipo_limite}
                    onChange={(e) => setEditForm({ ...editForm, tipo_limite: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="creditos">Por Créditos</option>
                    <option value="quantidade">Por Quantidade</option>
                  </select>
                </div>
                
                {editForm.tipo_limite === 'quantidade' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Limite Padrão de Quantidade</label>
                    <input
                      type="number"
                      value={editForm.limite_padrao_quantidade}
                      onChange={(e) => setEditForm({ ...editForm, limite_padrao_quantidade: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      min="1"
                      placeholder="1000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Limite padrão aplicado a novos usuários</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preço por Consulta</label>
                  <input
                    type="number"
                    value={editForm.preco_por_consulta}
                    onChange={(e) => setEditForm({ ...editForm, preco_por_consulta: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timeout (segundos)</label>
                  <input
                    type="number"
                    value={editForm.timeout_segundos}
                    onChange={(e) => setEditForm({ ...editForm, timeout_segundos: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    min="5"
                    max="300"
                  />
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit-ativo"
                      checked={editForm.ativo}
                      onChange={(e) => setEditForm({ ...editForm, ativo: e.target.checked })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="edit-ativo" className="ml-2 text-sm font-medium text-gray-700">
                      Módulo ativo
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit-manutencao"
                      checked={editForm.manutencao}
                      onChange={(e) => setEditForm({ ...editForm, manutencao: e.target.checked })}
                      className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <label htmlFor="edit-manutencao" className="ml-2 text-sm font-medium text-gray-700">
                      Em manutenção
                    </label>
                  </div>
                </div>
                
                <div className="md:col-span-2 flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Lista de Módulos</h3>
                  <p className="text-gray-600 mt-1">Gerencie configurações e status</p>
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
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Tipo de Limite</th>
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
                        <div className="flex items-center justify-center space-x-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            modulo.tipo_limite === 'quantidade' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {modulo.tipo_limite === 'quantidade' ? 'Por Quantidade' : 'Por Créditos'}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6 text-center">
                        <div className="space-y-2">
                          {getStatusBadge(modulo)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {modulo.timeout_segundos || 30}s
                          </span>
                        </div>
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
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEditModule(modulo)}
                            className="flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                          
                          <button
                            onClick={() => handleStatusToggle(modulo.id, 'ativo', modulo.ativo)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
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
                            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                              modulo.manutencao 
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Settings className="w-3 h-3" />
                            <span>{modulo.manutencao ? 'Manutenção' : 'Normal'}</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteModule(modulo.id)}
                            className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Deletar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </Layout>
  );
}
