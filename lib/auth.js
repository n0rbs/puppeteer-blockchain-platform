require('dotenv').config();
const DEBUG = process.env.DEBUG && process.env.DEBUG === 'true';

const log = require('color-logs')(true, DEBUG, '');

class Auth {
  constructor(app, { login = 'IBM' } = {}) {
    this.app = app;
    const authOption = {
      IBM: { name: 'loginIBM', delay: 25 }, 
      SSO: { name: 'loginSSO' },
      SW: { name: 'loginIBPSoftware', delay: 10 },
    };
    this.loginMode = authOption[login];
  }
  /**
   * Log in to the SSO login page
   * @param {object} username, password
   */
  async loginSSO({ username = '', password }) {
    const pwrap = this.app.getPage();

    log.info(`IBM SSO Auth`);

    await pwrap.click('username');
    await pwrap.typeIn('username', username);
    await pwrap.click('continue-button');

    await pwrap.click('desktop');
    await pwrap.typeIn('desktop', username, 100);
    await pwrap.wait(2000);

    await pwrap.typeInByRef('input[name=password]', password);

    await pwrap.pressByRef('button[type=submit]');
  }
  /**
   * Log in to IBM portal
   * @param {object} username, password
   */
  async loginIBM({ username = '', password }) {
    const pwrap = this.app.getPage();

    log.info(`IBM Auth`);

    await pwrap.click('username');
    await pwrap.typeIn('username', username);
    await pwrap.click('continue-button');

    await pwrap.typeInByRef('input[name=password]', password);
    await pwrap.pressByRef('button[type=submit]');
    await pwrap.wait(8000);
  }
  /**
   * Log in via the IBP software login page
   * @param {object} username, password
   */
  async loginIBPSoftware({ username = '', password }) {
    const pwrap = this.app.getPage();

    log.info(`IBP Auth`);

    await pwrap.click('login-form-email');
    await pwrap.typeIn('login-form-email', username);
  
    await pwrap.click('login-form-login_password');
    await pwrap.typeIn('login-form-login_password', password);
  
    await pwrap.click('login');
  
    await pwrap.clickByRef('#ibp--template-side-panel-container button');
  }
  async authenticate(username, password) {
    console.log(this.loginMode);
    if (this.loginMode.name === 'loginIBM') {
      return this.loginIBM({ username, password });
    } else if (this.loginMode.name === 'loginSSO') {
      return this.loginSSO({ username, password });
    } else {
      return this.loginIBPSoftware({ username, password });
    }
  }
  /**
   * Perform actions during startup
   */
  async startup() {
    const pwrap = this.app.getPage();

    log.info(`Start up`);

    const { delay = 20 } = this.loginMode;
    await pwrap.wait(delay * 1000);
    await pwrap.click('lets_get_started');  
    await pwrap.wait(5000);
  }
}
module.exports = Auth;