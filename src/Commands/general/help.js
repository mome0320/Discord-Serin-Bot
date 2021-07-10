const { Formatters } = require("discord.js");

module.exports = {
  name: "도움말",
  execute: async ({ bot, msg }) => {
    const context = Formatters.codeBlock(
      "markdown",
      `# 명령어 목록
- ${bot.prefix}재생 [음악명] - 음악을 추가합니다 (유튜브 검색 결과 제공).
- ${bot.prefix}목록추가 [유튜브 재생목록 ID] - 유튜브 재생목록을 추가합니다. (최대 100개)
- ${bot.prefix}현재곡 - 현재 플레이 중인 곡을 보여줍니다.
- ${bot.prefix}스킵 - 다음 재생 목록으로 넘어갑니다.
- ${bot.prefix}재생목록 - 재생 목록을 보여줍니다.
- ${bot.prefix}섞어 - 재생 목록을 섞습니다.
- ${bot.prefix}노래추천 - 재생 목록이 비었을 때 관련된 음악을 추가합니다.
- ${bot.prefix}반복 [끄기|전체|한번] - 반복 재생을 실행합니다.
- ${bot.prefix}정지 - 노래를 종료합니다. (초기화)
- ${bot.prefix}음성상태 - 음성 연결 상태를 확인합니다.

- ${bot.prefix}내얼굴 - 자신의 프로필 사진을 확인합니다.
`
    );
    msg.channel.send(context);
  },
};
