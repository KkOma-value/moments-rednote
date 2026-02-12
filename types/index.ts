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

// AI 生成的结构化内容
export interface GeneratedContent {
  // 朋友圈: prefix 即标题前缀（如【RollingAI @ ××】）
  // 小红书: title 即笔记标题
  title: string;
  // 正文内容
  body: string;
  // 标签列表（不含 # 前缀）
  tags: string[];
  // 小红书专属：末尾互动提问
  interaction?: string;
  // 原始完整文本（用于复制）
  rawText: string;
}

export interface PreviewData {
  images: string[];
  style: string;
  product: string;
  prompt: string;
  generatedContent?: GeneratedContent;
}

export interface HistoryItem {
  id: string;
  title: string;
  timestamp: string;
  platform: Platform;
}
