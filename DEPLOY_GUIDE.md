# Painel Consulta - Guia de Deploy Completo

## 📋 Visão Geral
Sistema completo de consultas com painel administrativo, desenvolvido com Node.js/Express (backend) e React/Vite (frontend), utilizando PostgreSQL como banco de dados.

## 🛠️ Pré-requisitos

### Sistema Operacional
- Ubuntu 20.04+ ou CentOS 7+
- Acesso root ou sudo

### Software Necessário
- **Node.js**: versão 18.x ou superior
- **npm**: versão 8.x ou superior  
- **PostgreSQL**: versão 12.x ou superior
- **Git**: para clonagem do repositório

## 📦 Instalação dos Pré-requisitos

### 1. Instalar Node.js e npm
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 2. Instalar PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 3. Configurar PostgreSQL
```bash
# Acessar como usuário postgres
sudo -u postgres psql

# Dentro do PostgreSQL, executar:
CREATE USER painelconsulta WITH PASSWORD 'painelconsulta123';
CREATE DATABASE painelconsulta_db OWNER painelconsulta;
GRANT ALL PRIVILEGES ON DATABASE painelconsulta_db TO painelconsulta;
\q
```

## 🚀 Deploy da Aplicação

### 1. Clonar o Repositório
```bash
git clone https://github.com/regisroots/painelconsulta.git
cd painelconsulta
```

### 2. Configurar o Backend

#### 2.1. Instalar Dependências
```bash
cd backend
npm install
```

#### 2.2. Configurar Variáveis de Ambiente
```bash
# Criar arquivo .env
cp .env.example .env

# Editar o arquivo .env com suas configurações:
NODE_ENV=production
PORT=3000
JWT_SECRET=sua_chave_secreta_jwt_muito_segura_aqui_123456789
JWT_EXPIRES_IN=1h

# Database - PostgreSQL
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=painelconsulta_db
DB_USER=painelconsulta
DB_PASSWORD=painelconsulta123
DB_LOGGING=false

# Timezone
TZ=America/Sao_Paulo
```

#### 2.3. Restaurar Banco de Dados
```bash
# Restaurar o dump do banco de dados
psql -h localhost -p 5432 -U painelconsulta -d painelconsulta_db -f ../painelconsulta_db.sql
```

#### 2.4. Iniciar o Backend
```bash
# Para desenvolvimento
npm run dev

# Para produção
npm start
```

### 3. Configurar o Frontend

#### 3.1. Instalar Dependências
```bash
cd ../frontend
npm install
```

#### 3.2. Configurar Variáveis de Ambiente
```bash
# Criar arquivo .env.local
echo "VITE_API_URL=http://localhost:3000/api" > .env.local
```

#### 3.3. Build e Deploy do Frontend
```bash
# Build para produção
npm run build

# Para desenvolvimento
npm run dev

# Para servir em produção (usando serve)
npm install -g serve
serve -s dist -l 5173
```

## 🔧 Configuração de Produção

### 1. Usar PM2 para o Backend
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação com PM2
cd backend
pm2 start app.js --name "painelconsulta-backend"

# Configurar PM2 para iniciar no boot
pm2 startup
pm2 save
```

### 2. Configurar Nginx (Opcional)
```bash
# Instalar Nginx
sudo apt install nginx

# Criar configuração do site
sudo nano /etc/nginx/sites-available/painelconsulta
```

Conteúdo do arquivo de configuração do Nginx:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend
    location / {
        root /caminho/para/painelconsulta/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar o site
sudo ln -s /etc/nginx/sites-available/painelconsulta /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔐 Credenciais Padrão

### Administrador
- **Email**: admin@painelconsulta.com
- **Senha**: admin123

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- **users**: Usuários do sistema (admin, revendedor, usuario)
- **modulos**: Módulos de consulta disponíveis
- **consultas**: Histórico de consultas realizadas
- **logs**: Logs de ações do sistema

### Módulos Pré-configurados
O sistema vem com módulos de exemplo:
- Consulta CPF
- Consulta CNPJ
- Consulta CEP
- Consulta de Chassi
- Consulta de Email

## 🔍 Verificação da Instalação

### 1. Verificar Backend
```bash
curl http://localhost:3000/api/health
# Deve retornar: {"status":"ok","timestamp":"..."}
```

### 2. Verificar Frontend
```bash
curl http://localhost:5173
# Deve retornar o HTML da aplicação
```

### 3. Verificar Banco de Dados
```bash
psql -h localhost -p 5432 -U painelconsulta -d painelconsulta_db -c "SELECT COUNT(*) FROM users;"
# Deve retornar pelo menos 1 usuário (admin)
```

## 🐛 Solução de Problemas

### Erro de Conexão com Banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Erro de Permissões
```bash
# Verificar permissões do usuário do banco
sudo -u postgres psql -c "\du"
```

### Erro de Porta em Uso
```bash
# Verificar processos usando as portas
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :5173
```

## 📝 Logs da Aplicação

### Backend
```bash
# Logs do PM2
pm2 logs painelconsulta-backend

# Logs diretos (se não usar PM2)
cd backend && npm start
```

### Frontend
```bash
# Logs do build
npm run build

# Logs do servidor de desenvolvimento
npm run dev
```

## 🔄 Atualizações

### Atualizar Código
```bash
git pull origin main
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 restart painelconsulta-backend
```

### Backup do Banco
```bash
# Criar backup
pg_dump -h localhost -p 5432 -U painelconsulta -d painelconsulta_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
psql -h localhost -p 5432 -U painelconsulta -d painelconsulta_db -f backup_YYYYMMDD_HHMMSS.sql
```

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o deploy, entre em contato através do repositório GitHub:
https://github.com/regisroots/painelconsulta

---

**Desenvolvido por**: Devin AI  
**Solicitado por**: @regisroots  
**Link para sessão**: https://app.devin.ai/sessions/a6914a2ac26042ec93aa0073c1cbe083
