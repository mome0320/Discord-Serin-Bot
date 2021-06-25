const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
const { createAudioResource } = require("@discordjs/voice");
momentDurationFormatSetup(moment);
const ytdl = require("ytdl-core");
const { MessageEmbed } = require("discord.js");

class Music {
  constructor(info, requestor) {
    this.requestor = requestor;
    this.id = info.player_response.videoDetails.videoId;
    this.title = info.player_response.videoDetails.title;
    this.thumbnail = info.videoDetails.thumbnails[0].url;
    this.seconds = info.player_response.videoDetails.lengthSeconds;
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
}
module.exports = Music;
