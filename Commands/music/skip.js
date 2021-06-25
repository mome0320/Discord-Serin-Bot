module.exports = {
  name: "스킵",
  execute: async ({ msg, bot }) => {
    if (!bot._players.has(msg.guild.id))
      return msg.reply("현재 플레이어가 실행 중이 아닙니다.");
    const player = bot._players.get(msg.guild.id);
    if (msg.member.voice.channel !== player.voice)
      return msg.reply("봇이 접속한 음성 채널에 입장하세요.");
    player.skip();
    msg.channel.send(
      `⏭️ ${msg.author}님의 요청으로 인해 곡을 스킵 요청되었습니다`
    );
  },
};
