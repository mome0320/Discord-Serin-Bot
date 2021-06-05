
module.exports = {
    name: '현재곡',
    execute: async ({msg,bot}) => {
        if(!bot._players.has(msg.guild.id)) return msg.reply('현재 플레이어가 실행 중이 아닙니다.');
        const player = bot._players.get(msg.guild.id);
        const target = await msg.channel.send(player.nowPlayingEmbed)
        player.startLiveMessage(target);
    }
}