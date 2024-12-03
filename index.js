require('dotenv').config();

// Ctrl + K, C : Comment 주석 설정
// Ctrl + K, U : UnComment 주석 해제

const { Client, GatewayIntentBits } = require('discord.js');

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
        메.reply('Hi');
        메.channel.send('Hello');
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

    let 지울갯수 = -1; // -1이면 전부 지움

    if (나눠진콘텐츠[1] != undefined) { // 지울갯수가 주어진 경우
        지울갯수 = parseInt(나눠진콘텐츠[1]);
        if (Number.isNaN(지울갯수)) {
            메.reply('삭제할 갯수는 숫자로만 입력해주세요. ```!청소 123```');
            return;
        }
    }

    try {
        ++지울갯수;
        let 삭제된메시지갯수 = 0;
        let 삭제제한갯수 = 100;

        // 100개씩 반복 삭제 (bulkDelete 제한이 100개임)
        while (true) {
            if (삭제된메시지갯수 === 지울갯수) break;
            
            const 남은지울갯수 = 지울갯수 - 삭제된메시지갯수;
            if (남은지울갯수 <= 0) break;
            if (남은지울갯수 < 100) {
                삭제제한갯수 = 남은지울갯수;
            }

            const 삭제할메시지목록 = await 메.channel.messages.fetch({ "limit": 삭제제한갯수 });
            await 메.channel.bulkDelete(삭제할메시지목록);
            삭제된메시지갯수 += 삭제할메시지목록.size;
            console.log(`실제로는 ${삭제할메시지목록.size}개 삭제됨, 총 삭제된 갯수: ${삭제된메시지갯수}개`);
        }

        메.channel.send(`${--삭제된메시지갯수}개의 메시지가 성공적으로 삭제되었습니다!`);
    } catch (에러내용) {
        // console.error(`삭제 도중 에러가 발생했습니다 ㅠㅠ (사유: ${에러내용})`);
        메.reply(`삭제 도중 에러가 발생했습니다 ㅠㅠ (사유: ${에러내용})`);
        return;
    }
});

client.login(process.env.DISCORD_API_KEY);
