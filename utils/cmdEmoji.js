'use strict';

/**
 * Emoji used to REACT to every command message.
 * Priority: command.emoji  ->  exact name  ->  keyword  ->  category default.
 * Turn off with COMMAND_REACT=false in .env
 */

let groupEmojis = {};
try { groupEmojis = require('./groupEmojis'); } catch (_) {}

const EXACT = {
    menu: '📜', help: '🆘', ping: '🏓', alive: '💚', uptime: '⏱️', runtime: '⏱️', status: '📡', botinfo: '🤖', bot: '🤖',
    owner: '👑', pair: '🔑', qrpair: '📷', greet: '👋', greeting: '👋', say: '🗣️', repeat: '🔁', mode: '⚙️', version: '🏷️',
    id: '🆔', stats: '📊', time: '🕒', timein: '🌍', weather: '⛅', search: '🔎', sticker: '🌟', toimg: '🖼️', getpp: '🖼️',
    play: '🎵', song: '🎵', music: '🎵', audio: '🎧', mp3: '🎧', ytmp3: '🎧', ytmp4: '🎬', video: '🎬', songvideo: '🎬',
    lyrics: '🎤', songsearch: '🔎', preview: '🎧', musiccheck: '🧪', audius: '🎵', ytsearch: '🔎',
    tiktok: '🎶', instagram: '📸', facebook: '📘', qr: '📷', qrcode: '📷', ai: '🤖', gpt: '🤖', ask: '💬',
    joke: '😂', aijoke: '😂', dadjoke: '😂', meme: '😆', quote: '💬', fact: '💡', riddle: '🧩', trivia: '🧠', quizme: '🧠',
    poem: '✍️', story: '📖', recipe: '🍳', email: '📧', caption: '📝', hashtags: '#️⃣', ideas: '💡', bizidea: '💼',
    advice: '🧭', summarize: '📑', rewrite: '✏️', grammar: '✅', explain: '🔍', aitranslate: '🌐', code: '💻', debug: '🐞',
    aidefine: '📚', define: '📚', translate: '🌐', calc: '🧮', sum: '➕', convert: '🔄', password: '🔐', passgen: '🔐',
    hug: '🤗', slap: '👋', kill: '💀', roast: '🔥', compliment: '💖', praise: '👏', flirtlevel: '😘', lovecalc: '💘',
    dice: '🎲', coinflip: '🪙', rps: '✂️', spin: '🎡', tarot: '🔮', horoscope: '♈', zodiacsign: '♈', '8ball': '🎱',
    truth: '🫣', dare: '😈', tod: '🎯', hangman: '🔤', wouldurather: '🤔', thisorthat: '⚖️', yesno: '❓',
    goodmorning: '🌅', goodnight: '🌙', birthday: '🎂', wishbday: '🎂', congrats: '🎉', thankyou: '🙏',
    welcome: '🎉', goodbye: '👋', tagall: '📢', hidetag: '👻', kick: '👢', add: '➕', promote: '⬆️', demote: '⬇️',
    mute: '🔇', unmute: '🔊', warn: '⚠️', ban: '🔨', unban: '✅', block: '⛔', unblock: '✅', broadcast: '📣',
    statuslike: '💚', status: '👁️', restart: '♻️', setprefix: '⚙️', autotyping: '⌨️', vv: '👀', whisper: '🤫', take: '📥', vcf: '📇', photograph: '📷'
};

const KEYWORDS = [
    [/^(set|change|edit)/, '⚙️'], [/(anti|lock|block|ban)/, '🛡️'], [/(tag|mention)/, '📢'],
    [/(binary|hex|base64|morse|encode|decode|cipher|rot|hash|caesar|atbash|vigenere|leet)/, '🔣'],
    [/(zodiac|horoscope|luck)/, '🔮'], [/(love|couple|crush|pair)/, '💘'], [/(joke|funny|laugh)/, '😂'],
    [/(count|length|char|word|sentence|vowel|consonant)/, '🔢'], [/(case|caps|title|snake|camel|kebab|slug)/, '🔤'],
    [/(prime|factor|fib|sqrt|power|lcm|gcd|median|average|percent|ratio|roman|digit|number|num)/, '🧮'],
    [/(money|interest|loan|tax|vat|profit|discount|tip|bill|emi|roi|salary)/, '💰'],
    [/(date|day|week|month|year|age|time|countdown)/, '📅'], [/(color|colour|rgb|hex)/, '🎨'],
    [/(random|pick|shuffle|raffle)/, '🎲'], [/(text|string|reverse|mirror|upside|sort|dedupe|trim|wrap)/, '🔤'],
    [/(group|admin|member)/, '👥'], [/(image|img|photo|pic|blur|circle|frame|gif|wallpaper)/, '🖼️'],
    [/(audio|voice|sound|bass|slow|nightcore)/, '🎧'], [/(video|clip)/, '🎬'], [/(note|memo|rule)/, '📝']
];

const CATEGORY = {
    general: '✨', ai: '🤖', media: '🎬', fun: '🎉', group: '👥', utility: '🛠️', owner: '👑', mode: '⚙️'
};

function emojiFor(cmd) {
    if (!cmd) return '✨';
    if (typeof cmd.emoji === 'string' && cmd.emoji.trim()) return cmd.emoji.trim();
    const name = String(cmd.name || '').toLowerCase();
    if (EXACT[name]) return EXACT[name];
    if (groupEmojis[name]) return groupEmojis[name];
    for (const [re, e] of KEYWORDS) if (re.test(name)) return e;
    return CATEGORY[String(cmd.category || '').toLowerCase()] || '✨';
}

module.exports = { emojiFor };
