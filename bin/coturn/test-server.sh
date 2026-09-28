#!/usr/bin/env bash

HOST="$(hostname --fqdn)"
COTURN_IP=$(dig +short "${HOST}" | head -n1)

turnutils_uclient -S -s -n 1000 -m 10 -l 170 -g -u "${HOST}" -w "${HOST}" -y "${@}" "${COTURN_IP}"
