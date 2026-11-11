'use strict';

const moment = require('moment-timezone');

const DEFAULTS = [
    ['Nairobi', 'Africa/Nairobi'], ['Dar es Salaam', 'Africa/Dar_es_Salaam'], ['Kampala', 'Africa/Kampala'],
    ['Johannesburg', 'Africa/Johannesburg'], ['Lagos', 'Africa/Lagos'], ['Dubai', 'Asia/Dubai'],
    ['London', 'Europe/London'], ['New York', 'America/New_York'], ['Tokyo', 'Asia/Tokyo']
];

module.exports = {
    name: 'worldtime',
    category: 'utility',
    aliases: ['wtime', 'timeat'],
    description: 'Time in any city (e.g. .worldtime Tokyo) or in the main cities',
    usage: '.worldtime [city]',
    emoji: '🌍',
    cooldown: 3,

    async execute(ctx) {
        const q = (ctx.args || []).join('_').trim().toLowerCase();

        if (!q) {
            const rows = DEFAULTS.map(([n, z]) => `• ${n}: ${moment().tz(z).format('ddd HH:mm')}`);
            return ctx.reply(`🌍 *WORLD TIME*\n\n${rows.join('\n')}\n\nTry: ${ctx.prefix || '.'}worldtime Paris`);
        }

        const zones = moment.tz.names();
        const zone = zones.find((z) => z.toLowerCase() === q) ||
            zones.find((z) => z.toLowerCase().split('/').pop() === q) ||
            zones.find((z) => z.toLowerCase().includes(q));
        if (!zone) return ctx.reply('❌ City/timezone not found. Try a big city name, e.g. Tokyo, Paris, Nairobi.');

        const m = moment().tz(zone);
        return ctx.reply(`🌍 *${zone.replace(/_/g, ' ')}*\n\n🕒 ${m.format('HH:mm:ss')}\n📅 ${m.format('dddd, D MMMM YYYY')}\n🧭 UTC${m.format('Z')}`);
    }
};
