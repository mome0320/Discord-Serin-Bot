const path = require("path");
const Discord = require("discord.js");
const { lstatSync, readdirSync } = require("fs");

const commandRoot = path.join(__dirname, "..", "Commands");

const loadAllCommands = async () => {
  const Commands = new Discord.Collection();
  const commandDirs = readdirSync(commandRoot).filter((file) =>
    lstatSync(path.join(commandRoot, file)).isDirectory()
  );
  for (const category of commandDirs) {
    await loadCategory(category, Commands);
  }
  return Commands;
};
const loadCategory = async (category, commands) => {
  try {
    const commandFiles = readdirSync(path.join(commandRoot, category)).map(
      (cmd) => `../Commands/${category}/${cmd}`
    );
    for (const cmd of commandFiles) {
      const command = await loadCommand(cmd);
      if (!command.name) {
        console.log(`[${cmd.split("/")[3]}] 명령어 이름 누락! 무시 됨.`);
        continue;
      }
      if (command) {
        commands.set(command.name, command);
        console.log(`${command.name} 명령어 로드 완료!`);
      }
    }
  } catch (err) {
    console.error(err);
  }
};

const loadCommand = async (cmd) => {
  return require(cmd);
};
module.exports = {
  loadAllCommands,
  loadCategory,
  loadCommand,
};
