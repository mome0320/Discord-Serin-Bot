const { MessageEmbed } = require("discord.js")


const reply = (msg) => {return { type:4,
    data:{
        content:msg,
        flags: 64
    }
    }
}

module.exports = {
    name: '이미지사이즈',
    execute: async ({bot,cmd}) => {
        const targetID = cmd[1];
        const target = await bot.users.fetch(targetID);
        const size = parseInt(cmd[2]);
        if(4>size) return reply('당신의 얼굴을 더 작게 표현할 수 없어요.. ㅠㅠ.');
        if(8<size) return reply('당신의 얼굴을 더 크게 표현할 수 없어요.. ㅠㅠ.');
        const imageURL = target.displayAvatarURL({dynamic: true,size:1<<size})
        const embed = new MessageEmbed().setImage(imageURL).toJSON();
        const button =  [{type:2,
            style:2,
            custom_id:`FACESIZE|${targetID}|${size-1}`,
            label:`축소`},{type:2,
                style:2,
                custom_id:`FACESIZE|${targetID}|${size+1}`,
                label:`확대`}]

        return {type:7,data:{embeds:[{...embed}],components:[{type:1,components:button}]}}
    }
}