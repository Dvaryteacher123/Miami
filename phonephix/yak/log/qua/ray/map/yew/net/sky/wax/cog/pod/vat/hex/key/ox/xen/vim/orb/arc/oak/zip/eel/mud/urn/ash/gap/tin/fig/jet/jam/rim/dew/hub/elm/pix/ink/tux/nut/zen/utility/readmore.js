'use strict';

module.exports = {
    name: 'readmore',
    category: 'utility',
    aliases: ['rm', 'spoiler'],
    description: 'Make a "Read more" message. Split with | e.g. .readmore Hello | secret part',
    usage: '.readmore <visible> | <hidden>',
    emoji: '📜',
    cooldown: 2,

    async execute(ctx) {
        const raw = String(ctx.text || '').trim();
        const head = `${ctx.prefix || '.'}${ctx.command}`;
        const body = raw.toLowerCase().startsWith(head.toLowerCase()) ? raw.slice(head.length).trim() : raw;
        if (!body.includes('|')) {
            return ctx.reply(`❌ Usage: ${ctx.prefix || '.'}readmore visible text | hidden text`);
        }
        const [first, ...rest] = body.split('|');
        const text = `${first.trim()} ${'​'.repeat(4001)}${rest.join('|').trim()}`;
        return ctx.sock.sendMessage(ctx.from, { text }, { quoted: ctx.msg });
    }
};
