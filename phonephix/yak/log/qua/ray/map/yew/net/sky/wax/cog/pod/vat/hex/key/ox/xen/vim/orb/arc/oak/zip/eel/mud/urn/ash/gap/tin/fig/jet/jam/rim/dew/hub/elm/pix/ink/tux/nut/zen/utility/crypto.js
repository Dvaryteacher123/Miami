'use strict';

const http = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/http');

const IDS = {
    btc: 'bitcoin', eth: 'ethereum', usdt: 'tether', bnb: 'binancecoin', sol: 'solana', xrp: 'ripple',
    doge: 'dogecoin', ada: 'cardano', ton: 'the-open-network', trx: 'tron', ltc: 'litecoin', matic: 'matic-network'
};

const fmt = (n) => (n === undefined || n === null ? '-' : Number(n).toLocaleString('en-US', { maximumFractionDigits: n < 1 ? 6 : 2 }));

module.exports = {
    name: 'crypto',
    category: 'utility',
    aliases: ['coin', 'price', 'bitcoin'],
    description: 'Crypto price in USD, KES and TZS (e.g. .crypto btc)',
    usage: '.crypto <coin>',
    emoji: '🪙',
    cooldown: 5,

    async execute(ctx) {
        const q = ((ctx.args || [])[0] || 'btc').toLowerCase();
        const id = IDS[q] || q;
        if (!/^[a-z0-9-]{2,40}$/.test(id)) return ctx.reply('❌ Invalid coin name.');

        const d = await http.get(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd,kes,tzs&include_24hr_change=true`);
        const c = d && d[id];
        if (!c) return ctx.reply(`❌ Coin not found. Try: ${Object.keys(IDS).join(', ')}`);

        const ch = c.usd_24h_change;
        return ctx.reply(
            `🪙 *${id.toUpperCase()}*\n\n💵 USD: $${fmt(c.usd)}\n🇰🇪 KES: ${fmt(c.kes)}\n🇹🇿 TZS: ${fmt(c.tzs)}\n` +
            (ch !== undefined ? `\n${ch >= 0 ? '📈' : '📉'} 24h: ${ch.toFixed(2)}%` : '')
        );
    }
};
