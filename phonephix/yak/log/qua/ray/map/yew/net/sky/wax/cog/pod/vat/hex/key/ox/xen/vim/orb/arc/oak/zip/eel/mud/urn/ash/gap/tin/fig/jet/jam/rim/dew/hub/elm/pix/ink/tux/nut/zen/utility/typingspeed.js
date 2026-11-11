'use strict';
module.exports = {
    name: 'typingspeed',
    category: 'utility',
    aliases: ['wpm'],
    description: 'Calculate typing speed (WPM) from word count and seconds taken',
    usage: '.typingspeed <words> <seconds>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const words = parseFloat(ctx.args?.[0]);
        const seconds = parseFloat(ctx.args?.[1]);
        if (!words || !seconds || seconds <= 0) {
            return reply(`❌ Usage: ${ctx.prefix || '.'}typingspeed <words> <seconds>`);
        }
        const wpm = (words / (seconds / 60)).toFixed(1);
        return reply(`⌨️ *TYPING SPEED*\n\n${words} words in ${seconds}s ≈ ${wpm} WPM`);
    }
};
