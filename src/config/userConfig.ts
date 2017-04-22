import cwas from '../mappings/cwas';
import codModels from '../models/codModels';
import Modules from '../pages/modules';

// TODO might need to break this up into separate files once we get more modules in play

const appConfig = {};

const goes16Config = {
  fetching: {
    __value: true,
  },
  region: {
    __value: 'cenplains',
    __options: [ 'cenplains', 'meso' ],
    __subtextfunc: x => codModels.goes16Regions[x],
  },
  band: {
    __value: '02',
    __options: [ '02', '04', '05', '09', '13' ],
    __subtextfunc: x => codModels.goes16Bands[x],
  },
  frames: {
    __value: 12,
    __options: [ 6, 12, 24, 36 ],
    __subtext: 'Number of images to backfill for animation',
  },
};

const eventsConfig = {
  fetching: {
    __value: false,
    __order: 0,
  },
  severeMode: {
    __value: false,
    __subtext: 'Only displays select products relevant to severe weather.',
    __order: 1,
  },
  hideNonIssued: {
    __value: true,
    __text: 'Hide Non-issued',
    __subtext: 'Hides continues/expires/cancels events',
    __order: 2,
  },
  age: {
    __value: 0,
    __subtextfunc: x => x === 0 ? 'Do not filter by age' : `Showing events from last ${x} minutes`,
    __options: [ 0, 15, 30, 45, 60, 90, 120, 180 ],
    __order: 3,
  },
  alerts: {
    __order: 4,
    children: {
      outlooks: {
        __value: true,
      },
      mesoscaleDiscussions: {
        __value: true,
      },
      watches: {
        __value: true,
      },
      tornadoWarning: {
        __value: true,
      },
      tornadoReports: {
        __value: true,
      },
      tornadoEmergencies: {
        __value: true,
      },
      hailSize: {
        __value: 2,
        __subtextfunc: x => x === 0 ? 'Do not alert by size' : `Alerts for hail reports of ${x}" and larger`,
        __options: [ 0, 1, 2, 3, 4 ],
      },
    },
  },
  showAllCWAs: {
    __value: true,
    __text: 'Show all CWAs',
    __subtextfunc: (x, y) => {
      return x
        ? ''
        : `Showing: ${Object.keys(y.cwas.children)
            .filter(z => y.cwas.children[z].__value)
            .map(z => z.toUpperCase())
            .join(', ')}`;
    },
    __order: 5,
  },
  cwas: {
    __text: 'Filter by CWA',
    __order: 6,
    children: {},
  },
};

// Dynamically generate CWA config
const sortedCWAs = Object.keys(cwas).sort((a, b) => cwas[a].st.localeCompare(cwas[b].st));
sortedCWAs.forEach(cwa => {
  eventsConfig.cwas.children[cwa] = {
    __value: false,
    __text: cwa.toUpperCase(),
    __subtext: `${cwas[cwa].name}, ${cwas[cwa].st}`,
  };
});

export default {
  [Modules.App]: appConfig,
  [Modules.Events]: eventsConfig,
  [Modules.GOES16]: goes16Config,
  version: 2,
};
