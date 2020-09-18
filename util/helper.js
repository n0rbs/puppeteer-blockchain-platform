require('dotenv').config();
const DEBUG = process.env.DEBUG && process.env.DEBUG === 'true';

const log = require('color-logs')(true, DEBUG, '');

class Helper {
  constructor(page, e = null) {
    this.page = page;
    this.element = e;
  }
  setE(id) {
    this.element = id;
  }

  async exists (id, byId = true) {
    const elementHandle = await this.page.$(`${byId ? '#' : ''}${id}`);
    return elementHandle;
  }
 async wait (sec = 1000) {
    await this.page.waitFor(sec);
  }
  async get (id, byId = true) {
    await this.page.waitForSelector(`${byId ? '#' : ''}${id}`, { visible: true, timeout: 0 });
    const elementHandle = await this.page.$(`${byId ? '#' : ''}${id}`);
    return elementHandle;
  }
  async typeIn (id, string = '', delay = 0) {
    log.debug(`(typeIn) ${id} ${delay ? '[delay: ' + delay + ']' : ''}`);
    const e = await this.get(id)
    await e.type(string, { delay, });
  }
  async typeInByRef (id, string = '', delay = 0) {
    log.debug(`(typeInByRef) ${id} ${delay ? '[delay: ' + delay + ']' : ''}`);
    const e = await this.get(id, false)
    await e.type(string, { delay, });
  }
  async clickByRef (id, delay = null) {
    log.debug(`(clickByRef) ${id} ${delay ? '[delay: ' + delay + ']' : ''}`);
    const element = await this.get(id, false);
    await this.page.click(`${id}`, { button: 'left', delay });
  }
  async pressByRef (id, key = 'Enter') {
    log.debug(`(pressByRef) ${id} ${key ? '[key: ' + key + ']' : ''}`);
    const e = await this.get(id, false)
    await e.press(key);
  }
  async press (id, key = 'Enter') {
    log.debug(`(press) ${id} ${key ? '[key: ' + key + ']' : ''}`);
    const e = await this.get(id);
    await e.press(key);
  }
  async click (id, delay = null) {
    log.debug(`(click) ${id} ${delay ? '[delay: ' + delay + ']' : ''}`);
    await this.get(id);
    await this.page.click(`#${id}`, { button: 'left', delay });
  }
  async clickM (id, delay = null) {
    log.debug(`(clickM) ${id} ${delay ? '[delay: ' + delay + ']' : ''}`);
    await this.get(id);
    await this.page.$eval(`#${id}`, elem => elem.click());
  }
  async clickR (id) {
    log.debug(`(clickR) ${id}`);
    await this.get(id);
    await this.page.click(`#${id}`, { button: 'right' });
  }
  async goTo (link) {
    log.debug(`(goTo) ${link}`);
    await this.page.goto(link);
  }
  async focus (id) {
    log.debug(`(focus) ${id}`);
    const elementHandle = await this.page.$(`#${id}`);
    await this.page.focus(`#${id}`);
  }

};

module.exports = Helper;
