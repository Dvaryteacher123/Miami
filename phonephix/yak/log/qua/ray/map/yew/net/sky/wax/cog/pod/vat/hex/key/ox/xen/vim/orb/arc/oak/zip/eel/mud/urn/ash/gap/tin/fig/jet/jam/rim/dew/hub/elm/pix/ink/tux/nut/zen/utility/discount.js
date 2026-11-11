'use strict';
module.exports = {
    name: 'discount', category: 'utility', aliases: [],
    description: 'Calculate discounted price: .discount <price> <percent_off>', usage: '.discount 100 20', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const price = parseFloat(args?.[0]), pct = parseFloat(args?.[1]);
        if (isNaN(price) || isNaN(pct)) return reply('❌ Usage: .discount <price> <percent_off>');
        const saved = (price * pct) / 100;
        return reply(`🏷️ *DISCOUNT*\n\nOriginal: ${price}\nDiscount: ${pct}% (-${saved.toFixed(2)})\nFinal price: ${(price - saved).toFixed(2)}`);
    }
};
