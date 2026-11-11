'use strict';
const ONES = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function toWords(n) {
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
    if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + toWords(n % 100) : '');
    if (n < 1000000) return toWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + toWords(n % 1000) : '');
    return String(n);
}
module.exports = {
    name: 'numtowords', category: 'utility', aliases: ['spellnumber'],
    description: 'Spell out a number in English words', usage: '.numtowords <number>', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const n = parseInt(args?.[0], 10);
        if (isNaN(n) || n < 0 || n > 999999999) return reply('❌ Usage: .numtowords <number 0-999999999>');
        return reply(`🔤 ${toWords(n)}`);
    }
};
