const Music = require("../Object/Music");
const MusicPlayer = require("../Object/MusicPlayer");
const ytdl = require("ytdl-core");

const reply = (msg) => {
  return {
    type: 4,
    data: {
      content: msg,
      flags: 64,
    },
  };
};

const makePlayer = (guild, voiceChannel) => {
  const client = guild.client;
  let player = client._players.get(guild.id);
  if (!player) {
    player = new MusicPlayer(client, voiceChannel);
    client._players.set(guild.id, player);
  }
  return player;
};

const intertSong = async ({ player, songID, requestor, webhook }) => {
  const musicData = await ytdl.getBasicInfo(songID);
  const music = new Music(musicData, requestor);
  player.playlist.push(music);
  if (player.isPlay) {
    webhook.send({
      embeds: [
        music.embed.setAuthor("📥 노래 추가되었습니다.").setColor("BLUE"),
      ],
    });
  } else {
    player.next();
  }
  return;
};

module.exports = {
  name: "곡추가",
  execute: async ({ cmd, msg, excutor, followupWebhook }) => {
    if (!msg.mentions.has(excutor.id))
      return reply("명령어 실행자가 아닙니다.");
    if (!excutor.voice.channel) return reply("보이스 채널에 접속하세요.");
    const player = makePlayer(msg.guild, excutor.voice.channel);
    if (excutor.voice.channel.id !== player.voice.id)
      return reply("봇이 입장한 보이스 채널에 접속하세요.");
    player.responseChannel = msg.channel;
    intertSong({
      player,
      songID: cmd[1],
      requestor: excutor,
      webhook: followupWebhook,
    });
    return {
      type: 7,
      data: {
        content: `💽  <@${excutor.id}> 님이 음악을 선택하셨습니다.`,
        components: [],
      },
    };
  },
};
