const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
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
    this.infinitePlay = false;
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
    if (!this.voice.joinable) {
      this.responseChannel?.send(
        `현재 음성 채널(${this.voice})에 입장 할 수 없는 상태에요. ㅠㅠ
음성 권한을 확인해 보거나 방이 꽉 차 있지 않은지 확인해 보세요...`
      );
      return false;
    }
    try {
      await this.adapter.join();
      this.responseChannel?.send(
        `음성 채널(${this.voice})에 정상 연결되었습니다!`
      );
      this.player.on("stateChange", this._onPlayerStateChange.bind(this));
      this.player.on("error", this._onPlayerError.bind(this));
      if (this.voice.type === "stage") {
        const { trySpeakStageChannel } = require("../utils/musicUtil");
        const isSpeakSuccess = await trySpeakStageChannel(this.guild);
        if (!isSpeakSuccess) {
          this.responseChannel?.send(
            `스테이지 채널에서 말할려고 했는 데... 말할 권한이 없네요..
제가 말하고 싶어서 손을 들었는데 받아주실레요? 그동안 혼자서 떠들고 있을게요!`
          );
        }
      }
      return true;
    } catch (e) {
      if (e.message.startsWith("Did not enter state ready within")) {
        this.responseChannel?.send(
          `어라? 연결 기다리는 데 데이터가 안 오네요!\n아니면 음성 채널이 권한이 없어서 그런 걸 수도.. (웃음..)`
        );
      } else {
        this.responseChannel?.send(
          `음성 채널(${this.voice})에 연결하는 데 실패하었습니다!\n\`${e}\``
        );
      }
      return false;
    }
  }

  async play() {
    if (!this.nowPlaying) {
      this.responseChannel?.send(`📂 현재 재생 가능한 음악이 없습니다..`);
      return;
    }
    if (this.isDead) {
      const isSuccess = await this.connect();
      if (!isSuccess) return;
    }
    this.player.play(this.nowPlaying.createAudioResource());
    if (this.responseChannel) {
      const lastMessage = this.responseChannel.messages.cache.last();
      if (isPlayMessage(lastMessage))
        lastMessage.edit({ embeds: [this.nowPlayingEmbed] });
      else
        this.responseChannel.send({
          embeds: [this.nowPlayingEmbed],
        });
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

    if (this.playlist.length > 0) {
      this.nowPlaying = this.playlist.shift();
    } else if (this.playlist.length <= 0 && this.infinitePlay) {
      const relatedMusic = await this.nowPlaying.getRelatedMusic({
        requestor: this.guild.me,
      });
      this.nowPlaying = relatedMusic;
      await this.responseChannel?.send(
        "재생 목록이 비어있어서 심심한데.. 제가 이 음악과 관련된 노래를 틀어드릴게요!"
      );
    } else {
      this.nowPlaying = null;
    }

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
    this.player?.stop(); //stop event call next()
  }

  get isDead() {
    return (
      !this.connection ||
      this.connection.state.status === "destroyed" ||
      this.connection.state.status === "disconnected"
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
    else return new MessageEmbed().setAuthor("재생할 곡이 없습니다.");
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
    const emojiGuild = this.client.guilds.cache.find(
      (guild) =>
        guild.ownerId == "236696896658341888" && guild.name == "테스트방"
    );
    const emojiName = this.isPaused ? "play" : "pause";
    const emoji = emojiGuild.emojis.cache.find(
      (emoji) => emoji.name == emojiName
    );
    return emoji;
  }

  startLiveMessage(message) {
    if (this.interval) clearInterval(this.interval);
    if (this.liveMessage && !this.liveMessage.deleted)
      this.liveMessage.edit({ embeds: [this.nowPlayingEmbed], components: [] });

    this.liveMessage = message;
    this.interval = setInterval(() => {
      if (this.liveMessage == null || this.liveMessage.deleted)
        return this.stopLiveMessage();

      const backButton = new MessageButton({
        style: 4,
        custom_id: "LIVEMSG|shift_jump_5",
        label: "- 5초",
        disabled: true,
      });
      const playButton = new MessageButton({
        style: 2,
        custom_id: "LIVEMSG|togglePause",
        label: this.durationLabel,
        emoji: this.playbuttonEmoji,
      });
      const jumpButton = new MessageButton({
        style: 3,
        custom_id: "LIVEMSG|jump_5",
        label: "+ 5초",
        disabled: true,
      });
      const actionRow = new MessageActionRow().addComponents([
        backButton,
        playButton,
        jumpButton,
      ]);
      this.liveMessage.edit({
        components: [actionRow],
        embeds: [this.nowPlayingEmbed],
      });
    }, 1500);
  }

  stopLiveMessage() {
    if (this.interval) clearInterval(this.interval);
    this.liveMessage = null;
    this.interval = null;
  }
}

module.exports = MusicPlayer;
