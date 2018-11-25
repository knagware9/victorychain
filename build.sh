#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e

# Grab the current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd ${DIR}/victorychain
printf "======================= Building Fabric Network =======================\n"
./startFabric.sh node

printf "======================= Installing nodejs packages for business logic =======================\n"
npm install

cd ${DIR}/chaincode/victorychain/node
printf "======================= Installing nodejs packages for the chaincode =======================\n"
npm install

cd ${DIR}/victorychain
printf "======================= Enroll admin =======================\n"
node enrollAdmin.js
printf "======================= Register user =======================\n"
node registerUser.js

cd ${DIR}/api
printf "======================= Installing nodejs packages for the API =======================\n"
npm install
printf "======================= Start Nodejs server (API) =======================\n"
nodemon ./app.js
