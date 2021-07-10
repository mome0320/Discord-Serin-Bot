const { Client, Collection } = require("discord.js");
const { loadAllCommands } = require("./load/command");
const events = require("./Bot.on");
const Dokdo = require("dokdo");
const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
const { debugNoPerm } = require("./utils/util");

class Bot extends Client {
  constructor(options) {
    super(options);
    this._commands = new Collection();
    this._players = new Collection();
    this.prefix = options.prefix;
    this.token = options.token;
  }

  async setup() {
    momentDurationFormatSetup(moment);
    this.debug = new Dokdo(this, {
      noPerm: debugNoPerm,
      aliases: ["제발"],
      prefix: this.prefix,
    });
    await this._loadCommands();
    this._listenEvents();
  }

  async start() {
    this.login();
  }
  async _loadCommands() {
    this._commands = await loadAllCommands();
  }

  _listenEvents() {
    Object.keys(events.normal).forEach((evt) => {
      const handler = events.normal[evt];
      this.on(evt, handler.bind(this));
    });
    Object.keys(events.raw).forEach((evt) => {
      const handler = events.raw[evt];
      this.ws.on(evt, handler.bind(this));
    });
  }
}
module.exports = Bot;
