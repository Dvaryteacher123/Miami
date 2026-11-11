'use strict';

const PREFIX = ['Shadow', 'Golden', 'Mighty', 'Silent', 'Blazing', 'Iron', 'Cosmic', 'Silver'];
const SUFFIX = ['Wolf', 'Falcon', 'Tiger', 'Dragon', 'Phoenix', 'Storm', 'Ranger', 'Knight'];

module.exports = {
    name: 'nickname',
    category: 'fun',
    aliases: ['coolname'],
    description: 'Generate a random cool nickname',
    usage: '.nickname',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const name = `${PREFIX[Math.floor(Math.random() * PREFIX.length)]}${SUFFIX[Math.floor(Math.random() * SUFFIX.length)]}${Math.floor(Math.random() * 100)}`;
        return reply(`🏷️ *YOUR NICKNAME*\n\n${name}`);
    }
};
