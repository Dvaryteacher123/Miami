'use strict';

const https = require('https');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

module.exports = {
    name: 'define',
    category: 'utility',
    aliases: ['meaning', 'dictionary'],
    description: 'Get the definition of an English word',
    usage: '.define computer',
    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {
        const reply = async (text) => {
            await ctx.sock.sendMessage(
                ctx.from,
                { text: String(text) },
                { quoted: ctx.msg }
            );
        };

        try {
            const word = Array.isArray(ctx.args)
                ? ctx.args.join(' ').trim()
                : '';

            if (!word) {
                return reply(
                    '❌ Please provide a word.\n\n' +
                    'Example:\n' +
                    '`.define computer`'
                );
            }

            const url =
                `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;

            const data = await fetchJson(url);

            if (!Array.isArray(data) || !data[0]) {
                return reply(
                    `❌ No definition found for *${word}*.`
                );
            }

            const entry = data[0];

            const meanings = entry.meanings || [];

            let text = `╭━━━〔 📖 DEFINITION 〕━━━╮\n`;
            text += `┃\n`;
            text += `┃ 🔤 Word: *${entry.word || word}*\n`;

            if (entry.phonetic) {
                text += `┃ 🔊 ${entry.phonetic}\n`;
            }

            text += `┃\n`;

            meanings.slice(0, 3).forEach((meaning, index) => {
                const partOfSpeech =
                    meaning.partOfSpeech || 'Unknown';

                text += `┃ ${index + 1}. *${partOfSpeech}*\n`;

                const definitions = meaning.definitions || [];

                definitions.slice(0, 2).forEach((definition) => {
                    text += `┃ • ${definition.definition}\n`;
                });

                text += `┃\n`;
            });

            text += `╰━━━━━━━━━━━━━━━━━━━━╯`;

            return reply(text);

        } catch (error) {
            console.error('[DEFINE ERROR]', error);

            return reply(
                `❌ Could not find a definition.\n\n${error?.message || error}`
            );
        }
    }
};
