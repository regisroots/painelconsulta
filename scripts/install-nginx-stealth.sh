#!/bin/bash


set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

NGINX_VERSION="1.24.0"
HEADERS_MORE_VERSION="0.34"
WORK_DIR="/tmp/nginx-stealth-build"
NGINX_USER="nginx"
NGINX_GROUP="nginx"

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root or with sudo"
        exit 1
    fi
}

detect_ubuntu() {
    if [[ ! -f /etc/lsb-release ]]; then
        print_error "This script is designed for Ubuntu systems"
        exit 1
    fi
    
    source /etc/lsb-release
    print_status "Detected Ubuntu $DISTRIB_RELEASE"
    
    if [[ $(echo "$DISTRIB_RELEASE >= 20.04" | bc -l) -eq 0 ]]; then
        print_warning "Ubuntu 20.04 or higher is recommended"
    fi
}

install_dependencies() {
    print_status "Installing build dependencies..."
    
    apt update
    apt install -y \
        build-essential \
        libpcre3-dev \
        zlib1g-dev \
        libssl-dev \
        libgd-dev \
        libxml2-dev \
        uuid-dev \
        wget \
        curl \
        git \
        bc \
        openssl
    
    print_success "Dependencies installed successfully"
}

create_nginx_user() {
    print_status "Creating nginx user..."
    
    if ! id "$NGINX_USER" &>/dev/null; then
        useradd --system --home /var/cache/nginx --shell /sbin/nologin \
                --comment "nginx user" --user-group "$NGINX_USER"
        print_success "Nginx user created"
    else
        print_warning "Nginx user already exists"
    fi
}

compile_nginx() {
    print_status "Downloading and compiling nginx with headers-more module..."
    
    rm -rf "$WORK_DIR"
    mkdir -p "$WORK_DIR"
    cd "$WORK_DIR"
    
    print_status "Downloading nginx $NGINX_VERSION..."
    wget "http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz"
    tar -xzf "nginx-${NGINX_VERSION}.tar.gz"
    
    print_status "Downloading headers-more module v$HEADERS_MORE_VERSION..."
    wget "https://github.com/openresty/headers-more-nginx-module/archive/v${HEADERS_MORE_VERSION}.tar.gz"
    tar -xzf "v${HEADERS_MORE_VERSION}.tar.gz"
    
    print_status "Compiling nginx with stealth configuration..."
    cd "nginx-${NGINX_VERSION}"
    
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
        --user="$NGINX_USER" \
        --group="$NGINX_GROUP" \
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
        --add-module="../headers-more-nginx-module-${HEADERS_MORE_VERSION}"
    
    make -j$(nproc)
    make install
    
    print_success "Nginx compiled and installed successfully"
}

setup_directories() {
    print_status "Setting up directories and permissions..."
    
    mkdir -p /var/cache/nginx/{client_temp,proxy_temp,fastcgi_temp,uwsgi_temp,scgi_temp}
    mkdir -p /usr/share/nginx/html
    mkdir -p /etc/ssl/{certs,private}
    mkdir -p /var/log/nginx
    
    chown -R "$NGINX_USER:$NGINX_GROUP" /var/cache/nginx /var/log/nginx /usr/share/nginx/html
    chmod 755 /var/cache/nginx
    chmod 750 /etc/ssl/private
    chmod 755 /usr/share/nginx/html
    
    print_success "Directories and permissions configured"
}

generate_ssl_certificates() {
    print_status "Generating SSL certificates..."
    
    if [[ ! -f /etc/ssl/certs/dhparam.pem ]]; then
        print_status "Generating Diffie-Hellman parameters (this may take a while)..."
        openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
    fi
    
    if [[ ! -f /etc/ssl/certs/nginx-selfsigned.crt ]]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
            -keyout /etc/ssl/private/nginx-selfsigned.key \
            -out /etc/ssl/certs/nginx-selfsigned.crt \
            -subj "/C=US/ST=State/L=City/O=Organization/OU=IT Department/CN=localhost"
    fi
    
    chmod 600 /etc/ssl/private/nginx-selfsigned.key
    chmod 644 /etc/ssl/certs/nginx-selfsigned.crt
    chown "$NGINX_USER:$NGINX_GROUP" /etc/ssl/private/nginx-selfsigned.key /etc/ssl/certs/nginx-selfsigned.crt
    
    print_success "SSL certificates generated"
}

apply_system_hardening() {
    print_status "Applying Ubuntu system hardening..."
    
    [[ -f /etc/issue ]] && cp /etc/issue /etc/issue.backup
    [[ -f /etc/motd ]] && cp /etc/motd /etc/motd.backup
    
    echo "Authorized access only" > /etc/issue
    echo "Welcome" > /etc/motd
    
    if [[ -f /etc/ssh/sshd_config ]]; then
        echo "Authorized access only" > /etc/ssh/banner
        
        sed -i 's/#Banner none/Banner \/etc\/ssh\/banner/' /etc/ssh/sshd_config
        
        if ! grep -q "DebianBanner" /etc/ssh/sshd_config; then
            echo "DebianBanner no" >> /etc/ssh/sshd_config
        fi
        
        systemctl restart sshd
        print_success "SSH hardening applied"
    fi
    
    print_success "System hardening completed"
}

create_systemd_service() {
    print_status "Creating systemd service..."
    
    cat > /etc/systemd/system/nginx.service << 'EOF'
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
ExecReload=/bin/kill -s HUP $MAINPID
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
    
    systemctl daemon-reload
    systemctl enable nginx
    
    print_success "Systemd service created and enabled"
}

install_config_files() {
    print_status "Installing nginx configuration files..."
    
    if [[ -f "nginx.conf" ]]; then
        cp nginx.conf /etc/nginx/nginx.conf
        print_success "Main nginx configuration installed"
    else
        print_warning "nginx.conf not found in current directory"
        print_warning "Please manually copy your stealth configuration to /etc/nginx/nginx.conf"
    fi
    
    if [[ -d "nginx/custom-pages" ]]; then
        cp -r nginx/custom-pages/* /usr/share/nginx/html/
        print_success "Custom error pages installed"
    else
        print_warning "Custom error pages not found"
    fi
}

test_configuration() {
    print_status "Testing nginx configuration..."
    
    if nginx -t; then
        print_success "Nginx configuration test passed"
        return 0
    else
        print_error "Nginx configuration test failed"
        return 1
    fi
}

start_nginx() {
    print_status "Starting nginx service..."
    
    if systemctl start nginx; then
        print_success "Nginx started successfully"
        systemctl status nginx --no-pager
    else
        print_error "Failed to start nginx"
        return 1
    fi
}

verify_stealth() {
    print_status "Verifying stealth configuration..."
    
    sleep 2
    
    print_status "Testing HTTP headers..."
    if command -v curl &> /dev/null; then
        echo "Server header:"
        curl -I http://localhost 2>/dev/null | grep -i server || echo "No server header found"
        
        echo "Checking for nginx references:"
        if curl -I http://localhost 2>/dev/null | grep -i nginx; then
            print_warning "Nginx references found in headers"
        else
            print_success "No nginx references found in headers"
        fi
    else
        print_warning "curl not available for header testing"
    fi
}

display_completion() {
    print_success "Nginx stealth installation completed!"
    echo
    echo -e "${GREEN}Next steps:${NC}"
    echo "1. Review the configuration in /etc/nginx/nginx.conf"
    echo "2. Replace self-signed certificates with valid SSL certificates for production"
    echo "3. Configure your application-specific settings"
    echo "4. Test the stealth configuration with external tools"
    echo
    echo -e "${BLUE}Useful commands:${NC}"
    echo "- Test configuration: nginx -t"
    echo "- Reload configuration: systemctl reload nginx"
    echo "- View logs: journalctl -u nginx -f"
    echo "- Check status: systemctl status nginx"
    echo
    echo -e "${YELLOW}Security note:${NC}"
    echo "This installation provides stealth capabilities but should be part of"
    echo "a comprehensive security strategy including firewalls, monitoring, and"
    echo "regular security updates."
}

main() {
    echo -e "${BLUE}Nginx Stealth Installation Script${NC}"
    echo "=================================="
    echo
    
    check_root
    detect_ubuntu
    install_dependencies
    create_nginx_user
    compile_nginx
    setup_directories
    generate_ssl_certificates
    apply_system_hardening
    create_systemd_service
    install_config_files
    
    if test_configuration; then
        start_nginx
        verify_stealth
        display_completion
    else
        print_error "Installation completed but configuration test failed"
        print_error "Please check the configuration and try again"
        exit 1
    fi
    
    rm -rf "$WORK_DIR"
}

main "$@"
