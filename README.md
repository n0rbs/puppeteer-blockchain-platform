# Puppeteer - Blockchain Platform


Automate the provisioning of Blockchain Platform by using Puppeteer.

## Provision Blockchain Platform

### Kubernetes and Blockchain Platform service
Provision a free kubernetes cluster and link your Blockchain Platform service to the free cluster. https://cloud.ibm.com/docs/blockchain?topic=blockchain-ibp-console-overview

## Install

### Install node and app dependencies
```bash
nvm install 10.16.0 # Install node version 10.xx.xx

cd puppeteer-blockchain-platform
npm install
```

## Configure

Create `.env` file to store app config:


```bash
# Your IBM Cloud Blockchain Platform service console URL
URL=https://561xxxxxxxxxxxx.ibpconsole-console.uss02.blockchain.cloud.ibm.com
USERNAME=xyz@ibm.com
PASSWORD=letmein213
# IBM Cloud authentication
LOGIN=IBM
# Test data - MODE (0, 1, 2, 3) Check ./data/data.json
MODE=2

# DEBUG=true
```

## Run

```bash
npm start
```

### Development or debugging mode
```bash
npm i -g nodemon
nodemon server.js
```
