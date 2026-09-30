#!/usr/bin/env bash

cd "$(dirname "$0")/../../ca"
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

HOST="$(hostname --fqdn)"
USER="$(whoami)"
export CAROOT="$DIR"

rm cert.pem
rm key.pem
rm -f rootCA-key.pem
rm rootCA.pem
mkcert -install
mkcert -key-file key.pem -cert-file cert.pem "$HOST"

#rm key.pem cert.pem
#openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365 -subj "/C=CH/ST=Bern/L=Zollikofen/O=GEWA/OU=digihub/CN=${HOST}/emailAddress=${USER}@${HOST}"
