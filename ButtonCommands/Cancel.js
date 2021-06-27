module.exports = {
  name: "취소",
  execute: async ({ interaction, executor }) => {
    interaction.update({
      content: `💽  ${executor}님이 취소 하셨습니다.`,
      components: [],
    });
  },
};
