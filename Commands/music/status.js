module.exports = {
  name: "음성상태",
  execute: async ({ msg, bot }) => {
    if (!bot._players.has(msg.guild.id))
      return msg.reply("현재 플레이어가 실행 중이 아닙니다.");
    const player = bot._players.get(msg.guild.id);
    const ping = player.connection?.ping;
    const pingUDP = ping?.udp || "?";
    const pingWS = ping?.ws || "?";
    return msg.reply(
      `음성 보이스: ${pingUDP}ms
음성 웹소켓: ${pingWS}ms`
    );
  },
};
