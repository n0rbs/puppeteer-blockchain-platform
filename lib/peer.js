require('dotenv').config();
const DEBUG = process.env.DEBUG && process.env.DEBUG === 'true';

const log = require('color-logs')(true, DEBUG, '');

class Peer {
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

  async createPeer (data) {
    const { pwrap } =  this.page;
    const {
      ca: { displayName: dnCA, identities },
      peer: { displayName: dnPeer, version: versionPeer },
      msp: { displayName: dnMSP, identityName },
    } = data;
    const [,, peerIdentity] = identities;
    const { enrollId, enrollSecret } = peerIdentity;

    await this.start();

    log.info(`Creating peer ${dnPeer}`);

    await pwrap.click('btn-peers-add_peer', 1000);
    // await pwrap.click('btn-peers-add_peer', 1000);
    await pwrap.clickByRef('label[for="ibm_saas"]', 1000);
    await pwrap.click('next', 1000);

    await pwrap.typeIn('importSaasPeer-display_name', dnPeer, 200);
    await pwrap.click('next', 1000);

    await pwrap.click('saas_ca', 1000);
    await pwrap.wait(1500);
    await pwrap.clickByRef(`#saas_ca__menu div[title="${dnCA}"]`, 1000);
    await pwrap.wait(2000);

    await pwrap.click('saasCA-enroll_id', 1000);
    await pwrap.wait(1500);
    await pwrap.clickByRef(`#enroll_id__menu div[title="${enrollId}"]`, 1000);
    await pwrap.wait(1500);
    await pwrap.typeIn('saasCA-enroll_secret', enrollSecret, 200);
    
    await pwrap.wait(2000);
    await pwrap.click('admin_msp', 1000);
    await pwrap.wait(1500);
    await pwrap.clickByRef(`#admin_msp__menu div[title="${dnMSP}"]`, 1000);

    await pwrap.wait(2000);
    await pwrap.click('version', 1000);
    await pwrap.wait(1500);
    await pwrap.clickByRef(`#version__menu div[title="${versionPeer}"]`, 1000);
    await pwrap.wait(1500);
    await pwrap.click('next', 1000);

    await pwrap.click('importPeerModal-identity', 1000);

    // await pwrap.click('identity', 1000);
    await pwrap.wait(2000);
    await pwrap.clickByRef(`#identity__menu div[title="${identityName}"]`, 1000);
    await pwrap.wait(1500);
    await pwrap.click('next');

    await pwrap.click('submit', 3000);

    await this.app.waitToFinish(360);
  }

  async deletePeer (data) {
    const { pwrap } =  this.page;
    const { peer: { displayName } } = data;

    await this.start();

    log.info(`Deleting peer ${displayName}`);

    const res = await this.app.selectEntryList(displayName, 'ibp__peers--container');
    if (res) {
      await pwrap.wait(2000);

      await pwrap.clickByRef('.ibp-node-detail-icons button:last-child');

      await pwrap.click('peerModal-remove-confirm_peer_name', 1000);
      await pwrap.typeIn('peerModal-remove-confirm_peer_name', displayName, 200);
      await pwrap.click('confirm_remove', 1000);
    }
  }
}

module.exports = Peer;