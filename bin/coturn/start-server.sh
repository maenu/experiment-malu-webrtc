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
