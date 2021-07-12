const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  name: "재생목록",
  execute: async ({ bot, args, msg, interaction }) => {
    const player = bot._players.get(msg.guild.id);
    if (!player)
      return interaction.reply({
        content: "현재 플레이어가 플레이 중이 아닙니다.",
        ephemeral: true,
      });
    if (args[1] == "shuffle") player.playlist.sort(() => Math.random() - 0.5);
    const page = parseInt(args[0]);
    if (page > player.totalPage)
      return interaction.reply({
        content: "마지막 페이지입니다.",
        ephemeral: true,
      });
    if (page < 1)
      return interaction.reply({
        content: "처음 페이지입니다.",
        ephemeral: true,
      });
    const playList = player.getList(page);
    if (playList.length <= 0)
      return interaction.update({
        content: "📂 재생 목록이 비어있습니다! 노래를 넣어주세요.",
        embeds: [],
        components: [],
      });
    const playListString = playList.map(
      (songString, i) => `**${(page - 1) * 10 + (i + 1)}. ${songString}**`
    );
    const embed = new MessageEmbed({
      description: playListString.join("\n"),
      title: `🗃️ 재생 목록 [${page}/${player.totalPage}]`,
    });
    const prev = new MessageButton()
      .setCustomId(`PLAYLIST|${page - 1}`)
      .setStyle("DANGER")
      .setLabel("이전");
    const shuffle = new MessageButton()
      .setCustomId(`PLAYLIST|${page}|shuffle`)
      .setStyle("SECONDARY")
      .setLabel("전체 셔플");
    const next = new MessageButton()
      .setCustomId(`PLAYLIST|${page + 1}`)
      .setStyle("SUCCESS")
      .setLabel("다음");
    const actionRow = new MessageActionRow().addComponents([
      prev,
      shuffle,
      next,
    ]);
    interaction.update({
      embeds: [embed],
      components: [actionRow],
    });
  },
};
