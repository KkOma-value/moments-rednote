export enum Platform {
  WeChat = 'wechat',
  RedNote = 'rednote',
}

export enum DeviceMode {
  Web = 'web',
  Phone = 'phone',
}

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
