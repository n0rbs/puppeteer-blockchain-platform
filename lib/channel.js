require('dotenv').config();
const DEBUG = process.env.DEBUG && process.env.DEBUG === 'true';

const log = require('color-logs')(true, DEBUG, '');

class Channel {
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
    await this.app.openMainTab('/channels', { wait: 6 });
  }

  async createChannel ({ channelName: name, policy, orderer, msp}) {
    const { pwrap } =  this.page;

    const { displayName } = orderer;
    const { mspId, displayName: dnOrg, identityName } = msp;

    await this.start();

    log.debug(`Create channel "${name}"`);
    await pwrap.wait(5000);

    await pwrap.click('btn-channels-create_channel');
    await pwrap.wait(5000);
    await pwrap.clickByRef('.ibp-button-container button:last-child', 5000);

    await pwrap.click('channelModal-details-channelName');
    await pwrap.wait(3000);
    await pwrap.typeIn('channelModal-details-channelName', name, 200);
    await pwrap.wait(1000);

    await pwrap.click('selectedOrderer', 1000);
    await pwrap.wait(1000);
    await pwrap.clickByRef(`#selectedOrderer__menu div[title="${displayName}"]`, 3000);
    await pwrap.wait(5000);
    await pwrap.clickByRef('.ibp-button-container button:last-child', 1000);

    await pwrap.click('selectedOrg', 1000);
    await pwrap.wait(1000);
    await pwrap.clickByRef(`#selectedOrg__menu div[title="${dnOrg} (${mspId})"]`, 3000);
    await pwrap.click('btn-add-org', 1000);
    await pwrap.wait(3000);
    await pwrap.clickByRef('label[for="ibp-add-orgs-msp-0-role-admin"]');

    await pwrap.wait(5000);
    await pwrap.clickByRef('.ibp-button-container button:last-child', 1000);

    await pwrap.click('customPolicy', 1000);
    await pwrap.wait(1000);
    await pwrap.clickByRef(`#customPolicy__menu div[title="${policy}"]`, 3000);
    await pwrap.wait(5000);
    await pwrap.clickByRef('.ibp-button-container button:last-child', 1000);

    await pwrap.click('selectedChannelCreator', 1000);
    await pwrap.wait(1000);
    await pwrap.clickByRef(`#selectedChannelCreator__menu div[title="${dnOrg} (${mspId})"]`, 3000);
    await pwrap.click('selectedIdentity', 4000);
    await pwrap.wait(1000);
    await pwrap.clickByRef(`#selectedIdentity__menu div[title="${identityName}"]`, 3000);
    await pwrap.wait(5000);
    await pwrap.clickByRef('.ibp-button-container button:last-child', 1000);
    
    await pwrap.wait(5000);
    await pwrap.clickByRef('.ibp-button-container button:last-child', 1000);
  }

  async addPeerToChannel ({ channelName: name, orderer, peer }) {
    const { pwrap, pRef } =  this.page;

    // const { dnOrderer } = orderer;
    const { displayName: dnPeer } = peer;

    await this.start();

    log.debug(`Add peer to channel "${name}"`);

    await pwrap.clickByRef('#notifications-container .cm-notification-close-btn', 1000);

    const res = await this.app.selectEntryList(name, 'ibp__channels--container', { fromParag: true });
    if (res) {
      await pwrap.wait(30000);

      let bCont = 1;
      let location = 0;
      while (bCont > 0) {
        try {
          const temp = await pRef.$eval(`.ibp-form-input label:nth-child(${bCont}) span:last-child`, el => el.innerText);
          if (temp.indexOf(dnPeer) > -1) {
            await pwrap.clickByRef(`.ibp-form-input label:nth-child(${bCont})`, 500);
            location = bCont;
            bCont = -2;
          }
          bCont++;
        } catch (err) {
          log.error(err.toString());
          bCont = 0;
        }      
      }
      if (bCont === -1) {
        await pwrap.click('submit', 3000);
        await pwrap.wait(30000);
      }
    }
  }

}

module.exports = Channel;
