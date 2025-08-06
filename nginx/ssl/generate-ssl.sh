#!/bin/bash


set -e

SSL_DIR="/etc/ssl"
CERT_DIR="${SSL_DIR}/certs"
KEY_DIR="${SSL_DIR}/private"
CERT_FILE="${CERT_DIR}/nginx-selfsigned.crt"
KEY_FILE="${KEY_DIR}/nginx-selfsigned.key"

mkdir -p "${CERT_DIR}" "${KEY_DIR}"

openssl genrsa -out "${KEY_FILE}" 4096

openssl req -new -x509 -key "${KEY_FILE}" -out "${CERT_FILE}" -days 365 -subj "/C=US/ST=State/L=City/O=Organization/OU=IT Department/CN=localhost"

chmod 600 "${KEY_FILE}"
chmod 644 "${CERT_FILE}"
chown nginx:nginx "${KEY_FILE}" "${CERT_FILE}" 2>/dev/null || true

echo "SSL certificates generated successfully:"
echo "Certificate: ${CERT_FILE}"
echo "Private Key: ${KEY_FILE}"
echo ""
echo "For production use, replace these self-signed certificates with"
echo "certificates from a trusted Certificate Authority (CA)."
echo ""
echo "To use Let's Encrypt certificates:"
echo "1. Install certbot: apt-get install certbot python3-certbot-nginx"
echo "2. Generate certificate: certbot --nginx -d yourdomain.com"
echo "3. Update nginx.conf to use the new certificate paths"
