const {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
  createAudioPlayer,
} = require("@discordjs/voice");

class VoiceAdapter {
  constructor(music) {
    this.voiceChannel = music;
    this.sendVoiceServerData = null;
    this.sendVoiceStateData = null;
    this._volume = 1;
    this.connection = null;
    this.player = createAudioPlayer();
  }

  voiceChannelChange(channel) {
    this.voiceChannel = channel;
    if (this.connection) {
      this.connection.rejoin({ channelId: this.voiceChannel.id });
    }
  }
  set volume(value) {
    this._volume = value;
    if (this.player.state.status == "idle") return;
    if (!this.player.state.resource.volume) return;
    this.player.state.resource.volume.setVolume(value);
  }

  get volume() {
    return this._volume;
  }

  _voiceRegister(methods) {
    this.sendVoiceServerData = methods.onVoiceServerUpdate;
    this.sendVoiceStateData = (data) => {
      if (!data.channel_id) return this.destroy();
      if (data.self_mute) {
        this.connection?.state.subscription?.unsubscribe();
      } else {
        this.connection?.subscribe(this.player);
      }
      methods.onVoiceStateUpdate(data);
    };
  }

  _sendPayload(data) {
    const shard = this.voiceChannel.guild.shard;
    if (shard.status == 0) {
      shard.send(data);
      return true;
    } else return false;
  }

  destroy() {
    this.connection.destroy();
  }
  _destroyFromVoiceModule() {
    this.voiceChannel.client._players
      .get(this.voiceChannel.guild.id)
      ?._destroyFromAdapter();
    this.voiceChannel.client._players.delete(this.voiceChannel.guild.id);
  }

  resolveAdapter() {
    return (methods) => {
      this._voiceRegister(methods);
      return {
        sendPayload: this._sendPayload.bind(this),
        destroy: this._destroyFromVoiceModule.bind(this),
      };
    };
  }

  async join() {
    this.connection = joinVoiceChannel({
      channelId: this.voiceChannel.id,
      guildId: this.voiceChannel.guild.id,
      adapterCreator: this.resolveAdapter(),
    });
    try {
      await entersState(this.connection, VoiceConnectionStatus.Ready, 30e3);
      return this.connection;
    } catch (err) {
      this.destroy();
      throw err;
    }
  }

  play(input) {
    if (input.volume) input.volume.setVolume(this.volume);
    this.player.play(input);
    return this.player;
  }
}

module.exports = VoiceAdapter;
