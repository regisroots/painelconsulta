import { useState, useEffect } from 'react';
import { User, Modulo } from '../../types';
import Layout from '../Layout';
import { moduloAPI, uploadAPI } from '../../services/api';
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
  Power,
  Plus,
  Trash2,
  Globe,
  Upload
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
  const [editingTimeout, setEditingTimeout] = useState<number | null>(null);
  const [tempTimeout, setTempTimeout] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Modulo | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState<number | null>(null);
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
    if (user.tipo !== 'admin') {
      alert('Apenas administradores podem editar módulos');
      return;
    }
    setEditingModule(modulo);
  };

  const handleSaveModule = async () => {
    if (!editingModule) return;
    
    try {
      await moduloAPI.update(editingModule.id, {
        nome: editingModule.nome,
        descricao: editingModule.descricao,
        api_url: editingModule.api_url,
        tipo_limite: editingModule.tipo_limite,
        preco_por_consulta: editingModule.preco_por_consulta,
        timeout_segundos: editingModule.timeout_segundos
      });
      setEditingModule(null);
      loadModulos();
      alert('Módulo atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar módulo:', error);
      alert('Erro ao salvar módulo');
    }
  };

  const handleIconUpload = async (moduleId: number, file: File) => {
    if (user.tipo !== 'admin') {
      alert('Apenas administradores podem alterar ícones');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    try {
      setUploadingIcon(moduleId);
      const response = await uploadAPI.uploadModuleImage(file);
      
      await moduloAPI.update(moduleId, { icone: response.filename });
      loadModulos();
      alert('Ícone atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload do ícone:', error);
      alert('Erro ao fazer upload do ícone');
    } finally {
      setUploadingIcon(null);
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
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">API URL</th>
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
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600 max-w-32 truncate">
                            {modulo.api_url || 'Não configurado'}
                          </span>
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
                        <div className="flex items-center justify-center space-x-2">
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

                          {user.tipo === 'admin' && (
                            <>
                              <button
                                onClick={() => handleEditModule(modulo)}
                                className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Editar</span>
                              </button>
                              
                              <label className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleIconUpload(modulo.id, file);
                                  }}
                                  disabled={uploadingIcon === modulo.id}
                                />
                                {uploadingIcon === modulo.id ? (
                                  <>
                                    <div className="w-3 h-3 border border-orange-700 border-t-transparent rounded-full animate-spin" />
                                    <span>Enviando...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-3 h-3" />
                                    <span>Ícone</span>
                                  </>
                                )}
                              </label>
                            </>
                          )}
                          
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

        {/* Module Editing Modal */}
        {editingModule && user.tipo === 'admin' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Editar Módulo - {editingModule.nome}
                </h3>
                <button
                  onClick={() => setEditingModule(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Módulo
                    </label>
                    <input
                      type="text"
                      value={editingModule.nome}
                      onChange={(e) => setEditingModule({ ...editingModule, nome: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Limite
                    </label>
                    <select
                      value={editingModule.tipo_limite}
                      onChange={(e) => setEditingModule({ ...editingModule, tipo_limite: e.target.value as 'creditos' | 'quantidade' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="creditos">Créditos</option>
                      <option value="quantidade">Quantidade</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={editingModule.descricao}
                    onChange={(e) => setEditingModule({ ...editingModule, descricao: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL da API
                  </label>
                  <input
                    type="url"
                    value={editingModule.api_url}
                    onChange={(e) => setEditingModule({ ...editingModule, api_url: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://api.exemplo.com/consulta/{parametro}"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço por Consulta
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingModule.preco_por_consulta}
                      onChange={(e) => setEditingModule({ ...editingModule, preco_por_consulta: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeout (segundos)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={editingModule.timeout_segundos}
                      onChange={(e) => setEditingModule({ ...editingModule, timeout_segundos: parseInt(e.target.value) || 30 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => setEditingModule(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveModule}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </div>
          </div>
        )}
    </Layout>
  );
}
