module.exports = {
    name: '정지',
    execute: async ({msg,bot}) => {
        if(!bot._players.has(msg.guild.id)) return msg.reply('이미 정지 된 상태입니다!');
        const player = bot._players.get(msg.guild.id);
        await msg.reply('노래를 정지합니다.');
        player.destroy();
    }
}