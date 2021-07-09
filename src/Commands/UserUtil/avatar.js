const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  name: "내얼굴",
  execute: async ({ msg }) => {
    const size = 6;
    const imageURL = msg.author.displayAvatarURL({
      dynamic: true,
      size: 1 << size,
    });
    const embed = new MessageEmbed().setImage(imageURL).toJSON();
    const downButton = new MessageButton({
      style: 2,
      custom_id: `FACESIZE|${msg.author.id}|${size - 1}`,
      label: `축소`,
    });
    const upButton = new MessageButton({
      style: 2,
      custom_id: `FACESIZE|${msg.author.id}|${size + 1}`,
      label: `확대`,
    });
    const actionRow = new MessageActionRow().addComponents([
      downButton,
      upButton,
    ]);
    msg.channel.send({
      embeds: [embed],
      components: [actionRow],
    });
  },
};
