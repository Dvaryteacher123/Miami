'use strict';

const http = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/http');

module.exports = {
    name: 'ipinfo',
    category: 'utility',
    aliases: ['ip', 'iplookup'],
    description: 'Look up the location and provider of an IP address',
    usage: '.ipinfo <ip>',
    emoji: '🌐',
    cooldown: 5,

    async execute(ctx) {
        const ip = ((ctx.args || [])[0] || '').trim();
        if (!/^[0-9a-fA-F:.]{3,45}$/.test(ip)) return ctx.reply(`❌ Usage: ${ctx.prefix || '.'}ipinfo 8.8.8.8`);

        const d = await http.get(`https://ipwho.is/${encodeURIComponent(ip)}`);
        if (!d || d.success === false) return ctx.reply('❌ Invalid or unknown IP address.');

        return ctx.reply(
            `🌐 *IP INFO*\n\n` +
            `🔢 IP: ${d.ip}\n🌍 Country: ${d.country} ${d.flag?.emoji || ''}\n` +
            `🏙️ Region/City: ${d.region || '-'} / ${d.city || '-'}\n` +
            `🏢 ISP: ${d.connection?.isp || '-'}\n🕒 Timezone: ${d.timezone?.id || '-'}\n` +
            `📍 ${d.latitude}, ${d.longitude}`
        );
    }
};
