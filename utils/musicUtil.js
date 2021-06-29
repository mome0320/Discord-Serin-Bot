const MusicPlayer = require("../Object/MusicPlayer");
const Music = require("../Object/Music");
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");

const createPlayer = (guild, voiceChannel) => {
  const client = guild.client;
  let player = client._players.get(guild.id);
  if (!player) {
    player = new MusicPlayer(client, voiceChannel);
    client._players.set(guild.id, player);
  }
  return player;
};

const intertSong = async ({
  player,
  songID,
  requestor,
  sendMessageMethod: sendMessage,
}) => {
  const musicData = await ytdl.getBasicInfo(songID);
  const music = new Music(musicData.videoDetails, requestor);
  player.playlist.push(music);
  if (player.isPlay) {
    sendMessage({
      embeds: [
        music.embed.setAuthor("📥 노래 추가되었습니다.").setColor("BLUE"),
      ],
    });
  } else {
    player.next();
  }
  return;
};

async function getYoutubePlaylist(playlistID, requestor) {
  const playlist = await ytpl(playlistID);
  if (playlist.items) {
    return playlist.items.map((video) => new Music(video, requestor));
  } else return [];
}

module.exports = { intertSong, createPlayer, getYoutubePlaylist };
