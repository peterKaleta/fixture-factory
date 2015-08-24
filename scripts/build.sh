#!/bin/bash
./node_modules/.bin/babel \
  --stage 0 \
  --ignore *.spec.js \
  --out-dir dist \
  src
