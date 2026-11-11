'use strict';
module.exports = {
    name: 'rgbtohex',
    category: 'utility',
    aliases: ['rgb2hex'],
    description: 'Convert RGB values to a hex color code',
    usage: '.rgbtohex <r> <g> <b>',
    ownerOnly: false,
    cooldown: 5,
    async execute(ctx) {
        const reply = (t) => ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });
        const [r, g, b] = (ctx.args || []).map(n => parseInt(n, 10));
        if ([r, g, b].some(n => Number.isNaN(n) || n < 0 || n > 255)) {
            return reply(`❌ Usage: ${ctx.prefix || '.'}rgbtohex <r 0-255> <g 0-255> <b 0-255>`);
        }
        const hex = '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('').toUpperCase();
        return reply(`🎨 *RGB → HEX*\n\nrgb(${r}, ${g}, ${b}) → ${hex}`);
    }
};
