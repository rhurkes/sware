export interface IWxEvent {
  source: string;
  time: number;
  timeAgo: string;
  timeLabel: string;
  tsUTC: string;
  coords?: any;
  details: {
    code: string;
    metaCode?: string;
    important?: boolean;
    text: string;
    link: string;
    wfo: string;
  };
  message: string;
}

export const EventSource = {
  IEM: 'iem' as 'iem',
  SpotterNetwork: 'spotter_network' as 'spotter_network',
};
