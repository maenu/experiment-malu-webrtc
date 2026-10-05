#!/usr/bin/env bash

cd "$(dirname "$0")/../.."
source .env

turnutils_uclient -S -s -n 1000 -m 10 -l 170 -g -u "$EXPERIMENT_MALU_WEBRTC_COTURN_USER" -w "$EXPERIMENT_MALU_WEBRTC_COTURN_PASSWORD" -y "$@" "$EXPERIMENT_MALU_WEBRTC_COTURN_IP"
