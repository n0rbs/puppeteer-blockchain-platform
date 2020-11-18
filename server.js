const data = require('./data/data.json');
const Libs = {
  App: require('./lib/app'),
  Auth: require('./lib/auth'),
  Identity: require('./lib/identity'),
  CA: require('./lib/ca'),
  MSP: require('./lib/msp'),
  Peer: require('./lib/peer'),
  Orderer: require('./lib/orderer'),
  Channel: require('./lib/channel'),
  SmartContract: require('./lib/smartcontract'),
};
require('dotenv').config();
const {
  USERNAME: username, PASSWORD: password,
  BROWSER_PATH: browserPath = null, HEADLESS = 'false',
  URL: url, LOGIN: login, MODE = 0,
} = process.env;

const runIBPcreate = async () => {
  const headless = HEADLESS === 'true';
  const {
    App, Auth, Identity, CA,
    MSP, Peer, Orderer, Channel,
    SmartContract,
  } = Libs;

  const app = new App({ url, browserPath, headless });
  await app.init();

  const auth = new Auth(app, { login });
  const identity = new Identity(app, { source: '~/Downloads', destination: 'wallet' });
  const ca = new CA(app, { identity });
  const msp = new MSP(app, { identity });
  const peer = new Peer(app, { identity });
  const orderer = new Orderer(app, { identity });
  const channel = new Channel(app, { identity });

  const { org: tempDataOrg, orderer: tempDataOrderer, channel: tempDataChannel } = data;

  const dataOrg = tempDataOrg[MODE];
  const dataOrderer = tempDataOrderer[MODE];
  const dataChannel = tempDataChannel[MODE];

  if (login === 'IBM') {
    await auth.loginIBM({ username, password });
  } else if (login === 'SSO') {
    await auth.loginSSO({ username, password });
  } else {
    await auth.loginIBPSoftware({ username, password });
  }

  // await auth.startup();
  await identity.clearAllIdentities();
  // await identity.uploadIdentities();

  const { ca: orgCA, msp: orgMSP, peer: orgPeer } = dataOrg;
  const { ca: ordererCA, msp: ordererMSP, orderer: ordererNode } = dataOrderer;
  const { name: tempChannel, policy } = dataChannel;
  const channelName = `${tempChannel}${parseInt(Math.random() * 100, 10)}`;

  await ca.deleteCA({ ...orgCA });
  await ca.createCA({ ...orgCA });
  await msp.deleteMSP({ ...orgMSP });
  await msp.createMSP({ ...dataOrg });
  await peer.deletePeer({ ...dataOrg });
  await peer.createPeer({ ...dataOrg });

  await ca.deleteCA({ ...ordererCA });
  await ca.createCA({ ...ordererCA });
  await msp.deleteMSP({ ...ordererMSP });
  await msp.createMSP({ ...dataOrderer }); 
  await orderer.deleteOrderer({ ...dataOrderer });
  await orderer.createOrderer({ ...dataOrderer });

  await orderer.removeOrgFromOrderer({ orderer: ordererNode, msp: orgMSP });
  await orderer.addOrgToOrderer({ orderer: ordererNode, msp: orgMSP });

  // await channel.createChannel({ orderer: ordererNode, channelName, policy, msp: orgMSP });
  // await channel.addPeerToChannel({ orderer: ordererNode, channelName, peer: orgPeer });
};

const run = async () => {
  await runIBPcreate();
};

run();