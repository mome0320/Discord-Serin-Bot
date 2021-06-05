const { MessageEmbed } = require("discord.js");

module.exports = {
    name: '재생목록',
    execute: async ({msg,bot}) => {
        if(!bot._players.has(msg.guild.id)) return msg.reply('현재 플레이어가 실행 중이 아닙니다.');
        const player = bot._players.get(msg.guild.id);
        const playList = player.getList();
        if(playList.length <= 0) return msg.reply('📂 재생 목록이 비어있습니다! 노래를 넣어주세요.')
        const playListString = playList.map((songString, i) =>`**${i+1}. ${songString}**`);
        const embed = new MessageEmbed({description:playListString.join('\n'),title:'🗃️ 재생 목록'});
        msg.channel.send(embed);
    }
}