require('dotenv').config();
const DEBUG = process.env.DEBUG && process.env.DEBUG === 'true';

const log = require('color-logs')(true, DEBUG, '');
const puppeteer = require('puppeteer');
const Helper = require('../util/helper');

class App {
  constructor(config) {
    const { browserPath = null, headless, url = null } = config;

    if (!url) {
      throw new Error('Please provide the "URL"');
    }

    this.pageWrap = null;
    this.browser = null;
    this.pageRef = null;
    this.url = url;
    this.options = {
      args: ['--ignore-certificate-errors'],
      headless,
      waitUntil: 'domcontentloaded',
    };
    if (browserPath) {
      this.options.executablePath = browserPath;
    }
  }
  async init() {
    this.browser = await puppeteer.launch(this.options);
    const page = await this.browser.newPage();
    page.setViewport({
      width: 1200,
      height: 900,
      deviceScaleFactor: 3,
    });
    await page.goto(this.url);
    this.pageRef = page;
    this.pageWrap = new Helper(page);
    log.info(`Initializing ${this.url}`);
  }
  getPage() {
    return this.pageWrap;
  }
  getPageRef() {
    return this.pageRef;
  }
  /**
   * Terminate browser session
   */
  async endSession() {
    await this.browser.close();
  }
  /**
   * Close welcome screen
   */
  async closeWelcome() {
    log.info(`Close welcome screen`);
    await this.pageWrap.pressByRef('.ibp-button');
  }
  /**
   * Open console main tabs
   * @param {string} route
   * @param {object} param1 - "delay" and "wait" arguments
   */
  async openMainTab (route, { delay = 3000, wait = 2 } = {}) {
    log.debug(`Opening tab "${route}" - ${wait} sec wait`);
    await this.pageWrap.clickByRef(`a[href="${route}"]`, delay);
    await this.pageWrap.wait(wait * 1000);
  }
  /**
   * Iterate through the dropdown list
   * @param {string} name - Class name of menu list
   * @param {string} parent - Class name of parent container
   * @param {object} param2 - Configuration
   */
  async selectEntryList(
    name, parent, { blnLoc = false, fromParag = false, click = true } = {}
  ) {
    let bCont = 1;
    let location = 0;
    while (bCont > 0) {
      try {
        const childTree = fromParag ? `p` : 'h4';
        const temp = await this.pageRef.$eval(`.${parent} .ibp-container-grid-box .ibp-container-tile:nth-child(${bCont}) ${childTree}`, el => el.innerText);
        // console.log('>>', temp, '===', name);
        if (temp.indexOf(name) > -1) {
          if (click) {
            await this.pageWrap.clickByRef(`.${parent} .ibp-container-grid-box .ibp-container-tile:nth-child(${bCont})`, 500);
          }
          location = bCont;
          bCont = -1;
        }
        bCont++;
      } catch (err) {
        // log.error(err.toString());
        const [,, msg] = err.toString().split('Error')
        log.warning(msg);
        bCont = 0;
        return Promise.resolve(false);
      }      
    }
    return Promise.resolve(blnLoc ? location : true);
  }
  /**
   * Wait for a n number of seconds
   * @param {number} sec - Number of seconds to wait
   */
  async waitToFinish(sec = 1) {
    log.debug(`Waiting for ${sec} seconds - Started`);
    await this.pageWrap.wait(sec * 1000);
    log.debug('Wait - Finished!');
  }
}


// const { 
//   BROWSER_PATH = null,
//   HEADLESS = 'false',
//   URL,
// } = process.env;

// const App = {
//   page: null,
//   browser: null,
//   pageRef: null,
//   init: async () => {
//     const url = URL;
//     const options = {
//       args: ['--ignore-certificate-errors'],
//       headless: HEADLESS === 'false' ? false : true,
//       waitUntil: 'domcontentloaded',
//     };
//     if (BROWSER_PATH) {
//       options.executablePath = BROWSER_PATH;
//     }
//     const browser = await puppeteer.launch(options);

//     App.browser = browser;
//     const page = await browser.newPage();
//     page.setViewport({
//       width: 1200,
//       height: 900,
//       deviceScaleFactor: 3,
//     });
//     await page.goto(url);
//     App.pageRef = page;

//     App.page = new Helper(page);
//     // log.info(`Initializing ${url}`);
//   },
//   endSession: async () => {
//     await App.browser.close();
//   },
//   closeWelcome: async () => {
//     const { page: pwrap } =  App;

//     log.info(`Close welcome screen`);

//     await pwrap.pressByRef('.ibp-button');
//   },
//   openMainTab: async (route, { delay = 3000, wait = 2 } = {}) => {
//     const { page: pwrap } =  App;

//     log.debug(`Opening tab "${route}" - ${wait} sec wait`);

//     await pwrap.clickByRef(`a[href="${route}"]`, delay);
//     await pwrap.wait(wait * 1000);
//   },
//   selectEntryList: async (name, parent, { blnLoc = false, fromParag = false, click = true } = {}) => {
//     const { page: pwrap } =  App;
//     let bCont = 1;
//     let location = 0;
//     while (bCont > 0) {
//       try {
//         const childTree = fromParag ? `p` : 'h4';
//         const temp = await App.pageRef.$eval(`.${parent} .ibp-container-grid-box .ibp-container-tile:nth-child(${bCont}) ${childTree}`, el => el.innerText);
//         // console.log('>>', temp, '===', name);
//         if (temp.indexOf(name) > -1) {
//           if (click) {
//             await pwrap.clickByRef(`.${parent} .ibp-container-grid-box .ibp-container-tile:nth-child(${bCont})`, 500);
//           }
//           location = bCont;
//           bCont = -1;
//         }
//         bCont++;
//       } catch (err) {
//         log.error(err.toString());
//         bCont = 0;
//         return Promise.resolve(false);
//       }      
//     }
//     return Promise.resolve(blnLoc ? location : true);
//   },
//   waitToFinish: async (sec = 1) => {
//     const { page: pwrap } =  App;

//     log.debug(`Waiting for ${sec} seconds - Started`);
//     await pwrap.wait(sec * 1000);
//     log.debug('Wait - Finished!');
//   },
// };

module.exports = App;