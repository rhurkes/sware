export interface WxEvent {
  source: string;
  time: number;
  timeAgo: string;
  timeLabel: string;
  tsUTC: string;
  coords?: any;
  seqnum: number;
  details: {
    code: string;
    metaCode?: string;
    important?: boolean;
    text: string;
    link: string;
    wfo: string;
  },
  message: string;
}
