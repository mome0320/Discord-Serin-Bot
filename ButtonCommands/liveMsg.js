const reply = (msg) => {
  return {
    type: 4,
    data: {
      content: msg,
      flags: 64,
    },
  };
};
module.exports = {
  name: "실시간메세지",
  execute: async ({ bot, cmd, msg, excutor }) => {
    const player = bot._players.get(msg.guild.id);
    if (!player) return reply("현재 플레이어가 플레이 중이 아닙니다.");
    if (player.liveMessage?.id != msg.id)
      return reply("해당 메세지는 실시간 메세지가 아닙니다.");
    if (!excutor.voice.channel) return reply("보이스 채널에 접속하세요.");
    if (excutor.voice.channel.id !== player.voice.id)
      return reply("봇이 입장한 보이스 채널에 접속하세요.");
    switch (cmd[1]) {
      case "shift_jump_5":
        await player.seek(-5);
        break;
      case "jump_5":
        await player.seek(5);
        break;
      case "togglePause":
        await player.togglePause();
    }
    return { type: 6 };
  },
};
