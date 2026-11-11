'use strict';
module.exports = {
    name: 'hextorgb',
    category: 'utility',
    aliases: ['hex2rgb'],
    description: 'Convert a hex color code to RGB',
    usage: '.hextorgb <#hex>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        let hex = String(ctx.args?.[0] || '').trim().replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        if (!/^[0-9a-fA-F]{6}$/.test(hex)) return reply(`❌ Usage: ${ctx.prefix || '.'}hextorgb <#RRGGBB>`);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return reply(`🎨 *HEX → RGB*\n\n#${hex.toUpperCase()} → rgb(${r}, ${g}, ${b})`);
    }
};
