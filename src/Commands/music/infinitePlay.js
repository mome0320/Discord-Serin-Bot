module.exports = {
  name: "노래추천",
  execute: async ({ msg, bot }) => {
    if (!bot._players.has(msg.guild.id))
      return msg.reply("현재 플레이어가 실행 중이 아닙니다.");
    const player = bot._players.get(msg.guild.id);
    player.infinitePlay = !player.infinitePlay;
    const content = player.infinitePlay
      ? "노래 추천을 켰어요!\n만약에 재생목록에 아무것도 없으면 제가 추천해드릴게요!"
      : "노래 추천을 껐어요.";
    msg.reply({ content });
  },
};
