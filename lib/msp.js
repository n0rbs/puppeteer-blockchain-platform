require('dotenv').config();
const DEBUG = process.env.DEBUG && process.env.DEBUG === 'true';

const log = require('color-logs')(true, DEBUG, '');

class MSP {
  constructor(app, { identity = null }) {
    this.app = app;
    this.page = {
      pwrap: this.app.getPage(),
      pRef: this.app.getPageRef(),
    };
    this.identity = identity;
  }

  async deleteMSP (msp = {}) {
    const { pwrap } =  this.page;
    const { displayName } = msp;

    await this.app.openMainTab('/organizations');
    await this.app.openMainTab('/organizations', { wait: 10 });
    await this.app.openMainTab('/organizations');

    log.info(`Deleting MSP "${displayName}"`);

    await pwrap.wait(2000);

    await pwrap.clickByRef('.ibp-title-bar-container-header');
    await pwrap.clickByRef('.ibp-title-bar-container-header');
    const res = await this.app.selectEntryList(displayName, 'ibp__msps--container');
    if (res) {
      await pwrap.wait(2000);

      await pwrap.clickByRef('.ibp-node-detail-icons button:last-child');
      // await pwrap.click('MSP-sticky-delete-button');
      
      // await pwrap.typeIn('mspDefinitionDeleteModal-remove-confirm_msp_name', displayName, 200);
      await pwrap.typeIn('MSPDefinitionModal-remove-confirm_msp_name', displayName, 200);
      
      await pwrap.click('confirm_remove', 1000);
    }
    if (res) {
      await this.identity.clearIdentity(msp)
    }
  }

  async createMSP (data) {
    const { pwrap, pRef } =  this.page;
    const {
      msp: { displayName : dnMSP, mspId, identityName },
      ca: { displayName : dnCA, identities },
      msp,
    } = data;
    const [,adminIdentity] = identities;
    const { enrollId, enrollSecret } = adminIdentity;

    await this.app.openMainTab('/organizations');
    await this.app.openMainTab('/organizations', { wait: 10 });
    await this.app.openMainTab('/organizations');

    log.info(`Creating MSP "${dnMSP}"`);

    await pwrap.click('btn-msps-create_msp_definition', 1000);
    // await pwrap.click('btn-msps-create_msp_definition', 1000);
    await pwrap.wait(3000);
    
    await pwrap.typeIn('generateMSP-details-msp_name', dnMSP, 100);
    await pwrap.typeIn('generateMSP-details-msp_id', mspId, 100);

    await pwrap.clickByRef('#generateMSPModal .ibp-button-container button:last-child');

    await pwrap.click('selectedRootCA', 3000);
    await pwrap.wait(1500);
    await pwrap.clickByRef(`#selectedRootCA__menu div[title="${dnCA}"]`, 3000);
    await pwrap.wait(5000);
 
    await pwrap.clickByRef('#generateMSPModal .ibp-button-container button:last-child');
    await pwrap.wait(3000);

    await pwrap.click('enroll_id');
    await pwrap.wait(5000);
    await pwrap.clickByRef(`#enroll_id__menu div[title="${enrollId}"]`);
    await pwrap.wait(5000);

    await pwrap.typeIn('generateMSP-enroll_secret', enrollSecret, 200);
    await pRef.$eval('#generateMSP-identity_name', el => el.value = '');
    await pwrap.typeIn('generateMSP-identity_name', identityName, 200);

    await pwrap.click('btn-generate-certificate');
    await pwrap.wait(8000);

    await pwrap.clickByRef('#generateMSPModal .ibp-button-container button:last-child');

    await pwrap.wait(2000);

    await pwrap.clickByRef('#generateMSPModal .ibp-button-container button:last-child');

    await this.app.waitToFinish(5);
    await this.identity.exportIdentity(msp);
  }
}

module.exports = MSP;