'use strict';

/* Turn normal text into stylish unicode fonts you can paste anywhere. */

const range = (up, low, dig, ex = {}) => (c) => {
    const code = c.codePointAt(0);
    if (ex[c]) return ex[c];
    if (code >= 65 && code <= 90 && up) return String.fromCodePoint(up + code - 65);
    if (code >= 97 && code <= 122 && low) return String.fromCodePoint(low + code - 97);
    if (code >= 48 && code <= 57 && dig) return String.fromCodePoint(dig + code - 48);
    return c;
};

const circled = (c) => {
    const code = c.codePointAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x24B6 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x24D0 + code - 97);
    if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + code - 49);
    if (code === 48) return '⓪';
    return c;
};

const SMALLCAPS = 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ';
const smallcaps = (c) => {
    const code = c.toLowerCase().codePointAt(0);
    return code >= 97 && code <= 122 ? SMALLCAPS[code - 97] : c;
};

const STYLES = [
    ['Bold', range(0x1D400, 0x1D41A, 0x1D7CE)],
    ['Italic', range(0x1D434, 0x1D44E, 0, { h: 'ℎ' })],
    ['Bold Italic', range(0x1D468, 0x1D482, 0x1D7CE)],
    ['Script', range(0x1D4D0, 0x1D4EA, 0x1D7CE)],
    ['Gothic', range(0x1D56C, 0x1D586, 0x1D7CE)],
    ['Sans', range(0x1D5A0, 0x1D5BA, 0x1D7E2)],
    ['Sans Bold', range(0x1D5D4, 0x1D5EE, 0x1D7EC)],
    ['Monospace', range(0x1D670, 0x1D68A, 0x1D7F6)],
    ['Circled', circled],
    ['Small Caps', smallcaps]
];

module.exports = {
    name: 'fancy',
    category: 'utility',
    aliases: ['fancytext', 'fonts', 'stylish'],
    description: 'Turn text into 10 fancy fonts',
    usage: '.fancy <text>',
    emoji: '🔤',
    cooldown: 3,

    async execute(ctx) {
        const text = (ctx.args || []).join(' ').trim().slice(0, 80);
        if (!text) return ctx.reply(`❌ Usage: ${ctx.prefix || '.'}fancy Phonephix Bot`);

        const out = STYLES.map(([name, fn]) => `*${name}*\n${Array.from(text).map(fn).join('')}`);
        return ctx.reply(`🔤 *FANCY TEXT*\n\n${out.join('\n\n')}`);
    }
};
