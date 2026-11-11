'use strict';
const GREETINGS = {
    english: 'Hello', swahili: 'Habari', french: 'Bonjour', spanish: 'Hola',
    german: 'Hallo', italian: 'Ciao', japanese: 'Konnichiwa', arabic: 'Marhaba'
};
module.exports = {
    name: 'greeting', category: 'fun', aliases: ['hello'],
    description: 'Get "hello" in a different language', usage: '.greeting <language>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const lang = (args?.[0] || '').toLowerCase();
        if (!GREETINGS[lang]) {
            return reply(`❌ Usage: .greeting <language>\n\nAvailable: ${Object.keys(GREETINGS).join(', ')}`);
        }
        return reply(`👋 ${GREETINGS[lang]}!`);
    }
};
