import mathHelper from '../utility/mathHelper';

export const rebuildNetworkStats = (newStat: INetworkStat, oldStats: INetworkStats) => {
  const newStats = Object.assign({}, oldStats);

  newStats.rawMsTimes.push(newStat.elapsedMs);
  newStats.count += 1;
  newStats.min = newStats.rawMsTimes.length === 1
    ? newStat.elapsedMs
    : Math.min(oldStats.min, newStat.elapsedMs);
  newStats.max = Math.max(oldStats.max, newStat.elapsedMs);
  newStats.avg = Math.round(mathHelper.average(newStats.rawMsTimes));

  if (newStat.isError) {
    newStats.errors += 1;
  }

  newStats.errorPercent = newStats.count
    ? ((newStats.errors / newStats.count) * 100)
    : 0;

  return newStats;
}

export interface INetworkStat {
  isError: boolean;
  elapsedMs: number;
}

export interface INetworkStats {
  min: number;
  avg: number;
  max: number;
  count: number;
  errors: number;
  errorPercent: number;
  rawMsTimes: number[];
}

export interface IFetchAPIAction {
  type: string,
  meta: {
    url: string,
    isJSONP?: boolean,
    analyze? : boolean
    moduleName: string,
    polling?: {
      timerActionType: string,
      delay: number,
      continueCheck?: Function,
      createNextAction?: Function,
    },
  },
};
