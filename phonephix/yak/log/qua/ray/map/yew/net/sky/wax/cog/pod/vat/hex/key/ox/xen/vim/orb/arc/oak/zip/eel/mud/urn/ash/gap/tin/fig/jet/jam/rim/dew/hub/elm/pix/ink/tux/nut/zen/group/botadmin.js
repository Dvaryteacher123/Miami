'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

module.exports = defineGroup({
    name: 'botadmin',
    aliases: ['amiadmin', 'checkbotadmin'],
    description: '🤖 Check whether the bot is an admin in this group',
    async run({ botIsAdmin, reply }) {
        return reply(botIsAdmin
            ? '✅ I am an *admin* in this group. All group commands will work.'
            : '⚠️ I am *not an admin*. Make me an admin so commands like kick, add, open/close and link can work.');
    }
});
