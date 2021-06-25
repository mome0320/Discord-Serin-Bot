const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
const { MessageEmbed } = require("discord.js");
const VoiceAdapter = require("./MusicAdapter");
const REPEAT = {
  NONE: 0,
  ALL: 1,
  ONE: 2,
};
const isPlayMessage = (message) =>
  message.embeds[0]?.author?.name == "현재 플레이 중인 음악:" &&
  message.author.id == message.client.user.id;

class MusicPlayer {
  constructor(client, musicChannel) {
    this.client = client;
    this.mode = REPEAT.NONE;
    this.nowPlaying = null;
    this.playlist = [];
    this.adapter = new VoiceAdapter(musicChannel);
    this.responseChannel = null;
    this.liveMessage = null;
    this.interval = null;
  }

  get voice() {
    return this.adapter.voiceChannel;
  }
  get guild() {
    return this.voice.guild;
  }
  get player() {
    return this.adapter.player;
  }
  get connection() {
    return this.adapter.connection;
  }
  async connect() {
    try {
      await this.adapter.join();
      this.responseChannel?.send(
        `음성 채널(${this.adapter.voiceChannel})에 정상 연결되었습니다!`
      );
      this.player.on("stateChange", this._onPlayerStateChange.bind(this));
      this.player.on("error", this._onPlayerError.bind(this));
    } catch (e) {
      if (e.message.startsWith("Did not enter state ready within")) {
        this.responseChannel?.send(
          `어라? 연결 기다리는 데 데이터가 안 오네요!\n아니면 음성 채널이 권한이 없어서 그런 걸 수도.. (웃음..)`
        );
      } else {
        this.responseChannel?.send(
          `음성 채널(${this.adapter.voiceChannel})에 연결하는 데 실패하었습니다!\n\`${e}\``
        );
      }
    }
  }

  async play() {
    if (!this.nowPlaying) {
      this.responseChannel?.send(`📂 현재 재생 가능한 음악이 없습니다..`);
      return;
    }
    if (this.isDead) this.connect();
    this.player.play(this.nowPlaying.createAudioResource());
    if (this.responseChannel) {
      const lastMessage = this.responseChannel.messages.cache.last();
      if (isPlayMessage(lastMessage)) lastMessage.edit(this.nowPlayingEmbed);
      else this.responseChannel.send(this.nowPlayingEmbed);
    }
  }
  _onPlayerStateChange(old, now) {
    if (
      (old.status == "playing" || old.status == "pause") &&
      now.status == "idle"
    )
      this.next();
  }
  _onPlayerError(error) {
    this.responseChannel?.send(
      `재생 중 오류가 발생하여 다음 곡을 재생을 시도합니다.. ${error}`
    );
    this.next();
  }

  async next() {
    if (this.nowPlaying && this.mode === REPEAT.ONE) return this.play();
    if (this.mode === REPEAT.ALL) this.playlist.push(this.nowPlaying);

    this.nowPlaying = this.playlist.shift();
    if (!this.nowPlaying) {
      this.responseChannel?.send(
        `📂 재생 목록이 비어있습니다! 노래를 넣어주세요.`
      );
      return;
    } else {
      this.play();
    }
  }

  async skip() {
    this.adapter.player?.stop(); //stop event call next()
  }

  get isDead() {
    return (
      !this.adapter.connection ||
      this.adapter.connection.state.status === "destroyed" ||
      this.adapter.connection.state.status === "disconnected"
    );
  }

  get isPlay() {
    return !this.isDead && this.player?.state.status != "idle";
  }

  getList(page = 1) {
    const max = page * 10;
    return this.playlist.slice(max - 10, max);
  }

  get totalPage() {
    return Math.ceil(this.playlist.length / 10);
  }

  get nowPlayingEmbed() {
    if (this.nowPlaying)
      return this.nowPlaying.embed.setAuthor("현재 플레이 중인 음악:");
    return new MessageEmbed().setAuthor("재생할 곡이 없습니다.");
  }
  get playTimeMilliseconds() {
    return this.isPlay ? this.player.state.playbackDuration : 0;
  }
  get playTimeStringFormat() {
    if (this.isPlay)
      return moment
        .duration(this.playTimeMilliseconds, "milliseconds")
        .format();
    return null;
  }
  destroy() {
    this.stopLiveMessage();
    this.adapter.destroy();
  }
  _destroyFromAdapter() {
    this.stopLiveMessage();
    this.responseChannel?.send(`🛑 음악을 종료합니다.`);
  }

  get durationLabel() {
    const total = this.nowPlaying?.duration || "00:00";
    const current = this?.playTimeStringFormat || "00:00";
    return `${current}/${total}`.trim();
  }

  get repeatLabel() {
    const REPEATLIST = ["", "🔁", "🔂"];
    return REPEATLIST[this.mode];
  }

  get isPaused() {
    return this.player?.state.status == "paused";
  }

  async togglePause() {
    if (!this.player) return;
    if (this.isPaused) {
      this.player.unpause();
    } else {
      this.player.pause();
    }
  }
  get playbuttonEmoji() {
    return this.isPaused
      ? { name: "play", id: "835823853976289291" }
      : { name: "pause", id: "835828160024018974" };
  }

  startLiveMessage(message) {
    if (this.interval) clearInterval(this.interval);
    const editMessage = async (data) =>
      this.client.api.channels[this.liveMessage.channel.id].messages[
        this.liveMessage.id
      ]
        .patch({ data })
        .then((data) => this.liveMessage.channel.messages.add(data));

    if (this.liveMessage && !this.liveMessage.deleted)
      editMessage({ embed: this.nowPlayingEmbed.toJSON(), components: [] });

    this.liveMessage = message;
    this.interval = setInterval(() => {
      if (this.liveMessage == null || this.liveMessage.deleted)
        return this.stopLiveMessage();

      const embed = this.nowPlayingEmbed.toJSON();
      const button = [
        {
          type: 2,
          style: 4,
          custom_id: "LIVEMSG|shift_jump_5",
          label: "- 5초",
          disabled: true,
        },
        {
          type: 2,
          style: 2,
          custom_id: "LIVEMSG|togglePause",
          label: this.durationLabel,
          emoji: this.playbuttonEmoji,
        },
        {
          type: 2,
          style: 3,
          custom_id: "LIVEMSG|jump_5",
          label: "+ 5초",
          disabled: true,
        },
      ];

      const data = { components: [{ type: 1, components: button }], embed };
      editMessage(data);
    }, 1500);
  }

  stopLiveMessage() {
    if (this.interval) clearInterval(this.interval);
    this.liveMessage = null;
    this.interval = null;
  }
}

module.exports = MusicPlayer;
