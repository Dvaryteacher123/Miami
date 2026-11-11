<div align="center">

<img src="assets/banner.png" alt="Phonephix Bot" width="420" />

# 🌸 Phonephix Bot

**Secure · Fast · Powerful · Premium**
Developer by **Dvary** — Connect · Chat · Enjoy

[Join the Phonephix Pro channel](https://whatsapp.com/channel/0029VbCRC9b5fM5cruU8PF2M)

</div>

---

## ✨ How it works
One bot = one WhatsApp number. No website, no Telegram.

1. Deploy it (Render, Railway, Heroku, VPS or a panel).
2. The **PHONEPHIX** logo appears in the console/logs with step-by-step instructions.
3. Enter your number (e.g. `255712345678`) in the console, or set the `WHATSAPP_NUMBER` environment variable.
4. The bot shows an **8-character PAIR CODE** → WhatsApp › Settings › Linked Devices › Link a Device › *Link with phone number instead*.
5. Once linked, your number **automatically follows the Phonephix Pro channel**.

## 🚀 Deploy
- **VPS / panel:** `npm install` → `npm start` → type your number in the console.
- **Render / Railway / Heroku:** set `WHATSAPP_NUMBER=255712345678` in *Environment Variables* and deploy. The pair code appears in the **Logs**.
  - Render: use a *Web Service* (a tiny "Phonephix Bot is running" page answers on `PORT`) or a *Background Worker*.
  - Heroku / Railway: a `Procfile` is included (`worker: node server.js`).
  - **Important:** attach a persistent disk/volume and point `DATA_DIR` to it. Otherwise the session is lost on every redeploy and you must pair again.

## 🌷 Menu
`.menu` shows every command in boxed categories with flowers. `.menu <category>` shows a single category.

## 🔒 Protection
- Only one session can ever run. A second one is refused.
- A signed lock ties the bot to the first number that linked.
- If the number that logs in is different from the lock, the session is deleted.
- Every shipped code file (`.js`) is fingerprinted in a signed manifest. If any of them is **edited or deleted**, the bot shuts down and refuses to start. Adding new files (your own commands, extra files, docs) is fine.
- Pair-code requests are limited (4 per hour, 45 s apart).
- There is no `.pair` command, web panel or Telegram bot to add more people.

> To see which file triggered a shutdown, set `INTEGRITY_DEBUG=true` and start the bot once.

## 🍴 Forking on GitHub
1. Click **Fork**.
2. Deploy the fork (Render, Railway, Heroku, VPS or a panel).
3. Put **your own** keys in *Environment Variables* (see the next section). Never commit a `.env` file.
4. Do not edit the shipped `.js` files — the bot shuts itself down if they change. Your own commands go in `phonephix/custom/`.

## 🔑 Your own AI and music APIs (allowed)
API keys and API addresses live **outside the protected code**, so you can change them freely without the bot shutting down.

**1. Environment variables** (Render/Railway/Heroku "Environment Variables", or a `.env` file):

| Variable | What it does |
|---|---|
| `AI_API_KEY` | Your AI key (any OpenAI-compatible service, e.g. Groq, OpenAI, OpenRouter) |
| `AI_API_URL` | The service address, e.g. `https://api.groq.com/openai/v1` |
| `AI_MODEL` | Model name, e.g. `llama-3.1-8b-instant` |
| `WEATHER_API_KEY` | OpenWeather key for `.weather` |
| `MUSIC_PROVIDERS` | Order of music sources, e.g. `saavn,piped,soundcloud,youtube,community,audius,deezer` |
| `SAAVN_API_URLS` | Your JioSaavn API addresses, comma separated |
| `PIPED_INSTANCES` | Your Piped instances, comma separated |
| `MUSIC_API_BASES` | Extra YouTube-download API addresses, comma separated |
| `YT_PROXY` | Optional proxy for YouTube |

**2. Community music APIs file** — create `data/music-apis.json` (the `data/` folder is never checked):

```json
[
  { "name": "my-api-1", "url": "https://example.com/api/ytmp3?url={url}" },
  { "name": "my-api-2", "url": "https://example.org/download?link={url}" }
]
```
`{url}` is replaced with the song link. A sample is in `music-apis.example.json`.

**3. YouTube cookies (optional)** — save them as `data/cookies.txt`.

Restart the bot after changing variables or files.

## ➕ Adding your own commands
Put each command as a `.js` file in `phonephix/custom/`. Nothing else needs to change. They appear in the menu under **🌟 CUSTOM**.

(The built-in commands are buried 40 folders deep inside `phonephix/` — good luck finding them. 🌸)

### Template — `phonephix/custom/hello.js`
```js
'use strict';

module.exports = {
    name: 'hello',                 // used as  .hello
    category: 'custom',
    aliases: ['hi2'],              // optional
    description: 'Say hello',
    usage: '.hello',
    ownerOnly: false,              // true = only the paired owner
    cooldown: 3,                   // seconds between uses

    async execute(ctx) {
        const { sock, from, msg } = ctx;
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        return reply('🌸 Hello from Phonephix Bot!');
    }
};
```

Useful `ctx` fields: `sock` (WhatsApp socket), `from` (chat id), `msg` (the message), `args` (words after the command), `prefix`, `senderPhone`.
