import React from 'react';
import { User } from '../types';
import { Button } from './ui/button';
import { 
  Home, 
  Search, 
  History, 
  User as UserIcon, 
  Settings, 
  Users, 
  Database, 
  FileText, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  user: User;
  children: React.ReactNode;
  onLogout: () => void;
}

export default function Layout({ user, children, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const userMenuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: Search, label: 'Consultas', href: '#consultas' },
    { icon: History, label: 'Histórico', href: '#historico' },
    { icon: UserIcon, label: 'Perfil', href: '/profile' },
  ];

  const adminMenuItems = [
    { icon: Users, label: 'Usuários', href: '#admin/usuarios' },
    { icon: Database, label: 'Módulos', href: '#admin/modulos' },
    { icon: FileText, label: 'Logs', href: '#admin/logs' },
    { icon: Settings, label: 'Configurações', href: '#admin/config' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:inset-0 shadow-lg`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
            <h1 className="text-lg font-bold text-white">Painel Consulta</h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/20"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.nome}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Créditos:</span>
                <span className="font-medium text-gray-900">
                  {user.creditos || 0}
                </span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {user.tipo}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 space-y-1">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
                Menu Principal
              </h3>
              {userMenuItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700 h-9"
                  onClick={() => {
                    if (item.href.startsWith('/')) {
                      window.location.href = item.href;
                    } else if (item.href === '#historico') {
                      window.location.href = '/historico';
                    }
                  }}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>

            {(user.tipo === 'admin' || user.tipo === 'revendedor') && (
              <div className="space-y-1 pt-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
                  Administração
                </h3>
                {adminMenuItems.map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:bg-purple-50 hover:text-purple-700 h-9"
                    onClick={() => {
                      if (item.href === '#admin/usuarios') {
                        window.location.href = '/admin/usuarios';
                      } else if (item.href === '#admin/modulos') {
                        window.location.href = '/admin/modulos';
                      } else if (item.href === '#admin/logs') {
                        window.location.href = '/admin/dashboard';
                      } else if (item.href === '#admin/config') {
                        window.location.href = '/admin/dashboard';
                      }
                    }}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            )}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full justify-start h-9 border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              onClick={onLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar - completely redesigned */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-12 px-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium text-gray-900">
                Bem-vindo, {user.nome}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {(user.tipo === 'admin' || user.tipo === 'revendedor') && (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
                  onClick={() => window.location.href = '/admin/dashboard'}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Admin
                </Button>
              )}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content - no padding, direct content */}
        <main className="flex-1 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
