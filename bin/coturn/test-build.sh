#!/usr/bin/env bash

cd /opt/coturn/examples
#https://github.com/coturn/coturn/blob/master/docs/Testing.md
./run_tests_rfc5780.sh
./run_tests_conf.sh
