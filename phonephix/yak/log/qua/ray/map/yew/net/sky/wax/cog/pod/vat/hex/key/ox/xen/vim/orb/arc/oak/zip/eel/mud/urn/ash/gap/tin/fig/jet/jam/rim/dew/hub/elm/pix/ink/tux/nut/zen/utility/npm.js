'use strict';

const http = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/http');

module.exports = {
    name: 'npm',
    category: 'utility',
    aliases: ['npmjs', 'npmpkg'],
    description: 'Show info about an npm package',
    usage: '.npm <package>',
    emoji: '📦',
    cooldown: 5,

    async execute(ctx) {
        const name = ((ctx.args || [])[0] || '').trim();
        if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i.test(name)) {
            return ctx.reply(`❌ Usage: ${ctx.prefix || '.'}npm axios`);
        }

        const d = await http.get(`https://registry.npmjs.org/${name.replace('/', '%2F')}/latest`);
        let weekly = '-';
        try {
            const w = await http.get(`https://api.npmjs.org/downloads/point/last-week/${name}`);
            if (w && w.downloads !== undefined) weekly = Number(w.downloads).toLocaleString('en-US');
        } catch (_) {}

        return ctx.reply(
            `📦 *${d.name}* v${d.version}\n\n${d.description || ''}\n\n` +
            `⬇️ Weekly downloads: ${weekly}\n📜 License: ${d.license || '-'}\n` +
            (d.homepage ? `🔗 ${d.homepage}\n` : '') +
            `\n💻 npm i ${d.name}`
        );
    }
};
