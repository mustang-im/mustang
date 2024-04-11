#!/bin/bash

# This is the git checkout directory
cd /mustang/

(cd app/; yarn)
(cd backend/; yarn)
(cd lib/jpc-ws/; yarn)
(cd e2/; yarn)
cp app/node_modules/olm/olm.wasm app/public/olm.wasm

cd e2/
yarn run build:win
