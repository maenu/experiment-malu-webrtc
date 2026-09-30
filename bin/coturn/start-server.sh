#!/usr/bin/env bash

cd "$(dirname "$0")/../.."

HOST="$(hostname --fqdn)"
COTURN_IP=$(dig +short "${HOST}" | head -n1)

turnserver --syslog --log-file=stdout -v -m 4 \
    --listening-ip="${COTURN_IP}" --relay-ip="${COTURN_IP}" --external-ip="${COTURN_IP}" \
    --cert ca/cert.pem --pkey ca/key.pem --dtls \
    --lt-cred-mech --realm="${HOST}" \
    --min-port=49152 --max-port=49272 \
    --user="${HOST}:${HOST}" \
    --cli-password="${HOST}" \
    --pidfile=/var/tmp/turnserver.pid \
    "${@}"

#    --web-admin \
#    --web-admin-ip=127.0.0.1 \
#    --web-admin-port=8080 \
#    --cli-ip=127.0.0.1 \
#    --cli-port=5766 \
#    --cli-password=dev-malu
