'use strict';
const defineGroup = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/groupKit');

const QUESTIONS = [
    'If you could travel anywhere tomorrow, where would you go? ✈️',
    'What is your favourite food of all time? 🍕',
    'What song have you had on repeat lately? 🎧',
    'What is the best advice you ever received? 💡',
    'If you won the lottery today, what is the first thing you would buy? 💰',
    'What is one skill you would love to learn? 🎓',
    'Morning person or night owl? 🌅🌙',
    'What is your all-time favourite movie or series? 🎬',
    'What is the funniest thing that happened to you this week? 😂',
    'If you had a superpower for one day, what would it be? 🦸',
    'Which app do you use the most? 📱',
    'What is your dream job? 💼'
];
module.exports = defineGroup({
    name: 'icebreaker',
    emoji: '🧊',
    aliases: ['ice', 'conversation', 'starter'],
    description: '🧊 Get a fun question to start a conversation',
    cooldown: 5,
    async run({ pool, pick, num, reply }) {
        const target = pick(pool);
        const who = target ? `\n\n👉 First to answer: @${num(target)}` : '';
        return reply(`🧊 *ICEBREAKER*\n\n${pick(QUESTIONS)}${who}`, target ? [target] : []);
    }
});
