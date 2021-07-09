module.exports = {
  name: "실시간메세지",
  execute: async ({ bot, args, msg, executor, interaction }) => {
    const player = bot._players.get(msg.guild.id);
    if (!player)
      return interaction.reply({
        content: "현재 플레이어가 플레이 중이 아닙니다.",
        ephemeral: true,
      });
    if (player.liveMessage?.id != msg.id)
      return interaction.reply({
        content: "해당 메세지는 실시간 메세지가 아닙니다.",
        ephemeral: true,
      });
    if (!executor.voice.channel)
      return interaction.reply({
        content: "보이스 채널에 접속하세요.",
        ephemeral: true,
      });
    if (executor.voice.channel.id !== player.voice.id)
      return interaction.reply({
        content: "봇이 입장한 보이스 채널에 접속하세요.",
        ephemeral: true,
      });
    switch (args[0]) {
      case "shift_jump_5":
        await player.seek(-5);
        break;
      case "jump_5":
        await player.seek(5);
        break;
      case "togglePause":
        await player.togglePause();
    }
    return interaction.deferUpdate();
  },
};
