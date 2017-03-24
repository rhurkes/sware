import cwas from '../mappings/cwas';

const eventsConfig = {
  fetching: {
    value: true,
    __order: 0,
  },
  severeMode: {
    value: false,
    __subtext: 'Only displays select products relevant to severe weather.',
    __order: 1,
  },
  age: {
    value: 0,
    __subtextfunc: x => x === 0 ? 'Do not filter by age' : `Showing events from last ${x} minutes`,
    __options: [0, 15, 30, 45, 60, 90, 120, 180],
    __order: 2,
  },
  /*issuedWarningsOnly: {
    value: false,
    __subtext: 'Hides continues/expires/extends/updates.',
    __order: 3,
  },*/
  alerts: {
    __order: 4,
    children: {
      outlooks: {
        value: true,
      },
      mesoscaleDiscussions: {
        value: true,
      },
      watches: {
        value: true,
      },
      tornadoWarning: {
        value: true,
      },
      tornadoReports: {
        value: true,
      },
      tornadoEmergencies: {
        value: true,
      },
      hailSize: {
        value: 2,
        __subtextfunc: x => x === 0 ? 'Do not alert by size' : `Alerts for hail reports of ${x}" and larger`,
        __options: [0, 1, 2, 3, 4],
      },
    }
  },
  cwas: {
    __text: 'CWA Filtering',
    __order: 3,
    children: {},
  },
};

// Dynamically generate CWA config
const sortedCWAs = Object.keys(cwas).sort((a, b) => cwas[a].st.localeCompare(cwas[b].st));
sortedCWAs.forEach((cwa) => {
  eventsConfig.cwas.children[cwa] = {
    value: false,
    __text: cwa.toUpperCase(),
    __subtext: `${cwas[cwa].name}, ${cwas[cwa].st}`,
  };
});

export default {
  events: eventsConfig,
};
