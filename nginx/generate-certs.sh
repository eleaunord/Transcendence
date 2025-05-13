#!/bin/sh

CERT_DIR="./nginx/certs"
mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_DIR/fullchain.pem" ] || [ ! -f "$CERT_DIR/privkey.pem" ]; then
  echo "🔧 Génération du certificat auto-signé..."
  openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout "$CERT_DIR/privkey.pem" \
    -out "$CERT_DIR/fullchain.pem" \
    -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=Transcendance/CN=localhost"
  echo "✅ Certificats créés dans $CERT_DIR"
else
  echo "✅ Certificats déjà présents"
fi
