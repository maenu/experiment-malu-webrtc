#!/usr/bin/env bash

cd "$(dirname "$0")/../.."

HOST="$(hostname --fqdn)"

docker run -p 9000:9000 --rm --mount type=bind,src="$(pwd)/ca",dst=/var/ca -d peerjs/peerjs-server \
    --port 9000 --key "${HOST}" --path '/peer' --cors "${HOST}" --cors "${HOST}:3000" --cors "${HOST}:9000" \
    --sslkey /var/ca/key.pem --sslcert /var/ca/cert.pem \
    | tee /var/tmp/peerjs.cid
