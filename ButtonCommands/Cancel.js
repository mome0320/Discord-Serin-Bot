module.exports = {
  name: "취소",
  execute: async ({ excutor }) => {
    return {
      type: 7,
      data: {
        content: `💽  <@${excutor.id}>님이 취소 하셨습니다.`,
        components: [],
      },
    };
  },
};
