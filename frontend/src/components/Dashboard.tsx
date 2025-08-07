import { useState, useEffect } from 'react';
import { User, Modulo } from '../types';
import { moduloAPI, profileAPI } from '../services/api';
import ConsultaInterface from './ConsultaInterface';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onUserUpdate?: (user: User) => void;
}

export default function Dashboard({ user, onLogout, onUserUpdate }: DashboardProps) {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModulo, setSelectedModulo] = useState<Modulo | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredModulos, setFilteredModulos] = useState<Modulo[]>([]);

  useEffect(() => {
    loadModulos();
    loadUserData();
    
    const interval = setInterval(() => {
      loadUserData();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [user]);

  const loadModulos = async () => {
    try {
      const data = await moduloAPI.getAtivos();
      const modulosArray = Array.isArray(data) ? data : (data as any).modulos || [];
      setModulos(modulosArray.filter((m: any) => m.ativo));
    } catch (error) {
      console.error('Erro ao carregar módulos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const response = await profileAPI.getProfile();
      const userData = response.user || response;
      setCurrentUser(userData);
      if (onUserUpdate) {
        onUserUpdate(userData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setCurrentUser(user);
    }
  };


  const diasRestantes = currentUser.data_expiracao 
    ? Math.ceil((new Date(currentUser.data_expiracao).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredModulos(modulos);
    } else {
      const filtered = modulos.filter(modulo => 
        modulo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        modulo.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredModulos(filtered);
    }
  }, [modulos, searchTerm]);

  if (selectedModulo) {
    return (
      <ConsultaInterface 
        modulo={selectedModulo} 
        onBack={() => setSelectedModulo(null)}
        onConsultaSuccess={() => loadUserData()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Modern SaaS Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-11 w-11 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-xl">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Painel Consulta
                </h1>
                <p className="text-xs text-gray-500 font-medium">Plataforma Premium de Consultas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6">
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 font-medium">Sistema Online</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    Bem-vindo, {user.nome}
                  </p>
                  <p className="text-xs text-gray-600 capitalize font-medium">
                    {user.tipo} • {user.creditos || 0} créditos
                  </p>
                </div>
                
                <button
                  onClick={() => window.location.href = '/profile'}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Perfil</span>
                </button>

                {(user.tipo === 'admin' || user.tipo === 'revendedor') && (
                  <button
                    onClick={() => window.location.href = '/admin/dashboard'}
                    className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-1 rounded-lg shadow-md transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Admin</span>
                  </button>
                )}
                
                <div className="w-11 h-11 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {user.nome.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bem-vindo ao <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Painel Consulta</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Acesse informações precisas e atualizadas através dos nossos serviços de consulta premium
          </p>
        </div>

        {/* Reseller Contact Information */}
        {user.tipo === 'usuario' && (user as any).revendedor && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 mb-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Seu Revendedor
              </h3>
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {(user as any).revendedor.nome.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-xl font-semibold text-gray-900">
                    {(user as any).revendedor.nome}
                  </p>
                  <p className="text-gray-600">{(user as any).revendedor.email}</p>
                </div>
              </div>
              
              {((user as any).revendedor.whatsapp_contato || (user as any).revendedor.telegram_contato) && (
                <div className="flex items-center justify-center space-x-4">
                  {(user as any).revendedor.whatsapp_contato && (
                    <a
                      href={`https://wa.me/${(user as any).revendedor.whatsapp_contato.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                  )}
                  
                  {(user as any).revendedor.telegram_contato && (
                    <a
                      href={`https://t.me/${(user as any).revendedor.telegram_contato.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                      <span>Telegram</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Créditos Disponíveis
                </p>
                <p className="text-4xl font-bold text-gray-900 mb-1">
                  {user.creditos?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-green-600 font-medium">Saldo atual</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 rounded-3xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-shadow">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Dias Restantes
                </p>
                <p className="text-4xl font-bold text-gray-900 mb-1">
                  {diasRestantes !== null ? diasRestantes : '∞'}
                </p>
                <p className="text-xs text-blue-600 font-medium">Validade da conta</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-shadow">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Plano Ativo
                </p>
                <p className="text-4xl font-bold text-gray-900 capitalize mb-1">
                  {user.tipo}
                </p>
                <p className="text-xs text-purple-600 font-medium">Nível de acesso</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-shadow">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>


        {/* Search Bar */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Pesquisar Módulos
              </h3>
              <p className="text-gray-600">
                Digite o nome ou palavra-chave para encontrar o módulo desejado
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ex: CPF, CNPJ, Serasa..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all"
              />
            </div>
            {searchTerm && (
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-600">
                  {filteredModulos.length} módulo{filteredModulos.length !== 1 ? 's' : ''} encontrado{filteredModulos.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Services Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-10">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nossos Serviços Premium
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Escolha o serviço de consulta que você precisa com tecnologia avançada e resultados instantâneos
            </p>
            <div className="flex items-center justify-center space-x-6 mt-6">
              <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-700">
                  {filteredModulos.length} serviços {searchTerm ? 'encontrados' : 'disponíveis'}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 10.793a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-blue-700">Resposta rápida</span>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <p className="mt-6 text-gray-600 text-lg">Carregando serviços...</p>
            </div>
          ) : filteredModulos.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={searchTerm ? "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" : "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"} />
                </svg>
              </div>
              <h4 className="text-2xl font-semibold text-gray-900 mb-3">
                {searchTerm ? 'Nenhum módulo encontrado' : 'Nenhum serviço disponível'}
              </h4>
              <p className="text-gray-600 text-lg">
                {searchTerm 
                  ? `Não encontramos módulos que correspondam a "${searchTerm}". Tente uma palavra-chave diferente.`
                  : 'Os serviços de consulta aparecerão aqui quando estiverem ativos.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredModulos.map((modulo) => (
                <div
                  key={modulo.id}
                  onClick={() => !modulo.manutencao && setSelectedModulo(modulo)}
                  className={`group relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden ${
                    modulo.manutencao 
                      ? 'cursor-not-allowed opacity-75' 
                      : 'cursor-pointer'
                  }`}
                >
                  {/* Enhanced Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${
                    modulo.manutencao
                      ? 'from-orange-50/70 via-yellow-50/70 to-orange-50/70 opacity-100'
                      : 'from-blue-50/70 via-indigo-50/70 to-purple-50/70 opacity-0 group-hover:opacity-100'
                  }`}></div>
                  
                  {/* Module Limit Display and Status */}
                  <div className="absolute top-4 right-6 z-10 text-right">
                    {/* Credit Cost Balloon - Show above status for credit-based modules */}
                    {modulo.tipo_limite === 'creditos' && modulo.preco_por_consulta > 0 && (
                      <div className="mb-2">
                        <div className="bg-blue-500/90 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-400 shadow-lg">
                          <span className="text-xs font-bold text-white">
                            {parseFloat(String(modulo.preco_por_consulta || 0)).toFixed(0)} créditos
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Quantity Limit Display */}
                    {modulo.tipo_limite === 'quantidade' && (
                      <div className="mb-2">
                        {(() => {
                          const moduloFromState = modulos.find(m => m.id === modulo.id);
                          const defaultLimit = moduloFromState?.limite_padrao_quantidade || 1000;
                          const moduloConfig = user.modulos?.[modulo.id];
                          
                          console.log('=== DASHBOARD DEBUG ===');
                          console.log('Modulo ID:', modulo.id);
                          console.log('Modulo nome:', modulo.nome);
                          console.log('moduloFromState:', moduloFromState);
                          console.log('defaultLimit:', defaultLimit);
                          console.log('moduloConfig:', moduloConfig);
                          console.log('user.modulos:', user.modulos);
                          console.log('=== FIM DEBUG ===');
                          
                          if (!moduloConfig) {
                            return (
                              <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200 shadow-lg">
                                <span className="text-xs font-bold text-gray-700">
                                  0/{defaultLimit}
                                </span>
                              </div>
                            );
                          }
                          
                          const limite = moduloConfig.limite || defaultLimit;
                          
                          return (
                            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200 shadow-lg">
                              <span className="text-xs font-bold text-gray-700">
                                {moduloConfig.usado || 0}/{limite}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <span className={`px-4 py-2 rounded-full text-xs font-bold shadow-xl backdrop-blur-sm ${
                      modulo.manutencao
                        ? 'bg-orange-500/90 text-white border border-orange-400'
                        : modulo.ativo 
                          ? 'bg-green-500/90 text-white border border-green-400'
                          : 'bg-red-500/90 text-white border border-red-400'
                    }`}>
                      {modulo.manutencao ? 'MANUTENÇÃO' : (modulo.ativo ? 'ONLINE' : 'OFFLINE')}
                    </span>
                  </div>

                  <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    {/* Enhanced Service Icon */}
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-2xl group-hover:shadow-3xl group-hover:scale-110 transition-all duration-500">
                      {modulo.imagem_url ? (
                        <img
                          src={`http://localhost:3000${modulo.imagem_url}`}
                          alt={modulo.nome}
                          className="w-14 h-14 object-contain"
                        />
                      ) : (
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    
                    {/* Enhanced Service Name */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {modulo.nome}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {modulo.descricao}
                      </p>
                    </div>
                    

                    {/* Enhanced Action Button */}
                    <button className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
                      Acessar Serviço Premium
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
