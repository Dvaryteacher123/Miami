'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'timein',
    category: 'utility',
    aliases: [],
    description: 'Current time in a city/timezone',
    usage: 'timein <city or Area/City>',
    needsInput: false,
    lines: false,
    run: ({ text }) => {
        const map = { dar: 'Africa/Dar_es_Salaam', daressalaam: 'Africa/Dar_es_Salaam', nairobi: 'Africa/Nairobi', kampala: 'Africa/Kampala', lagos: 'Africa/Lagos', cairo: 'Africa/Cairo', johannesburg: 'Africa/Johannesburg', london: 'Europe/London', paris: 'Europe/Paris', dubai: 'Asia/Dubai', delhi: 'Asia/Kolkata', tokyo: 'Asia/Tokyo', beijing: 'Asia/Shanghai', sydney: 'Australia/Sydney', newyork: 'America/New_York', losangeles: 'America/Los_Angeles' };
        const raw = (text || 'dar').trim();
        const tz = map[raw.toLowerCase().replace(/[\s_]+/g, '')] || raw;
        let out;
        try {
            out = new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
        } catch (_) {
            throw new Error('Unknown timezone. Try: nairobi, dar, london, dubai, newyork, delhi, tokyo, or Africa/Cairo');
        }
        return `🕒 *TIME IN ${tz.toUpperCase()}*\n\n${out}`;
    }
});
