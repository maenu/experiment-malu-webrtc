#!/usr/bin/env bash

cd "$(dirname "$0")/../.."

HOST="$(hostname --fqdn)"

docker run -p 9000:9000 --rm --mount type=bind,src="$(pwd)/ca",dst=/var/ca -d peerjs/peerjs-server \
    --port 9000 --cors "${HOST}" --key "${HOST}" --path /peer --allow_discovery \
    --sslkey /var/ca/key.pem --sslcert /var/ca/cert.pem \
    > /var/tmp/peerjs.cid
