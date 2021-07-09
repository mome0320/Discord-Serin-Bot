const { Intents } = require("discord.js");
const Bot = require("./src/Bot");
const CONFIG = require("./config.private.json");

const bot = new Bot({
  token: CONFIG.DISCORD_TOKEN,
  intents: Intents.ALL,
  prefix: CONFIG.PREFIX,
});
bot.setup().then(bot.start());
