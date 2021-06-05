const REPEAT = {
    끄기: 0,
    전체: 1,
    한번: 2,
}
module.exports = {
    name: '반복',
    execute: async ({msg,bot,args}) => {
        if(!bot._players.has(msg.guild.id)) return msg.reply('현재 플레이어가 실행 중이 아닙니다.');
        const player = bot._players.get(msg.guild.id);
        if(msg.member.voice.channel !== player.voice) return msg.reply('봇이 접속한 음성 채널에 입장하세요.')
        if(!Object.keys(REPEAT).includes(args)) return msg.reply('형식이 잘못 됐습니다.\n사용 방법:\`'+bot.prefix+'반복 [끄기|전체|한번]\`')
        player.mode = REPEAT[args]
        return msg.reply(`\`${args}\`(으)로 설정 되었습니다.`)
    }
}