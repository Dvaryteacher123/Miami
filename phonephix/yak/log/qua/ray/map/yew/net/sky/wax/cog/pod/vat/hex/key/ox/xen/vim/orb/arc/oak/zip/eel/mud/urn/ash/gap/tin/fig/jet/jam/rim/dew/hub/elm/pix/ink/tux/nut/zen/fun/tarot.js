'use strict';

const CARDS = [
    'The Fool — new beginnings', 'The Magician — willpower', 'The High Priestess — intuition',
    'The Empress — abundance', 'The Emperor — structure', 'The Lovers — connection',
    'The Chariot — determination', 'Strength — courage', 'The Hermit — reflection',
    'Wheel of Fortune — change', 'Justice — fairness', 'The Hanged Man — letting go',
    'Death — transformation', 'Temperance — balance', 'The Star — hope',
    'The Moon — uncertainty', 'The Sun — joy', 'Judgement — awakening', 'The World — completion'
];

module.exports = {
    name: 'tarot',
    category: 'fun',
    aliases: ['tarotcard'],
    description: 'Draw a random tarot card',
    usage: '.tarot',
    ownerOnly: false,
    cooldown: 3,

    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        const card = CARDS[Math.floor(Math.random() * CARDS.length)];
        return reply(`🃏 *TAROT DRAW*\n\n${card}`);
    }
};
