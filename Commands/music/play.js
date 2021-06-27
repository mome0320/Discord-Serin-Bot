const { MessageButton, MessageActionRow } = require("discord.js");
const ytsr = require("ytsr");
module.exports = {
  name: "재생",
  execute: async ({ msg, bot, args }) => {
    if (args == "목록")
      return require("./playlist").execute({ msg, bot, args });
    if (!args) return msg.reply("사용법: `" + bot.prefix + "재생 [노래 이름]`");
    const searchResult = await searchYoutubeVideos(args);
    if (searchResult.length <= 0) return msg.reply("검색 결과가 없습니다.");

    const SerchResultStrings = searchResult.map(
      (vid, i) => `${i + 1}. [${vid.title}](${vid.duration})`
    );
    const content =
      "💽 재생 할 곡의 번호를 눌러주세요.\n" +
      `\`\`\`md\n# 검색 결과:\n${SerchResultStrings.join("\n")}\n\`\`\``;

    const queueAddMessageButtons = searchResult.map(
      (video, index) =>
        new MessageButton({
          style: 2,
          custom_id: `QUEUEADD|${video.id}`,
          label: index + 1,
        })
    );
    const cancelMessageButton = new MessageButton({
      style: 4,
      custom_id: `CANCEL`,
      label: "취소",
    });
    const components = [];
    for (let i = 0; i < queueAddMessageButtons.length; i += 5) {
      const actionRow = new MessageActionRow();
      actionRow.addComponents(queueAddMessageButtons.slice(i, i + 5));
      components.push(actionRow);
    }
    const lastActionRow = components.slice(-1).pop();
    if (lastActionRow) {
      lastActionRow.addComponents(cancelMessageButton);
    } else {
      components.push(
        new MessageActionRow({ components: [cancelMessageButton] })
      );
    }
    msg.reply({ content, components });
    return;
  },
};

async function searchYoutubeVideos(query) {
  const filter = await ytsr
    .getFilters(query)
    .then((target) => target.get("Type").get("Video"));
  if (!filter) return [];
  const result = await ytsr(filter.url, { limit: 9 });
  return result.items.map((element) => {
    return { title: element.title, id: element.id, duration: element.duration };
  });
}
