require('dotenv').config();
const DEBUG = process.env.DEBUG && process.env.DEBUG === 'true';

const log = require('color-logs')(true, DEBUG, '');

class CA {
  constructor(app, { identity = null }) {
    this.app = app;
    this.page = {
      pwrap: this.app.getPage(),
      pRef: this.app.getPageRef(),
    };
    this.identity = identity;
  }

  async start() {
    await this.app.openMainTab('/nodes');
    await this.app.openMainTab('/nodes', { wait: 5 });
    await this.app.openMainTab('/nodes');
  }

  async createCA (data = {}) {
    const { displayName, identities, version } = data;
    const { pwrap } =  this.page;
    const { enrollId, enrollSecret } = identities[0];

    await this.start();

    log.info(`Creating CA "${displayName}"`);

    await pwrap.click('btn-cas-add_ca', 1000);
    await pwrap.click('btn-cas-add_ca', 1000);
    await pwrap.clickByRef('label[for="ibm_saas"]', 1000);
    await pwrap.click('next', 1000);

    await pwrap.typeIn('importCAModal-create-display_name', displayName, 200);
    await pwrap.typeIn('importCAModal-create-admin_id', enrollId, 200);
    await pwrap.typeIn('importCAModal-create-admin_secret', enrollSecret, 200);
    await pwrap.wait(2000);

    const fabricVersion = await pwrap.exists('importCAModal-version-version');
    if (fabricVersion) {
      await pwrap.click('importCAModal-version-version', 1000);
      await pwrap.wait(1500);
      await pwrap.clickByRef(`#version__menu div[title="${version}"]`, 1000);
      await pwrap.wait(2000);  
    }

    await pwrap.click('next', 1000);   
    await pwrap.click('submit', 1000);

    await this.app.waitToFinish(150);
    await this.identity.associateIdentities(data);
    await this.app.waitToFinish(15);
    await this.identity.exportIdentity(data);
  }

  async deleteCA ({ displayName, identityName } = {}) {
    const { pwrap } =  this.page;

    await this.start();
    
    log.info(`Deleting CA "${displayName}"`);

    await pwrap.wait(10000);
    const res = await this.app.selectEntryList(displayName, 'ibp__cas--container');
    if (res) {
      await pwrap.wait(2000);

      await pwrap.clickByRef('.ibp-node-detail-icons button:last-child');

      await pwrap.click('caModal-remove-confirm_ca_name', 1000);
      await pwrap.typeIn('caModal-remove-confirm_ca_name', displayName, 200);
      await pwrap.click('confirm_remove', 1000);

      await this.identity.clearIdentity({ identityName });
    }
  }
}

module.exports = CA;