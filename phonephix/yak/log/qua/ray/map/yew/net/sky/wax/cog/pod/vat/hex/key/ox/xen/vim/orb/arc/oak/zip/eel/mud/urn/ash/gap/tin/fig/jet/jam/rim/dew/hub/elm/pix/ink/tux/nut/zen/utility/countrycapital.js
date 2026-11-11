'use strict';
const CAPITALS = {
    tanzania: 'Dodoma', kenya: 'Nairobi', uganda: 'Kampala', rwanda: 'Kigali',
    'south africa': 'Pretoria', nigeria: 'Abuja', egypt: 'Cairo', ghana: 'Accra',
    usa: 'Washington D.C.', 'united states': 'Washington D.C.', uk: 'London',
    'united kingdom': 'London', france: 'Paris', germany: 'Berlin', china: 'Beijing',
    japan: 'Tokyo', india: 'New Delhi', brazil: 'Brasilia', canada: 'Ottawa',
    australia: 'Canberra', russia: 'Moscow'
};
module.exports = {
    name: 'countrycapital', category: 'utility', aliases: ['capital'],
    description: 'Get the capital city of a country', usage: '.countrycapital Tanzania', ownerOnly: false, cooldown: 3,
    async execute(ctx) {
        const { sock, from, msg, args } = ctx;
        const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
        const country = (args || []).join(' ').trim().toLowerCase();
        if (!country) return reply('❌ Usage: .countrycapital <country>');
        const cap = CAPITALS[country];
        if (!cap) return reply(`❌ Capital not found in my list for "${country}".`);
        return reply(`🏛️ The capital of ${country} is ${cap}.`);
    }
};
