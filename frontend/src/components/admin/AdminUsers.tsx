import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import Layout from '../Layout';
import { userAPI } from '../../services/api';
import { 
  Users, 
  Plus, 
  Edit3, 
  X,
  AlertCircle,
  CheckCircle,
  Ban,
  UserCheck,
  Calendar,
  CreditCard,
  Shield
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

  useEffect(() => {
    loadUsers();
  }, []);

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

  const handleUpdateUser = async (userId: number, updates: Partial<UserData>) => {
    try {
      await userAPI.updateUser(userId, updates);
      loadUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário');
    }
  };

  const handleBanUser = async (userId: number, motivo: string) => {
    try {
      await userAPI.banUser(userId, motivo);
      loadUsers();
    } catch (error) {
      console.error('Erro ao banir usuário:', error);
      alert('Erro ao banir usuário');
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
            <p className="text-gray-600 mt-1">{users.length} usuários cadastrados</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Usuário</span>
          </button>
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
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((userData) => (
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
                            {new Date(userData.data_criacao).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => {
                              const creditos = prompt('Novos créditos:', userData.creditos?.toString() || '0');
                              if (creditos !== null) {
                                handleUpdateUser(userData.id, { creditos: parseInt(creditos) });
                              }
                            }}
                            className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar Créditos</span>
                          </button>
                          
                          {!userData.banido ? (
                            <button
                              onClick={() => {
                                const motivo = prompt('Motivo do banimento:');
                                if (motivo) handleBanUser(userData.id, motivo);
                              }}
                              className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Banir</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateUser(userData.id, { banido: false, motivo_banimento: null })}
                              className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Desbanir</span>
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
      </div>
    </Layout>
  );
}
