module.exports = {
  name: "취소",
  execute: async ({ msg, interaction, executor }) => {
    if (!msg.mentions.has(executor.id)) {
      const ONE_MINUTE_PER_MILISECONDS = 60e3;
      const afterTime = Date.now() - msg.createdTimestamp;
      if (afterTime < ONE_MINUTE_PER_MILISECONDS) {
        return interaction.reply({
          content: `명령어 실행자가 아닌 사람은 ${
            (ONE_MINUTE_PER_MILISECONDS - afterTime) / 1e3
          }초 후에 취소할 수 있습니다.`,
          ephemeral: true,
        });
      }
    }
    interaction.update({
      content: `💽  ${executor}님이 취소 하셨습니다.`,
      components: [],
    });
  },
};
