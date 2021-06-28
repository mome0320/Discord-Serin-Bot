module.exports = {
  name: "섞어",
  execute: async ({ msg, bot }) => {
    if (!bot._players.has(msg.guild.id))
      return msg.reply("현재 플레이어가 실행 중이 아닙니다.");
    const player = bot._players.get(msg.guild.id);
    player.playlist.sort(() => Math.random() - 0.5);
    msg.reply("🌀 태풍의 힘을 이용해서 재생목록을 섞었어요!");
  },
};
