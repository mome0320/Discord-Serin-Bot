const { createPlayer, getYoutubePlaylist } = require("../../utils/musicUtil");
module.exports = {
  name: "목록추가",
  execute: async ({ msg, args }) => {
    if (!msg.member.voice.channel)
      return msg.reply("보이스 채널에 접속하세요.");
    const player = createPlayer(msg.guild, msg.member.voice.channel);
    if (msg.member.voice.channel.id !== player.voice.id)
      return msg.reply("봇이 입장한 보이스 채널에 접속하세요.");
    if (!player.responseChannel) player.responseChannel = msg.channel;
    const playList = await getYoutubePlaylist(args, msg.member);
    if (playList.length <= 0)
      return msg.reply("플레이리스트 찾을 수 없습니다!");
    player.playlist.push(...playList);
    msg.reply(`${playList.length}개의 곡을 추가하였습니다.`);
    if (!player.isPlay) player.next();
  },
};
