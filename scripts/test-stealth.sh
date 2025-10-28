#!/bin/bash


set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TEST_HOST="localhost"
TEST_HTTP_PORT="80"
TEST_HTTPS_PORT="443"

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

test_nginx_config() {
    print_status "Testing nginx configuration syntax..."
    
    if nginx -t >/dev/null 2>&1; then
        print_success "Nginx configuration syntax is valid"
        return 0
    else
        print_error "Nginx configuration syntax is invalid"
        nginx -t
        return 1
    fi
}

test_nginx_running() {
    print_status "Checking if nginx is running..."
    
    if systemctl is-active --quiet nginx; then
        print_success "Nginx is running"
        return 0
    else
        print_error "Nginx is not running"
        return 1
    fi
}

test_http_headers() {
    print_status "Testing HTTP headers for stealth configuration..."
    
    if ! command_exists curl; then
        print_error "curl is required for header testing"
        return 1
    fi
    
    print_status "Testing HTTP headers on port $TEST_HTTP_PORT..."
    local http_headers
    http_headers=$(curl -I "http://${TEST_HOST}:${TEST_HTTP_PORT}" 2>/dev/null || echo "")
    
    if [[ -z "$http_headers" ]]; then
        print_error "Could not retrieve HTTP headers"
        return 1
    fi
    
    local server_header
    server_header=$(echo "$http_headers" | grep -i "^server:" | head -1)
    
    if [[ -n "$server_header" ]]; then
        echo "  Server header: $server_header"
        if echo "$server_header" | grep -qi "nginx"; then
            print_error "Server header reveals nginx"
        elif echo "$server_header" | grep -qi "apache"; then
            print_success "Server header successfully masquerades as Apache"
        else
            print_warning "Server header present but not masquerading as Apache"
        fi
    else
        print_warning "No Server header found"
    fi
    
    if echo "$http_headers" | grep -qi "nginx"; then
        print_error "Headers contain nginx references"
        echo "$http_headers" | grep -i nginx
    else
        print_success "No nginx references found in headers"
    fi
    
    local powered_by
    powered_by=$(echo "$http_headers" | grep -i "^x-powered-by:" | head -1)
    if [[ -n "$powered_by" ]]; then
        echo "  X-Powered-By header: $powered_by"
        if echo "$powered_by" | grep -qi "php"; then
            print_success "X-Powered-By header successfully masquerades as PHP"
        fi
    fi
}

test_https_headers() {
    print_status "Testing HTTPS headers for stealth configuration..."
    
    if ! command_exists curl; then
        print_error "curl is required for HTTPS header testing"
        return 1
    fi
    
    print_status "Testing HTTPS headers on port $TEST_HTTPS_PORT..."
    local https_headers
    https_headers=$(curl -I -k "https://${TEST_HOST}:${TEST_HTTPS_PORT}" 2>/dev/null || echo "")
    
    if [[ -z "$https_headers" ]]; then
        print_error "Could not retrieve HTTPS headers"
        return 1
    fi
    
    local server_header
    server_header=$(echo "$https_headers" | grep -i "^server:" | head -1)
    
    if [[ -n "$server_header" ]]; then
        echo "  HTTPS Server header: $server_header"
        if echo "$server_header" | grep -qi "nginx"; then
            print_error "HTTPS Server header reveals nginx"
        elif echo "$server_header" | grep -qi "apache"; then
            print_success "HTTPS Server header successfully masquerades as Apache"
        fi
    fi
    
    local security_headers=("strict-transport-security" "x-frame-options" "x-content-type-options" "x-xss-protection")
    
    for header in "${security_headers[@]}"; do
        if echo "$https_headers" | grep -qi "^${header}:"; then
            print_success "Security header present: $header"
        else
            print_warning "Security header missing: $header"
        fi
    done
}

test_error_pages() {
    print_status "Testing custom error pages..."
    
    if ! command_exists curl; then
        print_error "curl is required for error page testing"
        return 1
    fi
    
    print_status "Testing 404 error page..."
    local error_404
    error_404=$(curl -s "http://${TEST_HOST}:${TEST_HTTP_PORT}/nonexistent-page" 2>/dev/null || echo "")
    
    if [[ -n "$error_404" ]]; then
        if echo "$error_404" | grep -qi "nginx"; then
            print_error "404 page contains nginx references"
        else
            print_success "404 page does not reveal nginx"
        fi
        
        if echo "$error_404" | grep -qi "página não encontrada\|not found"; then
            print_success "Custom 404 page is working"
        else
            print_warning "404 page may not be custom"
        fi
    else
        print_error "Could not retrieve 404 page"
    fi
}

test_ssl_config() {
    print_status "Testing SSL/TLS configuration..."
    
    if ! command_exists openssl; then
        print_error "openssl is required for SSL testing"
        return 1
    fi
    
    print_status "Testing SSL connection..."
    local ssl_output
    ssl_output=$(echo | openssl s_client -connect "${TEST_HOST}:${TEST_HTTPS_PORT}" -servername "$TEST_HOST" 2>/dev/null || echo "")
    
    if [[ -n "$ssl_output" ]]; then
        if echo "$ssl_output" | grep -q "Protocol.*TLSv1\.[23]"; then
            print_success "Using secure TLS protocol"
        else
            print_warning "TLS protocol version may not be optimal"
        fi
        
        if echo "$ssl_output" | grep -qi "nginx"; then
            print_error "SSL certificate or connection reveals nginx"
        else
            print_success "SSL connection does not reveal nginx"
        fi
    else
        print_error "Could not establish SSL connection"
    fi
}

test_with_external_tools() {
    print_status "Testing with external fingerprinting tools..."
    
    if command_exists whatweb; then
        print_status "Testing with whatweb..."
        local whatweb_output
        whatweb_output=$(whatweb "http://${TEST_HOST}:${TEST_HTTP_PORT}" 2>/dev/null || echo "")
        
        if [[ -n "$whatweb_output" ]]; then
            echo "  WhatWeb output: $whatweb_output"
            if echo "$whatweb_output" | grep -qi "nginx"; then
                print_error "WhatWeb detected nginx"
            elif echo "$whatweb_output" | grep -qi "apache"; then
                print_success "WhatWeb detected Apache (masquerading successful)"
            else
                print_success "WhatWeb did not detect nginx"
            fi
        fi
    else
        print_warning "whatweb not available for testing"
    fi
    
    if command_exists nmap; then
        print_status "Testing with nmap service detection..."
        local nmap_output
        nmap_output=$(nmap -sV -p "$TEST_HTTP_PORT,$TEST_HTTPS_PORT" "$TEST_HOST" 2>/dev/null || echo "")
        
        if [[ -n "$nmap_output" ]]; then
            echo "  Nmap service detection:"
            echo "$nmap_output" | grep -E "^$TEST_HTTP_PORT|^$TEST_HTTPS_PORT" || echo "    No service information detected"
            
            if echo "$nmap_output" | grep -qi "nginx"; then
                print_error "Nmap detected nginx"
            else
                print_success "Nmap did not detect nginx"
            fi
        fi
    else
        print_warning "nmap not available for testing"
    fi
}

test_rate_limiting() {
    print_status "Testing rate limiting configuration..."
    
    if ! command_exists curl; then
        print_error "curl is required for rate limiting testing"
        return 1
    fi
    
    print_status "Testing API rate limiting (sending multiple requests)..."
    local rate_limit_triggered=false
    
    for i in {1..15}; do
        local response
        response=$(curl -s -w "%{http_code}" -o /dev/null "http://${TEST_HOST}:${TEST_HTTP_PORT}/api/test" 2>/dev/null || echo "000")
        
        if [[ "$response" == "429" ]]; then
            rate_limit_triggered=true
            break
        fi
        sleep 0.1
    done
    
    if [[ "$rate_limit_triggered" == true ]]; then
        print_success "Rate limiting is working (429 status received)"
    else
        print_warning "Rate limiting may not be configured or threshold not reached"
    fi
}

generate_report() {
    echo
    echo -e "${BLUE}Stealth Configuration Test Report${NC}"
    echo "=================================="
    echo "Test completed at: $(date)"
    echo "Target: ${TEST_HOST}:${TEST_HTTP_PORT}, ${TEST_HOST}:${TEST_HTTPS_PORT}"
    echo
    echo -e "${GREEN}Recommendations:${NC}"
    echo "1. Regularly test stealth configuration with external tools"
    echo "2. Monitor logs for any nginx version disclosure attempts"
    echo "3. Keep nginx and system packages updated"
    echo "4. Consider implementing additional security measures like WAF"
    echo "5. Use real SSL certificates in production environments"
    echo
    echo -e "${YELLOW}Additional Tools for Testing:${NC}"
    echo "- whatweb: sudo apt install whatweb"
    echo "- nmap: sudo apt install nmap"
    echo "- nikto: sudo apt install nikto"
    echo "- Online tools: securityheaders.com, ssllabs.com"
}

main() {
    echo -e "${BLUE}Nginx Stealth Configuration Test Suite${NC}"
    echo "======================================="
    echo
    
    local test_passed=0
    local test_failed=0
    
    if test_nginx_config; then ((test_passed++)); else ((test_failed++)); fi
    if test_nginx_running; then ((test_passed++)); else ((test_failed++)); fi
    
    test_http_headers
    test_https_headers
    test_error_pages
    test_ssl_config
    test_with_external_tools
    test_rate_limiting
    
    generate_report
    
    echo
    if [[ $test_failed -eq 0 ]]; then
        print_success "All critical tests passed!"
    else
        print_warning "$test_failed critical tests failed"
    fi
    
    echo "Tests passed: $test_passed"
    echo "Tests failed: $test_failed"
}

main "$@"
