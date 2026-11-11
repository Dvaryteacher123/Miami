'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'jsonminify',
    category: 'utility',
    aliases: [],
    description: 'Minify JSON to one line',
    usage: 'jsonminify <json>',
    needsInput: true,
    lines: true,
    run: ({ text }) => {
        let obj;
        try { obj = JSON.parse(text); } catch (_) { throw new Error('Invalid JSON'); }
        return '```' + JSON.stringify(obj) + '```';
    }
});
