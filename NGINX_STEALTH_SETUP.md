# Nginx Stealth Configuration Setup Guide

Este guia fornece instruções completas para configurar um servidor nginx que oculta completamente sua identidade e versão, mascarando-se como Apache para evitar fingerprinting e ataques direcionados.

## 🎯 Objetivos da Configuração Stealth

- **Ocultar completamente a versão do nginx**
- **Mascarar o servidor como Apache**
- **Remover todos os headers que possam identificar o nginx**
- **Implementar páginas de erro customizadas sem assinaturas do nginx**
- **Configurar SSL/TLS hardening sem exposição de versões**
- **Aplicar medidas de segurança a nível de sistema Ubuntu**

## 🔧 Pré-requisitos

- Ubuntu 20.04 LTS ou superior
- Acesso root ou sudo
- Docker e Docker Compose (para deployment containerizado)
- Conexão com internet para download de dependências

## 📋 Instalação Manual no Ubuntu

### 1. Preparação do Sistema

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências de compilação
sudo apt install -y build-essential libpcre3-dev zlib1g-dev libssl-dev libgd-dev libxml2-dev uuid-dev wget curl git

# Criar usuário nginx
sudo useradd --system --home /var/cache/nginx --shell /sbin/nologin --comment "nginx user" --user-group nginx
```

### 2. Download e Compilação do Nginx com headers-more

```bash
# Criar diretório de trabalho
mkdir -p /tmp/nginx-build && cd /tmp/nginx-build

# Download nginx source
NGINX_VERSION="1.24.0"
wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz
tar -xzf nginx-${NGINX_VERSION}.tar.gz

# Download headers-more module
HEADERS_MORE_VERSION="0.34"
wget https://github.com/openresty/headers-more-nginx-module/archive/v${HEADERS_MORE_VERSION}.tar.gz
tar -xzf v${HEADERS_MORE_VERSION}.tar.gz

# Compilar nginx com módulo headers-more
cd nginx-${NGINX_VERSION}
./configure \
    --prefix=/etc/nginx \
    --sbin-path=/usr/sbin/nginx \
    --modules-path=/usr/lib/nginx/modules \
    --conf-path=/etc/nginx/nginx.conf \
    --error-log-path=/var/log/nginx/error.log \
    --http-log-path=/var/log/nginx/access.log \
    --pid-path=/var/run/nginx.pid \
    --lock-path=/var/run/nginx.lock \
    --http-client-body-temp-path=/var/cache/nginx/client_temp \
    --http-proxy-temp-path=/var/cache/nginx/proxy_temp \
    --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp \
    --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp \
    --http-scgi-temp-path=/var/cache/nginx/scgi_temp \
    --user=nginx \
    --group=nginx \
    --with-compat \
    --with-file-aio \
    --with-threads \
    --with-http_addition_module \
    --with-http_auth_request_module \
    --with-http_dav_module \
    --with-http_flv_module \
    --with-http_gunzip_module \
    --with-http_gzip_static_module \
    --with-http_mp4_module \
    --with-http_random_index_module \
    --with-http_realip_module \
    --with-http_secure_link_module \
    --with-http_slice_module \
    --with-http_ssl_module \
    --with-http_stub_status_module \
    --with-http_sub_module \
    --with-http_v2_module \
    --with-stream \
    --with-stream_realip_module \
    --with-stream_ssl_module \
    --with-stream_ssl_preread_module \
    --add-module=../headers-more-nginx-module-${HEADERS_MORE_VERSION}

make -j$(nproc)
sudo make install
```

### 3. Configuração de Diretórios e Permissões

```bash
# Criar diretórios necessários
sudo mkdir -p /var/cache/nginx/{client_temp,proxy_temp,fastcgi_temp,uwsgi_temp,scgi_temp}
sudo mkdir -p /usr/share/nginx/html
sudo mkdir -p /etc/ssl/{certs,private}

# Definir permissões
sudo chown -R nginx:nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html
sudo chmod 755 /var/cache/nginx
sudo chmod 750 /etc/ssl/private
```

### 4. Configuração SSL/TLS

```bash
# Gerar parâmetros Diffie-Hellman
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048

# Gerar certificado auto-assinado (para desenvolvimento)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
    -keyout /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/OU=IT Department/CN=localhost"

# Definir permissões SSL
sudo chmod 600 /etc/ssl/private/nginx-selfsigned.key
sudo chmod 644 /etc/ssl/certs/nginx-selfsigned.crt
sudo chown nginx:nginx /etc/ssl/private/nginx-selfsigned.key /etc/ssl/certs/nginx-selfsigned.crt
```

### 5. Hardening do Sistema Ubuntu

```bash
# Ocultar informações do sistema em /etc/issue
sudo cp /etc/issue /etc/issue.backup
echo "Authorized access only" | sudo tee /etc/issue

# Ocultar informações do sistema em /etc/motd
sudo cp /etc/motd /etc/motd.backup
echo "Welcome" | sudo tee /etc/motd

# Configurar SSH para ocultar banner
sudo sed -i 's/#Banner none/Banner \/etc\/ssh\/banner/' /etc/ssh/sshd_config
echo "Authorized access only" | sudo tee /etc/ssh/banner

# Desabilitar informações de versão no SSH
echo "DebianBanner no" | sudo tee -a /etc/ssh/sshd_config

# Reiniciar SSH
sudo systemctl restart sshd
```

### 6. Configuração do Systemd

```bash
# Criar arquivo de serviço systemd
sudo tee /etc/systemd/system/nginx.service > /dev/null <<EOF
[Unit]
Description=The NGINX HTTP and reverse proxy server
Documentation=http://nginx.org/en/docs/
After=network-online.target remote-fs.target nss-lookup.target
Wants=network-online.target

[Service]
Type=forking
PIDFile=/var/run/nginx.pid
ExecStartPre=/usr/sbin/nginx -t
ExecStart=/usr/sbin/nginx
ExecReload=/bin/kill -s HUP \$MAINPID
KillMode=mixed
KillSignal=SIGTERM
PrivateTmp=true
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/cache/nginx /var/log/nginx

[Install]
WantedBy=multi-user.target
EOF

# Habilitar e iniciar nginx
sudo systemctl daemon-reload
sudo systemctl enable nginx
sudo systemctl start nginx
```

## 🐳 Deployment com Docker

### 1. Build da Imagem Stealth

```bash
# No diretório do projeto
docker build -f nginx/Dockerfile.stealth -t nginx-stealth .
```

### 2. Deploy com Docker Compose

```bash
# Iniciar todos os serviços
docker-compose -f docker-compose.nginx.yml up -d

# Verificar logs
docker-compose -f docker-compose.nginx.yml logs nginx

# Verificar status
docker-compose -f docker-compose.nginx.yml ps
```

## 🔍 Verificação da Configuração Stealth

### 1. Teste de Headers

```bash
# Testar headers HTTP
curl -I http://localhost
curl -I https://localhost -k

# Verificar se não há referências ao nginx
curl -I http://localhost | grep -i nginx
curl -I https://localhost -k | grep -i nginx

# Deve retornar "Server: Apache/2.4.41 (Ubuntu)"
curl -I http://localhost | grep Server
```

### 2. Teste de Páginas de Erro

```bash
# Testar página 404 customizada
curl http://localhost/pagina-inexistente

# Testar página 500 (se disponível)
curl http://localhost/api/error-test
```

### 3. Verificação SSL/TLS

```bash
# Testar configuração SSL
openssl s_client -connect localhost:443 -servername localhost

# Verificar ciphers suportados
nmap --script ssl-enum-ciphers -p 443 localhost
```

### 4. Teste de Fingerprinting

```bash
# Usar whatweb para verificar fingerprinting
whatweb http://localhost

# Usar nmap para detecção de serviços
nmap -sV -p 80,443 localhost

# Verificar com curl verbose
curl -v http://localhost 2>&1 | grep -i server
```

## 🛡️ Recursos de Segurança Implementados

### Headers de Segurança
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Content-Security-Policy` customizado
- `Referrer-Policy: strict-origin-when-cross-origin`

### Rate Limiting
- **API geral**: 10 requests/segundo
- **Login**: 5 requests/minuto
- **Global**: 30 requests/minuto
- **Conexões simultâneas**: 20 por IP

### Proteções Implementadas
- Bloqueio de arquivos sensíveis (`.env`, `.git`, etc.)
- Bloqueio de scanners de vulnerabilidades
- Proteção contra ataques de força bruta
- Headers falsos para mascarar tecnologia backend
- Páginas de erro customizadas sem assinaturas

### SSL/TLS Hardening
- Apenas TLS 1.2 e 1.3
- Ciphers seguros e modernos
- HSTS habilitado
- SSL stapling
- Parâmetros DH customizados

## 🔧 Troubleshooting

### Problema: Nginx não inicia
```bash
# Verificar configuração
sudo nginx -t

# Verificar logs
sudo journalctl -u nginx -f

# Verificar permissões
sudo chown -R nginx:nginx /var/cache/nginx /var/log/nginx
```

### Problema: Headers ainda mostram nginx
```bash
# Verificar se módulo headers-more foi compilado
nginx -V 2>&1 | grep -o with-http_addition_module

# Recompilar nginx se necessário
```

### Problema: SSL não funciona
```bash
# Verificar certificados
sudo openssl x509 -in /etc/ssl/certs/nginx-selfsigned.crt -text -noout

# Regenerar certificados se necessário
sudo /usr/local/bin/generate-ssl.sh
```

## 📚 Referências e Documentação

- [Nginx Security Headers](https://nginx.org/en/docs/http/ngx_http_headers_module.html)
- [Headers More Module](https://github.com/openresty/headers-more-nginx-module)
- [SSL/TLS Best Practices](https://wiki.mozilla.org/Security/Server_Side_TLS)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)

## ⚠️ Avisos Importantes

1. **Certificados SSL**: Em produção, substitua os certificados auto-assinados por certificados válidos de uma CA confiável
2. **Firewall**: Configure iptables ou ufw para restringir acesso às portas necessárias
3. **Monitoramento**: Implemente logs centralizados e monitoramento de segurança
4. **Atualizações**: Mantenha o nginx e sistema operacional sempre atualizados
5. **Backup**: Faça backup regular das configurações e certificados

## 🎯 Próximos Passos

1. Configurar certificados Let's Encrypt para produção
2. Implementar fail2ban para proteção adicional
3. Configurar WAF (Web Application Firewall)
4. Implementar monitoramento com Prometheus/Grafana
5. Configurar logs centralizados com ELK Stack
