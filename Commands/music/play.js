const {
  MessageSelectMenu,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const ytsr = require("ytsr");

const sliceString = (string, limit) =>
  string.length > limit - 2 ? string.slice(0, limit - 2) + ".." : string;

module.exports = {
  name: "재생",
  execute: async ({ msg, bot, args }) => {
    if (args == "목록")
      return require("./playlist").execute({ msg, bot, args });
    if (!args) return msg.reply("사용법: `" + bot.prefix + "재생 [노래 이름]`");
    const searchResult = await searchYoutubeVideos(args);
    if (searchResult.length <= 0) return msg.reply("검색 결과가 없습니다.");

    const SearchResultMenuOptions = searchResult.map((video) => ({
      label: `${sliceString(video.title, 25)}`,
      description: `${video.author.name} \`(${video.duration})\``,
      value: `${video.id}`,
    }));
    const queueSelectMenu = new MessageSelectMenu({
      customID: "SONGSELECT",
      options: SearchResultMenuOptions,
    });
    const cancelButton = new MessageButton({
      customID: "CANCEL",
      style: "DANGER",
      label: "취소",
    });
    const selectMenuActionRow = new MessageActionRow({
      components: [queueSelectMenu],
    });
    const buttonRow = new MessageActionRow({
      components: [cancelButton],
    });
    const content = "💽 재생 할 곡을 선택해주세요";

    msg.reply({ content, components: [selectMenuActionRow, buttonRow] });
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
    return {
      title: element.title,
      id: element.id,
      duration: element.duration,
      author: element.author,
    };
  });
}
