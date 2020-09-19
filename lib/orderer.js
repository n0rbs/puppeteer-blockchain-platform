require('dotenv').config();
const DEBUG = process.env.DEBUG && process.env.DEBUG === 'true';

const log = require('color-logs')(true, DEBUG, '');

class Orderer {
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
    await this.app.openMainTab('/nodes', { wait: 6 });
    await this.app.openMainTab('/nodes');
  }

  async deleteOrderer (data, config = {}) {
    const { pwrap } =  this.page;
    const { orderer: { displayName }, msp: { identityName }, skip = true } = data;
    const { setIdentity = false } = config;

    await this.start();

    if (setIdentity) {
      await this.app.openMainTab('/wallet', { wait: 5 });
      await this.identity.uploadIdentity({ file: `${identityName}_identity.json` })
      await this.app.openMainTab('/nodes', { wait: 8 });
    }

    log.info(`Deleting orderer "${displayName}"`);

    await pwrap.wait(10000);
    const res = await this.app.selectEntryList(displayName, 'ibp__orderers--container');
    if (res) {
      await pwrap.wait(2000);

      //TODO: Associate admin identity
      // await pwrap.click('no-identity-button');
      // await pwrap.click('identity_osmsp', 2000);
      // await pwrap.wait(1500);

      // await pwrap.clickByRef(`#identity_osmsp__menu div[title="${identityName}"]`, 1000);

      // await pwrap.click('associate_identity');
      // await pwrap.wait(20000);  

      await pwrap.clickByRef('.ibp-node-detail-icons button:last-child');
      await pwrap.wait(10000);
      
      await pwrap.click('ordererModal-remove-confirm_orderer_name', 1000);
      await pwrap.typeIn('ordererModal-remove-confirm_orderer_name', displayName, 200);
      await pwrap.wait(10000);
      await pwrap.click('confirm_remove');
      await pwrap.wait(15000);
      await pwrap.click('confirm_remove');
      await pwrap.wait(5000);
    }
  }

  async createOrderer (data) {
    const { pwrap } =  this.page;
    const {
      ca: { displayName: dnCA, identities },
      orderer: { displayName: dnOrd, version },
      msp: { displayName: dnMSP, identityName },
      nodes: nodeCount = 1,
    } = data;
    const [,, ordererIdentity] = identities;
    const { enrollId, enrollSecret } = ordererIdentity;
    const nodes = (nodeCount === 1 || nodeCount === 5 ? nodeCount : 1);

    await this.start();

    log.info(`Creating orderer ${dnOrd}`);

    await pwrap.click('btn-orderers-add_orderer', 3000);
    await pwrap.clickByRef('label[for="ibm_saas"]', 1000);
    await pwrap.click('next', 1000);
    await pwrap.wait(1500);

    await pwrap.typeIn('importSaasOrderer-display_name', dnOrd, 200);
    await pwrap.wait(1500);

    await pwrap.clickByRef(`#importRaftOrderer-raft_nodes label[for="${nodes}"]`, 500);

    await pwrap.click('next', 1000);

    await pwrap.click('saas_ca', 1000);
    await pwrap.wait(1500);
    await pwrap.clickByRef(`#saas_ca__menu div[title="${dnCA}"]`, 1000);
    await pwrap.wait(2000);

    await pwrap.click('saasCA-enroll_id', 1000);
    await pwrap.wait(1500);
    await pwrap.clickByRef(`#enroll_id__menu div[title="${enrollId}"]`, 1000);
    await pwrap.typeIn('saasCA-enroll_secret', enrollSecret, 200);
    
    await pwrap.wait(2000);
    await pwrap.click('admin_msp', 1000);
    await pwrap.wait(1500);
    await pwrap.clickByRef(`#admin_msp__menu div[title="${dnMSP}"]`, 1000);

    await pwrap.wait(2000);
    await pwrap.click('version', 1000);
    await pwrap.wait(1500);
    await pwrap.clickByRef(`#version__menu div[title="${version}"]`, 1000);
    await pwrap.wait(1500);
    await pwrap.click('next', 1000);

    await pwrap.click('importOrdererModal-identity', 1000);

    // await pwrap.click('identity', 1000);
    await pwrap.wait(2000);
    await pwrap.clickByRef(`#identity__menu div[title="${identityName}"]`, 1000);
    await pwrap.click('next');

    await pwrap.click('submit', 3000);

    await this.app.waitToFinish(360);
  }

  async addOrgToOrderer (data) {
    const { pwrap } =  this.page;
    const { orderer: { displayName }, msp: { mspId, displayName: dnOrg } } = data;

    await this.start();

    log.info(`Add org ${dnOrg} to orderer ${displayName}`);

    await this.app.waitToFinish(10);

    await pwrap.clickByRef('#notifications-container .cm-notification-close-btn', 1000);

    const res = await this.app.selectEntryList(displayName, 'ibp__orderers--container');
    if (res) {
      await pwrap.wait(10000);

      await pwrap.click('btn-orderer-members-add_organization', 3000);
      await pwrap.click('btn-orderer-members-add_organization', 3000);
      await pwrap.wait(2000);
      await pwrap.click('add-msp-dropdown', 1000);
      await pwrap.wait(1500);

      await pwrap.clickByRef(`#add-msp-dropdown__menu div[title="${dnOrg} (${mspId})"]`, 3000);
      await pwrap.wait(5000);

      await pwrap.click('submit', 1000);
    }

    await this.app.waitToFinish(20);
  }

  async removeOrgFromOrderer (data) {
    const { pwrap } =  this.page;

    const { orderer: { displayName }, msp: { mspId, displayName: dnOrg } } = data;

    await this.start();

    log.info(`Remove org ${dnOrg} from orderer ${displayName}`);
    await pwrap.wait(10000);

    const res = await this.app.selectEntryList(displayName, 'ibp__orderers--container');
    if (res) {
      await pwrap.wait(5000);
      const position = await this.app.selectEntryList(mspId, 'ibp-orderer-member-container', { blnLoc: true});
      if (position > 0) {
        await pwrap.clickByRef('.ibp-orderer-member-container ');
        await pwrap.clickByRef(`.ibp-orderer-member-container .ibp-container-grid-box .ibp-container-tile:nth-child(${position}) .ibp-orderer-member-delete`, 500);
        await pwrap.wait(2000);

        await pwrap.click('mspDeleteModal-remove-confirm_msp_name', 1000);
        await pwrap.typeIn('mspDeleteModal-remove-confirm_msp_name', dnOrg, 200);
  
        await pwrap.click('confirm_remove', 1000);
      }
    }

    await this.app.waitToFinish(20);
  }
}

module.exports = Orderer;