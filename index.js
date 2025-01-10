require('dotenv').config();
const express = require('express');
const { Client, EmbedBuilder, GatewayIntentBits } = require('discord.js');

// Ctrl + K, C : Comment 주석 설정
// Ctrl + K, U : UnComment 주석 해제

const expressApp = express();
expressApp.use(express.json());
expressApp.post('/discord', async (요청, 반응) => {
    try {
        const 바디 = 요청.body;
        console.log(바디);

        if (!바디.msg || 바디.msg.length == 0) {
            return 반응.send({ resultMsg: '채널 메시지가 비어있으므로 기록할 수 없습니다.' });
        }

        const 접속기록_채널ID = '1310902757649285170';
        const 접속기록_채널 = await client.channels.fetch(접속기록_채널ID);

        접속기록_채널.send(바디.msg);

        return 반응.send({ resultMsg: '채널 메시지가 기록되었습니다.' });
    } catch (에러내용) {
        return 반응.send({ resultMsg: `알 수 없는 이유로 기록할 수 없습니다. (사유: ${에러내용})` });
    }
});

const PORT = 3000;
expressApp.listen(PORT, () => {
    console.log(`Express App 시작됨: Port ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

client.on('ready', () => {
    console.log(`Client 시작됨: ${client.user.tag}`);
});

client.on('messageCreate', (메) => { // 메: 방금 채널에 올라온 메시지
    if (!메.author.bot && 메.content === 'Hi') {
        const 임베드_설명 = "안녕하세요~!~!~!~!~!";

        const 임베드_메시지 = new EmbedBuilder()
            .setColor(0xf5d442)
            .setTitle('HELLO 서버 출입 기록')
            .setURL('https://discord.js.org/')
            .setAuthor({ name: '@aughter00', iconURL: 'https://avatars.githubusercontent.com/u/186668917?v=4', url: 'https://github.com/aughter00' })
            .setDescription(임베드_설명)
            .setThumbnail('https://s.namemc.com/3d/skin/body.png?id=ee4351d5af5fbba1&model=slim&width=308&height=308')
            .addFields(
                { name: '1234', value: '5678' },
                { name: '\u200B', value: '\u200B' },
                { name: 'ABCD', value: 'abcd', inline: true },
                { name: 'EFGH', value: 'efgh', inline: true },
            )
            .addFields({ name: 'IJKL', value: 'ijkl', inline: true })
            .setImage('https://s.namemc.com/3d/skin/body.png?id=25ad4e12bdf33355&model=slim&width=308&height=308')
            .setTimestamp(Date.now())
            .setFooter({ text: 'Thansk you!', iconURL: 'https://avatars.githubusercontent.com/u/186668917?v=4' });

        메.reply('Hi');
        메.channel.send({ embeds: [임베드_메시지] });
        메.reply({ embeds: [임베드_메시지] });
    }
});

client.on('messageCreate', async (메) => { // 메: 방금 채널에 올라온 메시지
    // console.log(`콘텐츠: ${메.content}`);
    const 나눠진콘텐츠 = 메.content.split(' ');
    // console.log('나눠진 콘텐츠: ', 나눠진콘텐츠);
    const 명령어 = 나눠진콘텐츠[0];

    if (메.author.bot || 명령어 !== '!청소') return;

    if (!메.member.permissions.has('MANAGE_MESSAGES')) {
        메.reply('당신은 메시지 관리 권한을 가지고 있지 않습니다.');
        return;
    }

    let 이전메시지ID;

    if (메.reference) { // !청소를 답장으로 한 경우
        const 이전메시지목록 = await 메.channel.messages.fetch({
            limit: 1,
            before: 메.reference.messageId
        });

        if (이전메시지목록.size >= 1) {
            이전메시지ID = 이전메시지목록.first().id;
        }
    }

    let 지울갯수 = -1; // -1이면 전부 지움

    if (나눠진콘텐츠[1] != undefined) { // 지울갯수가 주어진 경우
        지울갯수 = parseInt(나눠진콘텐츠[1]);
        if (Number.isNaN(지울갯수)) {
            메.reply('삭제할 갯수는 숫자로만 입력해주세요. ```!청소 123```');
            return;
        }
    } else {
        지울갯수 = Infinity;
    }

    try {
        let 현재시간 = Date.now();
        const 종료시간 = 현재시간 + 60000;  // 현재시간 + 60초
        console.log('시작시간:', 현재시간);
        console.log('종료시간:', 종료시간);

        let 이번에삭제된메시지갯수 = -1;
        let 삭제된메시지갯수 = 0;
        let 삭제제한갯수 = 100;

        // 100개씩 반복 삭제 (bulkDelete 제한이 100개임)
        while (true) {
            if (이번에삭제된메시지갯수 === 0) break;
            if (삭제된메시지갯수 === 지울갯수) break;

            현재시간 = Date.now();
            console.log('현재시간:', Date.now());
            if (현재시간 >= 종료시간) break;

            const 남은지울갯수 = 지울갯수 - 삭제된메시지갯수;
            if (남은지울갯수 <= 0) break;
            if (남은지울갯수 < 100) {
                삭제제한갯수 = 남은지울갯수;
            }

            const 삭제할메시지목록 = await 메.channel.messages.fetch({
                limit: 삭제제한갯수,
                after: 이전메시지ID ? 이전메시지ID : (메.reference ? 메.reference.messageId : null)
            });
            await 메.channel.bulkDelete(삭제할메시지목록, true);

            let 답장메시지목록;
            if (메.reference && 이전메시지ID === undefined) {
                답장메시지목록 = await 메.channel.messages.fetch({ limit: 1 });
                await 메.channel.bulkDelete(답장메시지목록, true);
            }

            // 14일 이상 된 메시지 제외하기
            const 삭제가능한메시지목록 = 삭제할메시지목록.filter(message => {
                // 14일 이상된 메시지 제외
                return (Date.now() - message.createdTimestamp) <= (14 * 24 * 60 * 60 * 1000);
            });

            이번에삭제된메시지갯수 = 삭제가능한메시지목록.size + (답장메시지목록 ? 1 : 0);
            삭제된메시지갯수 += 이번에삭제된메시지갯수;

            console.log(`이번에 ${이번에삭제된메시지갯수}개 삭제됨, 총 삭제된 갯수: ${삭제된메시지갯수}개`);
        }

        메.channel.send(`${--삭제된메시지갯수}개의 메시지가 성공적으로 삭제되었습니다!`);
    } catch (에러내용) {
        // console.error(`삭제 도중 에러가 발생했습니다 ㅠㅠ (사유: ${에러내용})`);
        메.reply(`삭제 도중 에러가 발생했습니다 ㅠㅠ (사유: ${에러내용})`);
        return;
    }
});

client.login(process.env.DISCORD_API_KEY);
