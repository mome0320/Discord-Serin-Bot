module.exports = {
  name: "테트리스",
  execute: async ({ bot, args, msg, interaction }) => {
    const game = bot._tetris.get(msg.channel.id);
    if (!game)
      return interaction.reply({
        content: "현재 게임이 플레이 중이 아닙니다.",
        ephemeral: true,
      });
    if (game.isEnd)
      return interaction.reply({
        content: "게임이 종료된 상태입니다.",
        ephemeral: true,
      });
    switch (args[0]) {
      case "LEFT":
        game.queue.x -= 1;
        break;
      case "ROTATE":
        game.queue.rotate += 1;
        break;
      case "RIGHT":
        game.queue.x += 1;
        break;
      case "DOWN":
        game.queue.y += 1;
        break;
    }
    return interaction.deferUpdate();
  },
};
