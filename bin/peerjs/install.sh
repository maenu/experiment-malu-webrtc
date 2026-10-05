#!/usr/bin/env bash

cd "$(dirname "$0")/../.."

sudo cp bin/peerjs/experiment-malu-webrtc-peerjs.service /etc/systemd/system/
sudo systemctl daemon-reload
