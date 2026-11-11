'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'jsonformat',
    category: 'utility',
    aliases: [],
    description: 'Pretty-print JSON',
    usage: 'jsonformat <json>',
    needsInput: true,
    lines: true,
    run: ({ text }) => {
        let obj;
        try { obj = JSON.parse(text); } catch (_) { throw new Error('Invalid JSON'); }
        return '```' + JSON.stringify(obj, null, 2) + '```';
    }
});
