const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "내얼굴",
  execute: async ({ bot, msg }) => {
    const size = 6;
    const imageURL = msg.author.displayAvatarURL({
      dynamic: true,
      size: 1 << size,
    });
    const embed = new MessageEmbed().setImage(imageURL).toJSON();
    const button = [
      {
        type: 2,
        style: 2,
        custom_id: `FACESIZE|${msg.author.id}|${size - 1}`,
        label: `축소`,
      },
      {
        type: 2,
        style: 2,
        custom_id: `FACESIZE|${msg.author.id}|${size + 1}`,
        label: `확대`,
      },
    ];

    bot.api.channels[msg.channel.id].messages.post({
      data: {
        embed,
        components: [{ type: 1, components: button }],
      },
    });
  },
};
