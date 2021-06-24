const {joinVoiceChannel, entersState, VoiceConnectionStatus, createAudioPlayer, createAudioResource} = require('@discordjs/voice');

class VoiceAdapter{
constructor(music){
    this.voiceChannel = music;
    this.sendVoiceServer = null;
    this.sendVoiceState = null;
    this.connection = null;
    this.player = createAudioPlayer()
}

register(methods){
this.sendVoiceServer = methods.onVoiceServerUpdate;
this.sendVoiceState = methods.onVoiceStateUpdate;
}

sendPayload(data){
    const shard = this.voiceChannel.guild.shard
    if(shard.status == 0){shard.send(data);
    return true
}else return false;
}

destroy(){
    this.connection.destroy()
}
_destroyFromVoiceModule(){
    this.voiceChannel.client._players.get(this.voiceChannel.guild.id)?._destroyFromAdapter();
    this.voiceChannel.client._players.delete(this.voiceChannel.guild.id);
}

resolveAdapter(){
return (methods) =>{
    this.register(methods);
    return {
        sendPayload:this.sendPayload.bind(this),
        destroy:this._destroyFromVoiceModule.bind(this)
    }
}
}

async join(){
   this.connection = joinVoiceChannel({
        channelId: this.voiceChannel.id,
        guildId: this.voiceChannel.guild.id,
        adapterCreator: this.resolveAdapter()
    })
    try{
        await entersState(this.connection,VoiceConnectionStatus.Ready,30e3);
        this.connection.subscribe(this.player)
        return this.connection;
    }catch(err){
        this.destroy();
        throw err;
    }
}
play(input){
const resource = createAudioResource(input);
this.player.play(resource);
return this.player;
}
}

module.exports = VoiceAdapter