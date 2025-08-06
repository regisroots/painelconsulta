import React from 'react';
import { User } from '../types';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
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
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-background border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
            <h1 className="text-xl font-bold text-sidebar-primary">Painel Consulta</h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User info */}
          <div className="p-6 border-b border-sidebar-border">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-sidebar-primary rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-sidebar-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user.nome}
                    </p>
                    <p className="text-xs text-sidebar-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-sidebar-border">
                  <div className="flex justify-between text-xs">
                    <span className="text-sidebar-muted-foreground">Créditos:</span>
                    <span className="font-medium text-sidebar-foreground">
                      {user.creditos || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-sidebar-muted-foreground">Tipo:</span>
                    <span className="font-medium text-sidebar-foreground capitalize">
                      {user.tipo}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-4 space-y-2">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-sidebar-muted-foreground uppercase tracking-wider">
                Menu Principal
              </h3>
              {userMenuItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => {
                    if (item.href.startsWith('/')) {
                      window.location.href = item.href;
                    }
                  }}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>

            {(user.tipo === 'admin' || user.tipo === 'revendedor') && (
              <div className="space-y-1 pt-4">
                <h3 className="text-xs font-semibold text-sidebar-muted-foreground uppercase tracking-wider">
                  Administração
                </h3>
                {adminMenuItems.map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
          <div className="p-6 border-t border-sidebar-border">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="h-16 bg-background border-b border-gray-200 flex items-center justify-between px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Bem-vindo, {user.nome}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
