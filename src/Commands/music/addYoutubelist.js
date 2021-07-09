const {
  createPlayer,
  insertYoutubePlaylist,
} = require("../../utils/musicUtil");

module.exports = {
  name: "목록추가",
  execute: async ({ msg, args }) => {
    if (!msg.member.voice.channel)
      return msg.reply("보이스 채널에 접속하세요.");
    const player = createPlayer(msg.guild, msg.member.voice.channel);
    if (msg.member.voice.channel.id !== player.voice.id)
      return msg.reply("봇이 입장한 보이스 채널에 접속하세요.");
    if (!player.responseChannel) player.responseChannel = msg.channel;
    insertYoutubePlaylist({
      player,
      playlistID: args,
      requestor: msg.member,
      sendMessageMethod: msg.reply.bind(msg),
    });
  },
};
