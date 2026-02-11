import { Platform } from '@/types';

export const STYLES = [
  { value: '', label: '请下拉选择' },
  { value: 'minimalist', label: '极简风' },
  { value: 'vintage', label: '复古风' },
  { value: 'cinematic', label: '电影感' },
  { value: 'marketing', label: '营销风' },
  { value: 'lifestyle', label: '生活方式' },
] as const;

export const PRODUCTS = [
  { value: '', label: '请下拉选择' },
  { value: 'skincare', label: '护肤品' },
  { value: 'clothing', label: '服饰' },
  { value: 'digital', label: '数码产品' },
  { value: 'food', label: '美食' },
  { value: 'travel', label: '旅游' },
] as const;

export const MOCK_HISTORY = [
  { id: '1', title: '夏季防晒霜推广', timestamp: '10:30 AM', platform: Platform.RedNote },
  { id: '2', title: '周末咖啡探店', timestamp: 'Yesterday', platform: Platform.WeChat },
  { id: '3', title: '新款机械键盘评测', timestamp: '2 days ago', platform: Platform.RedNote },
] as const;
