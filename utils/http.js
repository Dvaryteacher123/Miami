'use strict';

const axios = require('axios');

const UA = 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36';

/** GET json (or any) with sane defaults. Throws a short readable error. */
async function get(url, opts = {}) {
    try {
        const res = await axios.get(url, {
            timeout: opts.timeout || 20000,
            headers: { 'User-Agent': UA, Accept: '*/*', ...(opts.headers || {}) },
            responseType: opts.responseType || 'json',
            maxContentLength: 25 * 1024 * 1024,
            validateStatus: (s) => s >= 200 && s < 300
        });
        return res.data;
    } catch (e) {
        const status = e && e.response && e.response.status;
        if (status === 404) throw new Error('Not found.');
        if (status === 429) throw new Error('Too many requests, try again in a minute.');
        throw new Error(status ? `Service error (${status}).` : 'Service unreachable, try again later.');
    }
}

module.exports = { get, UA };
