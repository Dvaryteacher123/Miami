'use strict';
module.exports = {
    name: 'speedconvert', category: 'utility', aliases: ['kmhtomph'],
    description: 'Convert speed between km/h and mph', usage: '.speedconvert 100kmh or .speedconvert 60mph', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const input = (args?.[0] || '').toLowerCase();
        const m = input.match(/^(\d+(?:\.\d+)?)(kmh|mph)$/);
        if (!m) return reply('❌ Usage: .speedconvert 100kmh  or  .speedconvert 60mph');
        const value = parseFloat(m[1]);
        if (m[2] === 'kmh') return reply(`🚗 ${value} km/h = ${(value * 0.621371).toFixed(2)} mph`);
        return reply(`🚗 ${value} mph = ${(value / 0.621371).toFixed(2)} km/h`);
    }
};
