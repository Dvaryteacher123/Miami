'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'smallcaps',
    category: 'utility',
    aliases: [],
    description: 'Convert text to ꜱᴍᴀʟʟ ᴄᴀᴘꜱ',
    usage: 'smallcaps <text>',
    needsInput: true,
    lines: false,
    run: ({ text }) => {
        const SC = Array.from('ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ');
        return '🔤 *SMALL CAPS*\n\n' + Array.from(text.toLowerCase())
            .map((c) => (c >= 'a' && c <= 'z' ? SC[c.charCodeAt(0) - 97] : c)).join('');
    }
});
