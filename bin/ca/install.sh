#!/usr/bin/env bash

cd "$(dirname "$0")/../../ca"
source .env
DIR="$(pwd)"

#from https://github.com/filosottile/mkcert#linux
sudo apt-get install -y --no-install-recommends --no-install-suggests \
            libnss3-tools \
            golang-go

if [ ! -d "/opt/mkcert" ]; then
    cd /opt
    sudo mkdir -p /opt/mkcert
    sudo chown -R $(whoami):$(whoami) /opt/mkcert
    cd /opt/mkcert
    git clone git@github.com:filosottile/mkcert.git .
else
    cd /opt/mkcert
fi
go build -ldflags "-X main.Version=$(git describe --tags)"
sudo rm /usr/local/bin/mkcert
sudo ln -s /opt/mkcert/mkcert /usr/local/bin/mkcert

cd "$DIR"
export CAROOT="$DIR"
rm cert.pem
rm key.pem
rm -f rootCA-key.pem
rm rootCA.pem
mkcert -install
mkcert -key-file "$EXPERIMENT_MALU_WEBRTC_CA_KEY" -cert-file "$EXPERIMENT_MALU_WEBRTC_CA_CERT" "$EXPERIMENT_MALU_WEBRTC_CA_HOST"
