import * as moment from 'moment';

const timestamp = () => `${moment.utc(Date.now()).format('HH:mm')}Z`;

const getTimeAgo = (ts) => {
  const dt = new Date(Date.parse(ts));
  const diff = Date.now() - dt.getTime();

  if (diff < 1000 * 60) {
    return '< 1m';
  } else if (diff < 1000 * 60 * 60) {
    return `${Math.floor(diff / 1000 / 60)}m`;
  }

  return `${Math.floor(diff / 1000 / 60 / 60)}h`;
};

export default {
  timestamp,
  getTimeAgo,
}
