const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  name: "재생목록",
  execute: async ({ msg, bot }) => {
    if (!bot._players.has(msg.guild.id))
      return msg.reply("현재 플레이어가 실행 중이 아닙니다.");
    const player = bot._players.get(msg.guild.id);
    const page = 1;
    const playList = player.getList(page);
    if (playList.length <= 0)
      return msg.reply("📂 재생 목록이 비어있습니다! 노래를 넣어주세요.");
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

    msg.channel.send({ embeds: [embed], components: [actionRow] });
  },
};
