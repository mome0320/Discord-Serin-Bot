const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
const ytdl = require('ytdl-core')
const { MessageEmbed } = require('discord.js')
const REPEAT = {
    NONE: 0,
    ALL: 1,
    ONE: 2,
}
const isPlayMessage = (message) => message.embeds[0]?.author?.name == '현재 플레이 중인 음악:'&&message.author.id == message.client.user.id

class MusicPlayer {
    constructor(client,musicChannel){
    this.client = client;
    this.playlist = []
    this.nowPlaying = null
    this.voice = musicChannel 
    this.connection = null
    this.responseChannel = null
    this.mode = REPEAT.NONE
    this.liveMessage = null
    this.interval = null
    }
    get guild() {
        return this.voice.guild;
    }
    async connect() {
        this.connection = await this.voice.join();
        if(this.responseChannel) this.responseChannel.send(`음성 채널(${this.connection.channel})에 정상 연결되었습니다!`)
    }
    get offset(){
        if(this.connection?.dispatcher){
            return this.connection.dispatcher.streamOptions.seek;
        }else{
            return 0
        }
    }
    async play(){
        if(!this.nowPlaying){ if(this.responseChannel) this.responseChannel.send(`📂 현재 재생 가능한 음악이 없습니다..`); return;}
        if(this.isDead) await this.connect()
       await this.connection.play(ytdl(this.nowPlaying.id, {quality:'highestaudio'}),{highWaterMark:1<<8});
       this._setupDispatcher();
        if(this.responseChannel){
            const lastMessage = this.responseChannel.messages.cache.last();
            if(isPlayMessage(lastMessage)) lastMessage.edit(this.nowPlayingEmbed)
            else this.responseChannel.send(this.nowPlayingEmbed)
        }
    }
    _setupDispatcher(){
        if(!this.connection?.dispatcher) return;
        this.connection?.dispatcher.once('finish',()=>{if(this.connection.status != 4) this.next()});
        this.connection?.dispatcher.once('error',()=>{if(this.responseChannel) this.responseChannel.send(`재생 중 오류가 발생하여 다음 곡을 재생을 시도합니다..`);this.next()});
    }
    async seek(sec){
        if(this.connection?.dispatcher){
            let seekSec = Math.floor(((this.playTime/1000)+sec));
            if(seekSec < 0) seekSec = 0;
        await this.connection.play(ytdl.downloadFromInfo(this.YTDLInfo),{highWaterMark:1<<8,seek:seekSec});
            this._setupDispatcher();
        }
    }
    
    async next(){
        if(this.nowPlaying && this.mode === REPEAT.ONE) return this.play();
        if(this.mode === REPEAT.ALL) this.playlist.push(this.nowPlaying)

        this.nowPlaying = this.playlist.shift();
        if(!this.nowPlaying){
            if(this.responseChannel) this.responseChannel.send(`📂 재생 목록이 비어있습니다! 노래를 넣어주세요.`);
            return;
        } else {
            this.play();
        }
    }

    async skip(){
        if(this.connection?.dispatcher)
        this.connection?.dispatcher.end() //end event call next()
    }

    get isDead(){
       return (!this.connection || this.connection.status === 4)
    }

    get isPlay(){
        return !this.isDead&&this.connection.dispatcher
     }

    getList(page=1){
        const max = page*10
        return this.playlist.slice(max-10,max);
    }

    get totalPage(){
        Math.ceil(this.playlist.length/10)
    }

    get nowPlayingEmbed(){
        if(this.nowPlaying) return this.nowPlaying.embed.setAuthor("현재 플레이 중인 음악:");
        return new MessageEmbed().setAuthor('재생할 곡이 없습니다.')
    }
    get playTime() {
            return this.isPlay ? this.connection.dispatcher.streamTime+(this.offset*1000) : 0;
    }
    get playTimeDuration(){
        if(this.isPlay) return moment.duration(this.playTime,'milliseconds').format();
    }
    destroy() {
        this.stopLiveMessage();
        if(!this.isDead) this.connection.disconnect();
        if(this.responseChannel) this.responseChannel.send(`🛑 음악을 종료합니다.`);
        this.client._players.delete(this.guild.id);
    }
    get status(){
        const REPEATLIST = ['','🔁','🔂']
         const repeat= REPEATLIST[this.mode];
         const total = this.nowPlaying?.duration || '00:00';
         const current = this?.playTimeDuration || '00:00';
         return `[${current}/${total}] ${repeat}`.trim()
        }

    get statusButtonString(){
         const total = this.nowPlaying?.duration || '00:00';
         const current = this?.playTimeDuration || '00:00';
         return `${current}/${total}`.trim()
    }

    get repeatButtonLabel(){
        const REPEATLIST = ['','🔁','🔂']
        return REPEATLIST[this.mode];
    }

    get isPaused(){
        return this.connection?.dispatcher?.paused
    }

    async togglePause(){
        if(!this.connection?.dispatcher) return;
        if(this.isPaused){
            this.connection.dispatcher.resume()
        }else{
            this.connection.dispatcher.pause()
        }
    }
    get playbuttonEmoji(){
        return this.isPaused?{name:'play',id:'835823853976289291'}:{name:'pause',id:'835828160024018974'};
    }

    startLiveMessage(message){
       if(this.interval) clearInterval(this.interval);
       const editMessage = async (data) => this.client.api.channels[this.liveMessage.channel.id].messages[this.liveMessage.id].patch({data})
        .then(data=>this.liveMessage.channel.messages.add(data))
       
       if(this.liveMessage&&!this.liveMessage.deleted) editMessage({embed:this.nowPlayingEmbed.toJSON(),components:[]})
       
       this.liveMessage = message;
       this.interval = setInterval(()=>{
            if(this.liveMessage == null||this.liveMessage.deleted) return this.stopLiveMessage();

            const embed = this.nowPlayingEmbed.toJSON();
            const button = [
                {type:2,style:4,custom_id:'LIVEMSG|shift_jump_5',label:'- 5초',disabled:true},
                {type:2,style:2,custom_id:'LIVEMSG|togglePause',label:this.statusButtonString,emoji:this.playbuttonEmoji},
                {type:2,style:3,custom_id:'LIVEMSG|jump_5',label:'+ 5초',disabled:true}
            ]

            const data = {components:[{type:1,components:button}],embed};
            editMessage(data);
        },1500)
    }

    stopLiveMessage(){
        if(this.interval) clearInterval(this.interval);
        this.liveMessage = null;
        this.interval = null;
    }
}

module.exports = MusicPlayer;