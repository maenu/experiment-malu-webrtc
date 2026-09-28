#!/usr/bin/env bash

docker stop $(cat /var/tmp/peerjs.cid) && rm /var/tmp/peerjs.cid
