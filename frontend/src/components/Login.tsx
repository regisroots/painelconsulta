import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { User } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, Shield } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expiredUser, setExpiredUser] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, senha);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      onLogin(response.user);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.expired && errorData?.revendedor) {
        setExpiredUser(errorData);
        setError('');
      } else {
        setError(errorData?.error || 'Erro ao fazer login');
        setExpiredUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-md">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            Painel Consulta
          </CardTitle>
          <CardDescription className="text-base text-gray-600 mt-2">
            Entre com suas credenciais para acessar o sistema premium
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-colors"
              />
            </div>
            <div className="space-y-3">
              <label htmlFor="senha" className="text-sm font-semibold text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Senha
              </label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={loading}
                className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-colors"
              />
            </div>
            
            {expiredUser && (
              <div className="p-6 text-sm bg-orange-50 border-2 border-orange-200 rounded-xl">
                <h4 className="font-bold text-orange-800 mb-3">Conta Expirada</h4>
                <p className="text-orange-700 mb-4">
                  Sua conta expirou. Entre em contato com seu revendedor para renovar:
                </p>
                
                {expiredUser.revendedor && (
                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                        {expiredUser.revendedor.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{expiredUser.revendedor.nome}</p>
                        <p className="text-gray-600 text-xs">{expiredUser.revendedor.email}</p>
                      </div>
                    </div>
                    
                    {(expiredUser.revendedor.whatsapp_contato || expiredUser.revendedor.telegram_contato) && (
                      <div className="flex space-x-2">
                        {expiredUser.revendedor.whatsapp_contato && (
                          <a
                            href={`https://wa.me/${expiredUser.revendedor.whatsapp_contato.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors text-xs"
                          >
                            <span>WhatsApp</span>
                          </a>
                        )}
                        
                        {expiredUser.revendedor.telegram_contato && (
                          <a
                            href={`https://t.me/${expiredUser.revendedor.telegram_contato.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-xs"
                          >
                            <span>Telegram</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 border-2 border-red-200 rounded-xl">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar no Sistema'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
