require('dotenv').config();
const DEBUG = process.env.DEBUG && process.env.DEBUG === 'true';

const log = require('color-logs')(true, DEBUG, '');

class SmartContract {
  constructor(app, { identity = null } = {}, config = {}) {
    const { location = 'cc' } = config;
    this.app = app;
    this.page = {
      pwrap: this.app.getPage(),
      pRef: this.app.getPageRef(),
    };
    this.identity = identity;
    this.srcLocation = location;
  }

  async start() {
    await this.app.openMainTab('/smart-contracts', { wait: 6 });
  }

  async installSmartContract ({ ccName }) {
    const { pwrap } =  this.page;

    log.info(`Install smart contract ${ccName}`);
    await pwrap.wait(5000);

    await pwrap.click('btn-chaincode-install_chaincode');

    const fileName = `${this.srcLocation}/${ccName}`;
    const inputUploadHandle = await pwrap.get('file-uploader-cds');
    inputUploadHandle.uploadFile(fileName);

    await pwrap.click('submit', 2000);
    await pwrap.wait(8000);
  }

  async instantiateSmartContract ({ ccName, channelName }) {
    const { pwrap, pRef } =  this.page;

    const [name, version] = ccName.split('@');

    log.info(`Instantiate smart contract ${name}`);
    await pwrap.wait(5000);

    let bCont = 1;
    let location = 0;
    while (bCont > 0) {
      try {
        const ccName = await pRef.$eval(`#table-chaincode tr:nth-child(${bCont}) td:first-child span`, el => el.innerText);
        const ccVersion = await pRef.$eval(`#table-chaincode tr:nth-child(${bCont}) td:nth-child(2) span`, el => el.innerText);
        if (ccName === name && ccVersion === version) {
          await pwrap.clickByRef(`#table-chaincode tr:nth-child(${bCont}) td:nth-child(4) button`, 500);
          await pwrap.click('instantiate_modal', 1000);
          location = bCont;
          bCont = -1;
        }
        bCont++;
      } catch (err) {
        console.log('Exit', err.toString());
        bCont = 0;
      }      
    }
    if (bCont === -1) { 
      await pwrap.click('selectedChannel', 3000);
      await pwrap.wait(1500);
      await pwrap.clickByRef(`#selectedChannel__menu div[title="${channelName}"]`, 3000);
      await pwrap.wait(2000);
      await pwrap.click('next', 1000);

      await pwrap.click('next', 1000);

      await pwrap.click('next', 1000);

      await pwrap.click('submit', 2000);
    }

    await this.app.waitToFinish(360);
  }
}

module.exports = SmartContract;