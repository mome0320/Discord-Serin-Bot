const Music = require("../Object/Music");
const MusicPlayer = require("../Object/MusicPlayer");
const ytdl = require("ytdl-core");

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
  execute: async ({ args, msg, executor, interaction }) => {
    if (!msg.mentions.has(executor.id))
      return interaction.reply({
        content: "명령어 실행자가 아닙니다.",
        ephemeral: true,
      });
    if (!executor.voice.channel)
      return interaction.reply({
        content: "보이스 채널에 접속하세요",
        ephemeral: true,
      });
    const player = makePlayer(msg.guild, executor.voice.channel);
    if (executor.voice.channel.id !== player.voice.id)
      return interaction.reply({
        content: "봇이 입장한 보이스 채널에 접속하세요.",
        ephemeral: true,
      });
    player.responseChannel = msg.channel;
    intertSong({
      player,
      songID: args[0],
      requestor: executor,
      followup: interaction.followUp.bind(interaction),
    });
    interaction.update({
      content: `💽  ${executor} 님이 음악을 선택하셨습니다.`,
      components: [],
    });
  },
};
