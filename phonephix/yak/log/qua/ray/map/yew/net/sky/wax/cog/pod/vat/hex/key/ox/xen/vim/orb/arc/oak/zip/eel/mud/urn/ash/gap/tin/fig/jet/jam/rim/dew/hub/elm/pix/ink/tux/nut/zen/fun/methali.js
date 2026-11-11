'use strict';

const defineCommand = require('../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../utils/cmdKit');

module.exports = defineCommand({
    name: 'methali',
    category: 'fun',
    aliases: [],
    description: 'Random Swahili proverb (methali) with its meaning',
    usage: 'methali',
    needsInput: false,
    lines: false,
    run: () => {
        const M = [
            ['Haraka haraka haina baraka.', 'Rushing brings poor results.'],
            ['Subira huvuta heri.', 'Patience brings good fortune.'],
            ['Mwenye kuvumilia hula mbivu.', 'Whoever endures gets the ripe fruit (patience pays).'],
            ['Chovya chovya humaliza buyu la asali.', 'Small takings again and again finish the whole pot.'],
            ['Asiyefunzwa na mamaye hufunzwa na ulimwengu.', 'Who is not taught by parents will be taught by life.'],
            ['Mtaka yote hukosa yote.', 'One who wants everything ends up with nothing.'],
            ['Kidole kimoja hakivunji chawa.', 'One finger cannot crush a louse (cooperation is needed).'],
            ['Umoja ni nguvu, utengano ni udhaifu.', 'Unity is strength, division is weakness.'],
            ['Kuuliza si ujinga.', 'Asking is not ignorance.'],
            ['Penye nia pana njia.', 'Where there is a will there is a way.'],
            ['Maji yakimwagika hayazoleki.', 'Spilled water cannot be gathered (what is done is done).'],
            ['Usipoziba ufa utajenga ukuta.', 'Fix the small crack now or rebuild the whole wall later.'],
            ['Akili ni mali.', 'Intelligence is wealth.'],
            ['Haba na haba hujaza kibaba.', 'Little by little fills the measure.'],
            ['Mkono mtupu haulambwi.', 'An empty hand is not licked (you get nothing for nothing).'],
            ['Mwacha mila ni mtumwa.', 'One who abandons their culture is a slave.']
        ];
        const [sw, en] = M[Math.floor(Math.random() * M.length)];
        return `📜 *METHALI*\n\n_${sw}_\n\n➡️ ${en}`;
    }
});
