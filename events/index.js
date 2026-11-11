'use strict';

const fs = require('fs');
const path = require('path');

const events = new Map();

const EVENTS_DIR = __dirname;

function loadEvent(filePath) {
    try {
        if (!filePath.endsWith('.js')) return;
        if (path.basename(filePath) === 'index.js') return;

        delete require.cache[require.resolve(filePath)];

        const event = require(filePath);

        if (!event) return;

        const name = String(event.name || '').trim();

        if (!name) {
            console.warn(
                `[EVENT LOADER] Missing name: ${filePath}`
            );
            return;
        }

        if (typeof event.execute !== 'function') {
            console.warn(
                `[EVENT LOADER] Missing execute(): ${filePath}`
            );
            return;
        }

        event.filePath = filePath;

        if (!events.has(name)) {
            events.set(name, []);
        }

        events.get(name).push(event);

        console.log(
            `[EVENT LOADED] ${name} -> ${path.relative(
                EVENTS_DIR,
                filePath
            )}`
        );

    } catch (error) {
        console.error(
            `[EVENT LOAD ERROR] ${filePath}`,
            error
        );
    }
}

function scanDirectory(directory) {
    if (!fs.existsSync(directory)) return;

    const entries = fs.readdirSync(
        directory,
        { withFileTypes: true }
    );

    for (const entry of entries) {
        const fullPath = path.join(
            directory,
            entry.name
        );

        if (entry.isDirectory()) {
            scanDirectory(fullPath);
            continue;
        }

        if (
            entry.isFile() &&
            entry.name.endsWith('.js')
        ) {
            loadEvent(fullPath);
        }
    }
}

function loadEvents() {
    events.clear();

    scanDirectory(EVENTS_DIR);

    let total = 0;

    for (const handlers of events.values()) {
        total += handlers.length;
    }

    console.log(
        `[EVENT LOADER] ${total} event handlers loaded`
    );

    return events;
}

function getEvents(name) {
    if (!name) {
        return events;
    }

    return events.get(name) || [];
}

async function runEvents(name, ctx) {
    const handlers = events.get(name);

    if (
        !handlers ||
        handlers.length === 0
    ) {
        return false;
    }

    let executed = false;

    for (const event of handlers) {
        try {
            await event.execute(ctx);
            executed = true;
        } catch (error) {
            console.error(
                `[EVENT ERROR] ${name}`,
                error
            );
        }
    }

    return executed;
}

async function runEvent(name, ctx) {
    const handlers = events.get(name);

    if (
        !handlers ||
        handlers.length === 0
    ) {
        return false;
    }

    await handlers[0].execute(ctx);

    return true;
}

loadEvents();

module.exports = {
    loadEvents,
    getEvents,
    runEvents,
    runEvent
};
