const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
const { createAudioResource } = require("@discordjs/voice");
momentDurationFormatSetup(moment);
const ytdl = require("ytdl-core");
const { MessageEmbed } = require("discord.js");

class Music {
  constructor(info, requestor) {
    this.requestor = requestor;
    this.id = info.id || info.videoId;
    this.title = info.title;
    this.thumbnails = info.thumbnails;
    this.seconds = parseInt(
      info.durationSec || info.lengthSeconds || info.length_seconds
    );
    this._relatedVideos = relatedVideos || null;
  }
  get thumbnail() {
    return this.thumbnails[0].url;
  }

  toString() {
    return `[${this.title}](https://youtu.be/${this.id}) \`${this.duration}\` \`신청자: ${this.requestor.user.tag}\``;
  }

  get duration() {
    return moment.duration(this.seconds, "seconds").format();
  }

  get embed() {
    return new MessageEmbed({
      color: "#6DDF33",
      title: this.title,
      thumbnail: { url: this.thumbnail },
      url: `https://youtu.be/${this.id}`,
    }).addField("요청자", `${this.requestor}`);
  }

  createAudioResource() {
    return createAudioResource(
      ytdl(this.id, { quality: "highestaudio", highWaterMark: 1 << 25 })
    );
  }
  async getRelatedMusicList({ requestor } = {}) {
    if (!this._relatedVideos) {
      this._relatedVideos = await ytdl
        .getBasicInfo(this.id)
        .then((info) => info.related_videos);
    }
    return this._relatedVideos.map(
      (videoData) => new Music(videoData, requestor)
    );
  }
  async getRelatedMusic({ requestor } = {}) {
    const songList = await this.getRelatedMusicList({ requestor });
    const randomPickMusic =
      songList[Math.floor(Math.random() * songList.length)];
    return randomPickMusic;
  }
}
module.exports = Music;
