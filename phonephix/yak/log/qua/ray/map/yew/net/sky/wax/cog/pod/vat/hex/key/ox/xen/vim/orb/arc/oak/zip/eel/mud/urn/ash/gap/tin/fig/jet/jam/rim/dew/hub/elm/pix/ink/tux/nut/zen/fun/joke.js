'use strict';

module.exports = {
    name: 'joke',
    category: 'fun',
    aliases: ['funny'],
    description: 'Get a random joke',
    usage: '.joke',
    ownerOnly: false,
    cooldown: 5,

    async execute(ctx) {
        const reply = async text => {
            await ctx.sock.sendMessage(
                ctx.from,
                { text: String(text) },
                { quoted: ctx.msg }
            );
        };

        const jokes = [
            'Why did the computer go to the doctor? Because it had a virus. 😂',
            'Why was the math book sad? Because it had too many problems. 🤣',
            'Why did the phone wear glasses? Because it lost its contacts. 😂',
            'What do you call a sleeping bull? A bulldozer. 🐂😂',
            'Why did the Wi-Fi break up with the router? No connection. 💔😂',
            'Why did the developer go broke? Because he used up all his cache. 💻😂',
            'What do you call fake spaghetti? An impasta. 🍝😂',
            'Why was the computer cold? It left its Windows open. 🪟😂',
            'Why did the cookie go to the hospital? It felt crumby. 🍪😂',
            'What do you call a bear without teeth? A gummy bear. 🐻😂'
        ];

        return reply(
            `😂 *RANDOM JOKE*\n\n` +
            jokes[Math.floor(Math.random() * jokes.length)]
        );
    }
};
