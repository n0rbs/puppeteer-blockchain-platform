require('dotenv').config();
const DEBUG = process.env.DEBUG && process.env.DEBUG === 'true';

const log = require('color-logs')(true, DEBUG, '');

const { execSync } = require('child_process');
const { existsSync } = require('fs');

class Identity {
  constructor(app, config = { source = null, destination = null } = {}) {
    const { source, destination } = config;
    if (!source || !destination) {
      throw new Error('Identity "source" and "dest" required!');
    }
    this.app = app;
    this.destination = destination;
    this.source = source;
    this.page = {
      pwrap: this.app.getPage(),
      pRef: this.app.getPageRef(),
    };
  }

  async clearAllIdentities () {
    const { pwrap } = this.page;

    log.info(`Clear all identities`);

    const list = await execSync(`ls ${this.destination}`).toString().trim().split('\n');
    if (list.length < 1 || (list.length === 1 && list[0] === '')) {
      return;
    }
    for (let n = 0; n < list.length; n++) {
      const file = `${this.destination}/${list[n]}`.replace(/ /g, '\\ ');
      try {
        await execSync(`rm ${file}`);      
      } catch (err) {
        log.warning(`${file} - ${err.toString()}`);
      }
    }
    await pwrap.wait(2000); 
  }

  async clearIdentity ({ identityName = null }) {
    if (!identityName) {
      throw new Error('Please provide "identityName"');
    }
    log.info(`Clear identity "${identityName}"`);

    const file = `${this.destination}/${identityName}_identity.json`.replace(/ /g, '\\ ');

    if (existsSync(file)) {
      await execSync(`rm ${file}`);
    } else {
      log.warning(`${file} not found`);
    }
  }

  async associateIdentities ({ displayName, identities } = {}) {
    const { pwrap, pRef } = this.page;
    const [admin, org, peer] = identities;

    log.info(`Associate identities in "${displayName}"`);

    const res = await this.app.selectEntryList(displayName, 'ibp__cas--container');
    if (res) {
      await pwrap.wait(2000);

      await pwrap.click('no-identity-button', 1000);
      await pwrap.click('ibp-use-enroll-id', 3000);
      await pwrap.typeIn('caModal-identity-enroll_id', admin.enrollId, 200);
      await pwrap.wait(2000);
      await pwrap.typeIn('caModal-identity-enroll_secret', admin.enrollSecret, 200);
      await pRef.$eval('#caModal-identity-enroll_identity_name', el => el.value = '');
      await pwrap.click('caModal-identity-enroll_identity_name');
      await pwrap.typeIn('caModal-identity-enroll_identity_name', admin.displayName, 200);
      await pwrap.wait(5000);
      await pwrap.click('associate_identity');
      await pwrap.wait(5000);

      await pwrap.click('btn-ca_users-register_user', 5000);
      await pwrap.wait(1000);
      await pwrap.typeIn('addUser-enrollUser-enroll_id', org.enrollId, 200);
      await pwrap.wait(2000);
      await pwrap.typeIn('addUser-enrollUser-enroll_secret', org.enrollSecret, 200);      
      await pwrap.click('addUser-type');
      await pwrap.wait(1500);

      await pwrap.clickByRef('#type__menu div[title=admin]');
      await pwrap.wait(1500);
      await pwrap.click('next');
      await pwrap.click('submit', 1000);

      await pwrap.click('ibp-ca-usage', 5000);
      await pwrap.click('ibp-ca-detail-tab-root-ca');
      await pwrap.wait(5000);

      await pwrap.click('btn-ca_users-register_user', 5000);
      await pwrap.wait(1000);
      await pwrap.typeIn('addUser-enrollUser-enroll_id', peer.enrollId, 200);
      await pwrap.wait(2000);
      await pwrap.typeIn('addUser-enrollUser-enroll_secret', peer.enrollSecret, 200);      
      await pwrap.click('addUser-type');
      await pwrap.wait(1500);

      const { type = 'client' } = peer;
      await pwrap.clickByRef(`#type__menu div[title="${type}"]`);
      await pwrap.wait(1500);

      await pwrap.click('next');
      await pwrap.click('submit', 1000);
    }
  }

  async exportIdentity ({ identityName }) {
    const { pwrap, pRef } = this.page;

    await this.app.openMainTab('/wallet', { wait: 10 });

    log.info(`Exporting "${identityName}"`);

    const res = await this.app.selectEntryList(identityName, 'ibp-identities-section');
    if (res) {
      await pRef._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: `./${this.destination}`
      });
      await pwrap.click('export');

      await pwrap.wait(3000);
      // const file = `${identityName}_identity.json`.replace(/ /g, '\\ ');
      // await execSync(`mv ${this.source}/${file} ${this.destination}/`);
      await pwrap.click('close');
    }
  }

  async uploadIdentity ({ file }) {
    const { pwrap } = this.page;
    const filePath = `${walletDir}/${file}`;

    log.info(`Uploading "${filePath}"`);

    await pwrap.wait(2000);
    await pwrap.click('btn-identities-add_identity');
    await pwrap.click('addIdentity-json-upload');
    const inputUploadHandle = await pwrap.get('addIdentity-upload');
    inputUploadHandle.uploadFile(filePath);
    await pwrap.click('add_identity');
  }

  async uploadIdentities() {
    const { pwrap } = this.page;

    await this.app.openMainTab('/nodes', { wait: 5 });
    await this.app.openMainTab('/wallet', { wait: 5 });

    log.info(`Uploading all identities`);

    const list = await execSync(`ls ${this.destination}/`).toString().trim().split('\n');
    for (let n = 0; n < list.length; n++) {
      await this.uploadIdentity({ file: `${this.destination}/${list[n]}` });
    }
    await pwrap.wait(2000);
  }
}

module.exports = Identity;