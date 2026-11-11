'use strict';

/**
 * PHONEPHIX BOT - startup logo + step-by-step instructions (English)
 */

let chalk;
try { chalk = require('chalk'); } catch (_) { chalk = null; }

const paint = (fn, s) => (chalk && chalk[fn] ? chalk[fn](s) : s);
const bold = (s) => (chalk ? chalk.bold(s) : s);

const LOGO = [
    ' ____  _   _  ___  _   _ _____ ____  _   _ ___ __  __',
    '|  _ \\| | | |/ _ \\| \\ | | ____|  _ \\| | | |_ _|\\ \\/ /',
    '| |_) | |_| | | | |  \\| |  _| | |_) | |_| || |  \\  / ',
    '|  __/|  _  | |_| | |\\  | |___|  __/|  _  || |  /  \\ ',
    '|_|   |_| |_|\\___/|_| \\_|_____|_|   |_| |_|___|/_/\\_\\'
];

const COLORS = ['magentaBright', 'magenta', 'redBright', 'yellowBright', 'greenBright'];

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbCRC9b5fM5cruU8PF2M';

function line(ch = '=', n = 54) { return ch.repeat(n); }

function logo(version) {
    console.log('');
    LOGO.forEach((l, i) => console.log('  ' + paint(COLORS[i % COLORS.length], l)));
    console.log('');
    console.log(paint('gray', '  ' + line('-')));
    console.log('  ' + bold('PHONEPHIX BOT') + paint('gray', `   |   single-user edition   |   v${version || '1.0.0'}`));
    console.log(paint('gray', '  ' + line('-')));
    console.log(paint('gray', '   Developer by Dvary   |   Connect - Chat - Enjoy'));
    console.log('');
}

function askNumberHelp() {
    console.log(bold('  HOW TO LINK YOUR WHATSAPP'));
    console.log('');
    console.log('  1. Type your WhatsApp number below, with the country code,');
    console.log('     no "+" and no spaces.');
    console.log(paint('gray', '     Example: 255712345678'));
    console.log('  2. Wait for your 8-character PAIR CODE.');
    console.log('  3. Open WhatsApp > Settings > Linked Devices > Link a Device');
    console.log('     > "Link with phone number instead" and enter the code.');
    console.log('');
    console.log(paint('gray', '  Hosting without a console to type in (Render, Railway, Heroku):'));
    console.log(paint('gray', '  set the environment variable  WHATSAPP_NUMBER=255712345678  and redeploy.'));
    console.log('');
}

/** big, unmissable prompt - always printed WITH a newline (panels hide a half-written line) */
function enterNumberPrompt(reminder) {
    console.log('');
    console.log(paint('yellowBright', '  +' + line('-', 56) + '+'));
    console.log(paint('yellowBright', '  |') + bold('   ENTER YOUR WHATSAPP NUMBER TO GET YOUR PAIR CODE'.padEnd(56)) + paint('yellowBright', '|'));
    console.log(paint('yellowBright', '  +' + line('-', 56) + '+'));
    console.log(bold('   >>> Type your number in the command box below, then press ENTER'));
    console.log(paint('gray', '       Example: 255712345678   (country code, no "+", no spaces)'));
    if (reminder) console.log(paint('gray', '       (still waiting for your number...)'));
    console.log('');
}

function noNumberHelp() {
    console.log('');
    console.log(paint('yellowBright', '  ' + line('!')));
    console.log(paint('yellowBright', '  NUMBER NOT SET'));
    console.log(paint('yellowBright', '  ' + line('!')));
    console.log('');
    console.log('  Open the Environment Variables of your hosting (Render, Railway,');
    console.log('  Heroku, panel...) and add:');
    console.log('');
    console.log(bold('      WHATSAPP_NUMBER=255712345678'));
    console.log('');
    console.log('  Then redeploy / restart. Your pair code will appear in the logs.');
    console.log('');
}

function pairCode(code, phone) {
    const c = String(code || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const shown = c.length === 8 ? `${c.slice(0, 4)}-${c.slice(4)}` : c;
    console.log('');
    console.log(paint('greenBright', '  ' + line('=')));
    console.log(paint('greenBright', '   YOUR PAIR CODE  -  ' + phone));
    console.log(paint('greenBright', '  ' + line('=')));
    console.log('');
    console.log('                  ' + bold(paint('yellowBright', shown)));
    console.log('');
    console.log('   WhatsApp > Linked Devices > Link a Device >');
    console.log('   "Link with phone number instead" > enter the code.');
    console.log(paint('gray', '   The code expires after a few minutes. A new one appears by itself.'));
    console.log(paint('greenBright', '  ' + line('=')));
    console.log('');
}

function connected(phone) {
    console.log('');
    console.log(paint('greenBright', '  [OK] Connected: ' + phone));
    console.log(paint('cyan', '  [..] Following channel: Phonephix Pro'));
    console.log(paint('gray', '       ' + CHANNEL_LINK));
    console.log('');
}

module.exports = { logo, askNumberHelp, enterNumberPrompt, noNumberHelp, pairCode, connected, CHANNEL_LINK };
