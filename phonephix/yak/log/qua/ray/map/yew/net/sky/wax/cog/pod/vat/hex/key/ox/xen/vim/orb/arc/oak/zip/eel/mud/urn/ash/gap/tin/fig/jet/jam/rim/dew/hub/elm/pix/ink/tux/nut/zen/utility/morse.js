'use strict';

const CODE = {
    a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.',
    h: '....', i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.',
    o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-', u: '..-',
    v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    ' ': '/'
};
const REVERSE = Object.fromEntries(Object.entries(CODE).map(([k, v]) => [v, k]));

module.exports = {
    name: 'morse',
    category: 'utility',
    aliases: [],
    description: 'Encode/decode Morse code. Prefix with "decode " to decode.',
    usage: '.morse <text> | .morse decode <code>',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        if (!args || !args.length) return reply('❌ Usage: .morse <text>  or  .morse decode <code>');

        if (args[0].toLowerCase() === 'decode') {
            const code = args.slice(1).join(' ');
            const out = code.split(' ').map((c) => REVERSE[c] ?? c).join('');
            return reply(`📡 *DECODED*\n\n${out || '(nothing)'}`);
        }

        const text = args.join(' ').toLowerCase();
        const out = text.split('').map((c) => CODE[c] ?? c).join(' ');
        return reply(`📡 *MORSE CODE*\n\n${out}`);
    }
};
