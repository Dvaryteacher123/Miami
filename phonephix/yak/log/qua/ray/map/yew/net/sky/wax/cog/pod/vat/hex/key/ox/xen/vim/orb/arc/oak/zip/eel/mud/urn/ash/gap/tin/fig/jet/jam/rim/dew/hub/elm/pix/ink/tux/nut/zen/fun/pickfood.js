'use strict';

/**
 * .pickfood - Decide what to eat (or give your own options)
 */

module.exports = {
    name: 'pickfood',
    category: 'fun',
    aliases: [],
    description: "Decide what to eat (or give your own options)",
    usage: ".pickfood [a, b, c]",
    emoji: '🍽️',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: String(t) }, { quoted: msg });
        const text = (args || []).join(' ').trim();
          const own = text.split(/[,|]/).map(s => s.trim()).filter(Boolean);
          const defaults = ['Pilau', 'Wali maharage', 'Ugali na nyama', 'Chipsi mayai', 'Mishkaki', 'Biriani', 'Makange', 'Samaki wa kupaka', 'Mandazi na chai', 'Pizza', 'Burger', 'Chapati na maharage'];
          const list = own.length >= 2 ? own : defaults;
          return reply('🍽️ *WHAT TO EAT?*\n\n👉 *' + list[Math.floor(Math.random() * list.length)] + '*');
    }
};
