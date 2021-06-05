const { version, WebhookClient } = require('discord.js');

const onReady = async function(){
this.user.setActivity(`뮤직 [${this.prefix}도움말]`)
console.log('Bot Discord JS Version:',version);
console.log('준비 돼었다구요! 주인님!')
}

const onMessage = async function(msg){
this.debug.run(msg);
if(msg.author.bot) return;
if(!msg.content.startsWith(this.prefix)) return;

 const input = msg.content.slice(this.prefix.length).trim();
 if(!input.length) return;
 const [,command, args] = input.match(/([A-Za-z0-9_가-힣]+)\s*([\s\S]*)/);
 if(!this._commands.has(command)) return;
 let cmd = this._commands.get(command);
 const subCommandName = args.split(/ +/)[0];
 if (cmd.subCommands && cmd.subCommands.has(subCommandName)){
     cmd = cmd.subCommands.get(subCommandName);
 }

 if(!cmd.execute) return;
 cmd.execute({
     bot:this,
     msg:msg,
     args
 })

}
const buttonCommands = require('./ButtonCommands')
const InteractionCreate = async function (data) {
    if(data.type == 3){
        const channel = this.channels.cache.get(data.channel_id);
        const buttonMessage = channel.messages.add(data.message,false)
        const requestor = channel.guild.members.add(data.member,false)
        const cmd = data.data.custom_id.split('|');
        const followupWebhook = new WebhookClient(data.application_id,data.token);
        
        const commandsName = Object.keys(buttonCommands);
        if(!commandsName.includes(cmd[0])) return;
        const callbackResult = await buttonCommands[cmd[0]].execute({
            bot:this,
            cmd,
            msg:buttonMessage,
            excutor:requestor,
            followupWebhook});
        if(callbackResult) this.api.interactions[data.id][data.token].callback().post({data:callbackResult})
        return;
    }
  }
  
module.exports = {
    raw: {
        INTERACTION_CREATE: InteractionCreate
      },
    normal:{
    ready: onReady,
	message: onMessage
    }
}
