'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'upsidedown',
    category: 'utility',
    aliases: [],
    description: 'Flip text upside down',
    usage: 'upsidedown <text>',
    needsInput: true,
    lines: false,
    run: ({ text }) => {
        const from = 'abcdefghijklmnopqrstuvwxyz';
        const to = Array.from('ɐqɔpǝɟɓɥᴉɾʞlɯuodbɹsʇnʌʍxʎz');
        const extra = { '?': '¿', '!': '¡', '.': '˙', ',': "'", '(': ')', ')': '(', '[': ']', ']': '[', '<': '>', '>': '<', '_': '‾', '&': '⅋', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0' };
        const out = Array.from(text.toLowerCase()).map((c) => {
            const i = from.indexOf(c);
            return i >= 0 ? to[i] : (extra[c] || c);
        });
        return '🙃 *UPSIDE DOWN*\n\n' + out.reverse().join('');
    }
});
