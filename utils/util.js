const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

const debugNoPerm = async (msg) => {
  const { url } = await fetch("https://api.waifu.pics/sfw/highfive").then(
    (data) => data.json()
  );
  const cuteImageEmbed = new MessageEmbed({ image: { url } });
  msg.reply({
    content: `와! 세린! 아시는구나!
그런데 덧붙이는 비밀의 명령어는 주인 말만 들어요..
대신 저랑 하이파이브 하실래요?`,
    embeds: [cuteImageEmbed],
  });
};

module.exports = { debugNoPerm };
