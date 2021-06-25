const { Client, Collection, MessageEmbed } = require('discord.js');
const { loadAllCommands } = require('./load/command');
const events = require('./Bot.on');
const Dokdo = require('dokdo');
const fetch = require('node-fetch');
const DebugNoPerm = async (msg)=> {
  const {url} = await fetch('https://api.waifu.pics/sfw/highfive').then(data=>data.json())
 const cuteImage = new MessageEmbed({image:{url}})
  msg.reply('와! 세린! 아시는구나!\n그런데 덧붙이는 비밀의 명령어는 주인 말만 들어요..\n대신 저랑 하이파이브 하실레요?',cuteImage)
}
class Bot extends Client{
    constructor(options) {
        super(options);
        this._commands = new Collection();
        this._players = new Collection();
        this.prefix = options.prefix;
        this.token = options.token;
    }
    
    async setup(){
        this.debug = new Dokdo(this, { noPerm: DebugNoPerm,aliases: ['제발'], prefix: '세린아 ' })
        await this._loadCommands();
        this._listenEvents();
    }

    async start(){
        this.login()
    }
    async _loadCommands(){
        this._commands = await loadAllCommands();
    }

    _listenEvents(){
        Object.keys(events.normal).forEach(evt =>{
            const handler = events.normal[evt];
            this.on(evt,handler.bind(this));
        })
        Object.keys(events.raw).forEach(evt =>{
            const handler = events.raw[evt];
            this.ws.on(evt,handler.bind(this));
        })
    }
}
module.exports = Bot;