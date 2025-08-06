import { useState } from 'react';
import { User } from '../types';
import { profileAPI } from '../services/api';
import { MessageSquare, Phone, Save, User as UserIcon, Settings, History } from 'lucide-react';
import ConsultationHistory from './ConsultationHistory';

interface ProfileProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

export default function Profile({ user, onUserUpdate }: ProfileProps) {
  const [formData, setFormData] = useState({
    nome: user.nome,
    email: user.email,
    whatsapp_contato: user.whatsapp_contato || '',
    telegram_contato: user.telegram_contato || '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showConsultationHistory, setShowConsultationHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await profileAPI.updateProfile(formData);
      setMessage('Perfil atualizado com sucesso!');
      onUserUpdate({ ...user, ...response.user });
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.novaSenha !== formData.confirmarSenha) {
      setMessage('As senhas não coincidem');
      return;
    }
    
    if (formData.novaSenha.length < 6) {
      setMessage('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      await profileAPI.changePassword(formData.senhaAtual, formData.novaSenha);
      setMessage('Senha alterada com sucesso!');
      setFormData({
        ...formData,
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: '',
      });
      setShowPasswordChange(false);
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (showConsultationHistory) {
    return <ConsultationHistory onBack={() => setShowConsultationHistory(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1"></div>
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Voltar ao Dashboard</span>
          </button>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-10">
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl mx-auto mb-6">
              {user.nome.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Meu Perfil
            </h1>
            <p className="text-xl text-gray-600">
              Gerencie suas informações pessoais e de contato
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-xl ${
              message.includes('sucesso') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <UserIcon className="inline w-4 h-4 mr-2" />
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {user.tipo === 'revendedor' && (
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-blue-600" />
                  Informações de Contato para Clientes
                </h3>
                <p className="text-gray-600 mb-6">
                  Essas informações serão exibidas para os usuários que você criar, permitindo que entrem em contato com você.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <svg className="inline w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      name="whatsapp_contato"
                      value={formData.whatsapp_contato}
                      onChange={handleChange}
                      placeholder="Ex: +55 11 99999-9999"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <MessageSquare className="inline w-4 h-4 mr-2 text-blue-600" />
                      Telegram
                    </label>
                    <input
                      type="text"
                      name="telegram_contato"
                      value={formData.telegram_contato}
                      onChange={handleChange}
                      placeholder="Ex: @seuusuario"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 rounded-2xl p-8 border-2 border-orange-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-orange-600" />
                Segurança da Conta
              </h3>
              
              {!showPasswordChange ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(true)}
                  className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors"
                >
                  Alterar Senha
                </button>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      name="senhaAtual"
                      value={formData.senhaAtual}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      name="novaSenha"
                      value={formData.novaSenha}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      name="confirmarSenha"
                      value={formData.confirmarSenha}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Alterando...' : 'Confirmar Alteração'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setFormData({
                          ...formData,
                          senhaAtual: '',
                          novaSenha: '',
                          confirmarSenha: '',
                        });
                      }}
                      className="bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="bg-gradient-to-r from-green-50 via-teal-50 to-cyan-50 rounded-2xl p-8 border-2 border-green-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <History className="w-5 h-5 mr-2 text-green-600" />
                Histórico de Atividades
              </h3>
              <p className="text-gray-600 mb-6">
                Visualize todas as suas consultas realizadas com data e horário detalhados.
              </p>
              
              <button
                type="button"
                onClick={() => setShowConsultationHistory(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <History className="w-4 h-4" />
                <span>Ver Histórico de Consultas</span>
              </button>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-xl"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
