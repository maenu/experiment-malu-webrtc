#!/usr/bin/env bash

#from https://github.com/coturn/coturn/blob/master/docker/coturn/debian/Dockerfile
sudo apt-get update \
    && sudo apt-get install -y --no-install-recommends --no-install-suggests \
            autoconf ca-certificates coreutils g++ git libtool make pkg-config \
    && sudo update-ca-certificates
sudo apt-get install -y --no-install-recommends --no-install-suggests \
            libevent-dev \
            libssl-dev \
            libpq-dev libmariadb-dev libsqlite3-dev sqlite3 \
            libhiredis-dev \
            libmongoc-dev \
            libmicrohttpd-dev

if [ ! -d "/opt/coturn" ]; then
    cd /opt
    sudo mkdir -p /opt/coturn
    sudo chown -R $(whoami):$(whoami) /opt/coturn
    cd /opt/coturn
    git clone git@github.com:coturn/coturn.git .
else
    cd /opt/coturn
fi
./configure
make
sudo make install
