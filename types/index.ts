export const Platform = {
  WeChat: 'wechat',
  RedNote: 'rednote',
} as const;

export type Platform = (typeof Platform)[keyof typeof Platform];

export const DeviceMode = {
  Web: 'web',
  Phone: 'phone',
} as const;

export type DeviceMode = (typeof DeviceMode)[keyof typeof DeviceMode];

export interface PreviewData {
  image: string | null;
  style: string;
  product: string;
  prompt: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  timestamp: string;
  platform: Platform;
}
