'use strict';

const http = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/http');

module.exports = {
    name: 'tts',
    category: 'utility',
    aliases: ['say2', 'speak', 'texttospeech'],
    description: 'Turn text into a voice message (e.g. .tts en Hello there)',
    usage: '.tts <lang> <text>   e.g. .tts en Good morning',
    emoji: '🗣️',
    cooldown: 5,

    async execute(ctx) {
        const args = ctx.args || [];
        let lang = 'en';
        if (args[0] && /^[a-z]{2}(-[A-Za-z]{2})?$/.test(args[0]) && args.length > 1) lang = args.shift();

        let text = args.join(' ').trim();
        if (!text) {
            const q = ctx.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            text = String(q?.conversation || q?.extendedTextMessage?.text || '').trim();
        }
        if (!text) return ctx.reply(`❌ Usage: ${ctx.prefix || '.'}tts en Hello there\n(or reply to a text with ${ctx.prefix || '.'}tts en)`);
        text = text.slice(0, 200);

        await ctx.sock.sendPresenceUpdate('recording', ctx.from).catch(() => {});
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(text)}`;
        const audio = await http.get(url, { responseType: 'arraybuffer' });

        await ctx.sock.sendMessage(ctx.from, { audio: Buffer.from(audio), mimetype: 'audio/mpeg', ptt: false }, { quoted: ctx.msg });
    }
};
