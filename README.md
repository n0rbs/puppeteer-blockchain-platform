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
# URLs of your IBP v2 application
URL=<YOUR_BLOCKCHAIN_PLATFORM_SERVICE_URL>
USERNAME=xyz@ibm.com
PASSWORD=letmein213
LOGIN=IBM
MODE=1
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
