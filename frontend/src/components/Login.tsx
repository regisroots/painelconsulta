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
      setError(err.response?.data?.error || 'Erro ao fazer login');
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
