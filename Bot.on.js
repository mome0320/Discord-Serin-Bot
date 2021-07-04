const { version } = require("discord.js");

const onReady = async function () {
  this.user.setActivity(`뮤직 [${this.prefix}도움말]`);
  console.log("Bot Discord JS Version:", version);
  console.log("준비 돼었다구요! 주인님!");
};

const onMessage = async function (msg) {
  if (msg.author.bot) return;
  this.debug.run(msg);
  if (msg.content == `${this.prefix}나 권한 없어`)
    return this.debug.options.noPerm(msg);
  if (!msg.content.startsWith(this.prefix)) return;

  const input = msg.content.slice(this.prefix.length).trim();
  if (!input.length) return;
  const [, command, args] = input.match(/([A-Za-z0-9_가-힣]+)\s*([\s\S]*)/);
  if (!this._commands.has(command)) return;
  let cmd = this._commands.get(command);
  const subCommandName = args.split(/ +/)[0];
  if (cmd.subCommands && cmd.subCommands.has(subCommandName)) {
    cmd = cmd.subCommands.get(subCommandName);
  }

  if (!cmd.execute) return;
  cmd.execute({
    bot: this,
    msg: msg,
    args,
  });
};
const buttonCommands = require("./ButtonCommands");
const onIntegration = async function (interaction) {
  if (interaction.isButton) {
    const { member, message, customID } = interaction;
    const [cmdName, ...args] = customID.split("|");
    const buttonExecutor = buttonCommands[cmdName];

    if (!buttonExecutor) return;
    buttonExecutor.execute({
      bot: this,
      cmdName,
      args,
      msg: message,
      executor: member,
      interaction,
    });
  }
};

const onVoiceServerUpdate = async function (data) {
  if (this._players.get(data.guild_id)?.adapter.sendVoiceServerData)
    this._players.get(data.guild_id)?.adapter.sendVoiceServerData(data);
};
const onVoiceStateUpdate = async function (data) {
  if (data.user_id !== this.user.id) return;
  if (this._players.get(data.guild_id)?.adapter.sendVoiceStateData)
    this._players.get(data.guild_id)?.adapter.sendVoiceStateData(data);
};

module.exports = {
  raw: {
    VOICE_SERVER_UPDATE: onVoiceServerUpdate,
    VOICE_STATE_UPDATE: onVoiceStateUpdate,
  },
  normal: {
    interactionCreate: onIntegration,
    ready: onReady,
    messageCreate: onMessage,
  },
};
