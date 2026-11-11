'use strict';

/** Calling code -> country name (longest prefix wins). */
const CODES = {
    '1': 'USA/Canada', '7': 'Russia/Kazakhstan', '20': 'Egypt', '27': 'South Africa',
    '30': 'Greece', '31': 'Netherlands', '32': 'Belgium', '33': 'France', '34': 'Spain',
    '39': 'Italy', '41': 'Switzerland', '43': 'Austria', '44': 'United Kingdom',
    '45': 'Denmark', '46': 'Sweden', '47': 'Norway', '48': 'Poland', '49': 'Germany',
    '51': 'Peru', '52': 'Mexico', '53': 'Cuba', '54': 'Argentina', '55': 'Brazil',
    '56': 'Chile', '57': 'Colombia', '58': 'Venezuela', '60': 'Malaysia', '61': 'Australia',
    '62': 'Indonesia', '63': 'Philippines', '64': 'New Zealand', '65': 'Singapore',
    '66': 'Thailand', '81': 'Japan', '82': 'South Korea', '84': 'Vietnam', '86': 'China',
    '90': 'Turkey', '91': 'India', '92': 'Pakistan', '93': 'Afghanistan', '94': 'Sri Lanka',
    '98': 'Iran', '211': 'South Sudan', '212': 'Morocco', '213': 'Algeria', '216': 'Tunisia',
    '218': 'Libya', '220': 'Gambia', '221': 'Senegal', '223': 'Mali', '224': 'Guinea',
    '225': 'Ivory Coast', '226': 'Burkina Faso', '227': 'Niger', '228': 'Togo', '229': 'Benin',
    '230': 'Mauritius', '231': 'Liberia', '232': 'Sierra Leone', '233': 'Ghana',
    '234': 'Nigeria', '235': 'Chad', '236': 'Central African Rep.', '237': 'Cameroon',
    '241': 'Gabon', '242': 'Congo', '243': 'DR Congo', '244': 'Angola', '248': 'Seychelles',
    '249': 'Sudan', '250': 'Rwanda', '251': 'Ethiopia', '252': 'Somalia', '253': 'Djibouti',
    '254': 'Kenya', '255': 'Tanzania', '256': 'Uganda', '257': 'Burundi', '258': 'Mozambique',
    '260': 'Zambia', '261': 'Madagascar', '263': 'Zimbabwe', '264': 'Namibia', '265': 'Malawi',
    '266': 'Lesotho', '267': 'Botswana', '268': 'Eswatini', '351': 'Portugal', '353': 'Ireland',
    '358': 'Finland', '380': 'Ukraine', '593': 'Ecuador', '880': 'Bangladesh',
    '961': 'Lebanon', '962': 'Jordan', '964': 'Iraq', '965': 'Kuwait', '966': 'Saudi Arabia',
    '967': 'Yemen', '968': 'Oman', '971': 'UAE', '974': 'Qatar', '977': 'Nepal'
};

/** "255712345678" -> { code: '255', name: 'Tanzania' } */
function codeOf(number) {
    const n = String(number || '').replace(/\D/g, '');
    for (const len of [3, 2, 1]) {
        const c = n.slice(0, len);
        if (CODES[c]) return { code: c, name: CODES[c] };
    }
    return { code: n.slice(0, 3) || '?', name: 'Other' };
}

module.exports = { CODES, codeOf };
