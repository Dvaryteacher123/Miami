'use strict';

/**
 * Small helper to define simple text commands with very little code.
 *   defineCommand({ name, category, aliases, description, usage, needsInput, lines, run })
 *   run({ text, args, prefix, ctx }) -> string (reply) | undefined
 *   lines:true  => `text` keeps line breaks (uses the raw message body)
 */

function stripCommand(raw, prefix, command) {
    let body = String(raw || '');
    const head = `${prefix || '.'}${command || ''}`;
    if (body.toLowerCase().startsWith(head.toLowerCase())) {
        body = body.slice(head.length);
    }
    return body.replace(/^[ \t]+/, '').replace(/\s+$/, '');
}

module.exports = function defineCommand(def) {
    return {
        name: def.name,
        category: def.category || 'utility',
        aliases: def.aliases || [],
        description: def.description || '',
        usage: `.${def.usage || def.name}`,
        ownerOnly: false,
        cooldown: def.cooldown === undefined ? 3 : def.cooldown,

        async execute(ctx) {
            const prefix = ctx.prefix || '.';
            const reply = (t) =>
                ctx.sock.sendMessage(ctx.from, { text: String(t) }, { quoted: ctx.msg });

            const args = Array.isArray(ctx.args) ? ctx.args : [];
            let text = args.join(' ').trim();

            if (def.lines) {
                const raw = stripCommand(ctx.text, prefix, ctx.command);
                if (raw) text = raw;
            }

            if (def.needsInput !== false && !text) {
                return reply(`❌ Usage: ${prefix}${def.usage || def.name}`);
            }

            try {
                const out = await def.run({ text, args, prefix, ctx });
                if (out !== undefined && out !== null && out !== '') {
                    return await reply(out);
                }
            } catch (error) {
                return reply(`❌ ${error && error.message ? error.message : 'Something went wrong'}`);
            }
        }
    };
};
