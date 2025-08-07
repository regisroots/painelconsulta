import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import Layout from '../Layout';
import { userAPI } from '../../services/api';
import { 
  Users, 
  Plus, 
  X,
  AlertCircle,
  CheckCircle,
  Ban,
  UserCheck,
  Calendar,
  CreditCard,
  Shield,
  Clock,
  Minus,
  UserCog
} from 'lucide-react';

interface AdminUsersProps {
  user: User;
  onLogout: () => void;
}

interface UserData {
  id: number;
  nome: string;
  email: string;
  tipo: 'admin' | 'revendedor' | 'usuario';
  dias_ativos: number;
  data_criacao: string;
  data_expiracao: string | null;
  ativo: boolean;
  banido: boolean;
  motivo_banimento: string | null;
  creditos: number;
  modulos: Record<string, any>;
}

interface CreateUserForm {
  nome: string;
  email: string;
  senha: string;
  tipo: 'admin' | 'revendedor' | 'usuario';
  creditos: number;
  dias_ativos: number;
}

interface ModalState {
  show: boolean;
  type: 'credits' | 'days' | 'hours' | 'role' | 'ban' | null;
  userId: number | null;
  userName: string;
  action: 'add' | 'remove' | 'change' | null;
}

export default function AdminUsers({ user, onLogout }: AdminUsersProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    nome: '',
    email: '',
    senha: '',
    tipo: 'usuario',
    creditos: 0,
    dias_ativos: 30
  });
  const [modal, setModal] = useState<ModalState>({
    show: false,
    type: null,
    userId: null,
    userName: '',
    action: null
  });
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!showCreateForm && !loading && !modal.show) {
        loadUsers();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [showCreateForm, loading, modal.show]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userAPI.createUser(createForm);
      setShowCreateForm(false);
      setCreateForm({
        nome: '',
        email: '',
        senha: '',
        tipo: 'usuario',
        creditos: 0,
        dias_ativos: 30
      });
      loadUsers();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário');
    }
  };


  const handleUnbanUser = async (userId: number) => {
    try {
      await userAPI.unbanUser(userId);
      loadUsers();
    } catch (error) {
      console.error('Erro ao desbanir usuário:', error);
      alert('Erro ao desbanir usuário');
    }
  };

  const openModal = (type: ModalState['type'], userId: number, userName: string, action: ModalState['action'] = null) => {
    setModal({
      show: true,
      type,
      userId,
      userName,
      action
    });
    setInputValue('');
  };

  const closeModal = () => {
    setModal({
      show: false,
      type: null,
      userId: null,
      userName: '',
      action: null
    });
    setInputValue('');
  };

  const handleModalSubmit = async () => {
    if (!modal.userId || !inputValue) return;

    try {
      const amount = parseInt(inputValue);
      if (isNaN(amount) || amount <= 0) {
        alert('Por favor, insira um valor válido');
        return;
      }

      switch (modal.type) {
        case 'credits':
          if (modal.action === 'add') {
            await userAPI.addCredits(modal.userId, amount);
          } else {
            await userAPI.removeCredits(modal.userId, amount);
          }
          break;
        case 'days':
          if (modal.action === 'add') {
            await userAPI.addDays(modal.userId, amount);
          } else {
            await userAPI.removeDays(modal.userId, amount);
          }
          break;
        case 'hours':
          await userAPI.addHours(modal.userId, amount);
          break;
        case 'role':
          if (!['admin', 'revendedor', 'usuario'].includes(inputValue)) {
            alert('Role inválido');
            return;
          }
          await userAPI.changeUserRole(modal.userId, inputValue);
          break;
        case 'ban':
          if (!inputValue.trim()) {
            alert('Motivo do banimento é obrigatório');
            return;
          }
          await userAPI.banUser(modal.userId, inputValue);
          break;
      }

      closeModal();
      loadUsers();
    } catch (error) {
      console.error('Erro na operação:', error);
      alert('Erro ao executar operação');
    }
  };

  const getStatusBadge = (userData: UserData) => {
    if (userData.banido) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          <Ban className="w-3 h-3 mr-1" />
          Banido
        </span>
      );
    }
    if (!userData.ativo) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Inativo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Ativo
      </span>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      revendedor: 'bg-blue-100 text-blue-800',
      usuario: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[tipo as keyof typeof colors]}`}>
        <Shield className="w-3 h-3 mr-1" />
        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </span>
    );
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gerenciamento de Usuários</h1>
              <p className="text-blue-100 text-lg">
                Crie, edite e gerencie usuários do sistema
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Users className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Usuários do Sistema</h2>
            <p className="text-gray-600 mt-1">{filteredUsers.length} usuários {searchTerm ? 'encontrados' : 'cadastrados'}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Usuário</span>
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Criar Novo Usuário</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={createForm.nome}
                  onChange={(e) => setCreateForm({ ...createForm, nome: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <input
                  type="password"
                  value={createForm.senha}
                  onChange={(e) => setCreateForm({ ...createForm, senha: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={createForm.tipo}
                  onChange={(e) => setCreateForm({ ...createForm, tipo: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="usuario">Usuário</option>
                  <option value="revendedor">Revendedor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Créditos</label>
                <input
                  type="number"
                  value={createForm.creditos}
                  onChange={(e) => setCreateForm({ ...createForm, creditos: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dias Ativos</label>
                <input
                  type="number"
                  value={createForm.dias_ativos}
                  onChange={(e) => setCreateForm({ ...createForm, dias_ativos: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
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
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Criar Usuário
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="ml-4 text-gray-600 text-lg">Carregando usuários...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900">Usuário</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Tipo</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Créditos</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Criado em</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Expira em</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((userData) => (
                    <tr key={userData.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Users className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{userData.nome}</h3>
                            <p className="text-sm text-gray-600">{userData.email}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6 text-center">
                        {getTipoBadge(userData.tipo)}
                      </td>
                      
                      <td className="px-6 py-6 text-center">
                        {getStatusBadge(userData)}
                      </td>
                      
                      <td className="px-6 py-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {userData.creditos}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(userData.data_criacao).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {userData.data_expiracao ? new Date(userData.data_expiracao).toLocaleString('pt-BR') : 'Sem expiração'}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center space-x-1 flex-wrap gap-1">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => openModal('credits', userData.id, userData.nome, 'add')}
                              className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                              title="Adicionar Créditos"
                            >
                              <Plus className="w-3 h-3" />
                              <CreditCard className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => openModal('credits', userData.id, userData.nome, 'remove')}
                              className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                              title="Remover Créditos"
                            >
                              <Minus className="w-3 h-3" />
                              <CreditCard className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex space-x-1">
                            <button
                              onClick={() => openModal('days', userData.id, userData.nome, 'add')}
                              className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                              title="Adicionar Dias"
                            >
                              <Plus className="w-3 h-3" />
                              <Calendar className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => openModal('days', userData.id, userData.nome, 'remove')}
                              className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                              title="Remover Dias"
                            >
                              <Minus className="w-3 h-3" />
                              <Calendar className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => openModal('hours', userData.id, userData.nome, 'add')}
                            className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                            title="Adicionar Horas"
                          >
                            <Plus className="w-3 h-3" />
                            <Clock className="w-3 h-3" />
                          </button>

                          {user.tipo === 'admin' && (
                            <button
                              onClick={() => openModal('role', userData.id, userData.nome, 'change')}
                              className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                              title="Alterar Role"
                            >
                              <UserCog className="w-3 h-3" />
                            </button>
                          )}
                          
                          {!userData.banido ? (
                            <button
                              onClick={() => openModal('ban', userData.id, userData.nome)}
                              className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                              title="Banir Usuário"
                            >
                              <Ban className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnbanUser(userData.id)}
                              className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                              title="Desbanir Usuário"
                            >
                              <UserCheck className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {modal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {modal.type === 'credits' && modal.action === 'add' && 'Adicionar Créditos'}
                  {modal.type === 'credits' && modal.action === 'remove' && 'Remover Créditos'}
                  {modal.type === 'days' && modal.action === 'add' && 'Adicionar Dias'}
                  {modal.type === 'days' && modal.action === 'remove' && 'Remover Dias'}
                  {modal.type === 'hours' && 'Adicionar Horas'}
                  {modal.type === 'role' && 'Alterar Role'}
                  {modal.type === 'ban' && 'Banir Usuário'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Usuário: <span className="font-semibold text-gray-900">{modal.userName}</span>
                </p>

                {modal.type === 'role' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Novo Role
                    </label>
                    <select
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione um role</option>
                      <option value="usuario">Cliente (Usuário)</option>
                      <option value="revendedor">Revenda (Revendedor)</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                ) : modal.type === 'ban' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo do Banimento
                    </label>
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Digite o motivo do banimento..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {modal.type === 'credits' && 'Quantidade de Créditos'}
                      {modal.type === 'days' && 'Quantidade de Dias'}
                      {modal.type === 'hours' && 'Quantidade de Horas'}
                    </label>
                    <input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      placeholder="Digite a quantidade..."
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleModalSubmit}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  disabled={!inputValue}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
