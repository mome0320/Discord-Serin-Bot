const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  name: "이미지사이즈",
  execute: async ({ bot, args, interaction }) => {
    const targetID = args[0];
    const target = await bot.users.fetch(targetID);
    const size = parseInt(args[1]);
    if (4 > size)
      return interaction.reply({
        content: "당신의 얼굴을 더 작게 표현할 수 없어요.. ㅠㅠ.",
        ephemeral: true,
      });
    if (8 < size)
      return interaction.reply({
        content: "당신의 얼굴을 더 크게 표현할 수 없어요.. ㅠㅠ.",
        ephemeral: true,
      });
    const imageURL = target.displayAvatarURL({
      dynamic: true,
      size: 1 << size,
    });
    const embed = new MessageEmbed().setImage(imageURL).toJSON();
    const downButton = new MessageButton({
      style: 2,
      custom_id: `FACESIZE|${targetID}|${size - 1}`,
      label: `축소`,
    });
    const upButton = new MessageButton({
      style: 2,
      custom_id: `FACESIZE|${targetID}|${size + 1}`,
      label: `확대`,
    });
    const actionRow = new MessageActionRow().addComponents([
      downButton,
      upButton,
    ]);
    interaction.update({
      embeds: [embed],
      components: [actionRow],
    });
  },
};
