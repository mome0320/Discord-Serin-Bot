const ytsr = require('ytsr')
module.exports = {
    name: '재생',
    execute: async ({msg,bot,args}) => {
        if(args == '목록') return require('./playlist').execute({msg,bot,args})
        if(!args) return msg.reply('사용법: `'+bot.prefix+'재생 [노래 이름]`')
        const searchResult = await searchYoutubeVideos(args);
        if(searchResult.length <= 0) return msg.reply('검색 결과가 없습니다.');

        const musicStringList = searchResult.map((vid,i) =>`${i+1}. [${vid.title}](${vid.duration})`)
        const content = "💽 재생 할 곡의 번호를 눌러주세요.\n"+`\`\`\`md\n# 검색 결과:\n${musicStringList.join('\n')}\n\`\`\``

        const buttons = searchResult.map((vid,i) => {
            return {type:2,
                    style:2,
                    custom_id:`QUEUEADD|${vid.id}`,
                    label:`${i+1}`}
        });
        buttons.push({type:2,
            style:4,
            custom_id:`CANCEL|`,
            label:'취소'});
        const components = [
            {type:1,components:buttons.slice(0,5)},
            {type:1,components:buttons.slice(5,10)}
        ].filter(r=>r.components.length > 0)
        
        bot.api.channels[msg.channel.id].messages.post({data:{content, components}})
        return;
    }
}

async function searchYoutubeVideos(query){
    const filter = await ytsr.getFilters(query).then(target => target.get('Type').get('Video'));
    const result = await ytsr(filter.url,{limit: 9});
    return result.items.map(element => {
        return {title:element.title,id: element.id,
            duration: element.duration}
        })
}