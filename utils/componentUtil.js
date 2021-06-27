const { MessageActionRow } = require("discord.js");

const splitButtons = (buttons, { rowLimit = 5 } = {}) => {
  const components = [];
  for (let i = 0; i < buttons.length; i += rowLimit) {
    const actionRow = new MessageActionRow();
    actionRow.addComponents(buttons.slice(i, i + rowLimit));
    components.push(actionRow);
  }
  return components;
};

module.exports = { splitButtons };
