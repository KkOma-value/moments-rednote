import { Platform } from '@/types';

export const STYLES = [
  { value: '', label: '请下拉选择' },
  { value: 'business', label: '商务' },
  { value: 'professional', label: '专业' },
  { value: 'friendly', label: '亲和' },
  { value: 'refined', label: '精致' },
] as const;

export const PRODUCTS = [
  { value: '', label: '请下拉选择' },
  { value: 'skincare', label: '护肤品' },
  { value: 'clothing', label: '服饰' },
  { value: 'digital', label: '数码产品' },
  { value: 'food', label: '美食' },
  { value: 'travel', label: '旅游' },
] as const;

// Style value → 中文 label 映射（传递给 AI system prompt）
export const STYLE_LABEL_MAP: Record<string, string> = {
  business: '商务',
  professional: '专业',
  friendly: '亲和',
  refined: '精致',
};

export const MOCK_HISTORY = [
  { id: '1', title: '夏季防晒霜推广', timestamp: '10:30 AM', platform: Platform.RedNote },
  { id: '2', title: '周末咖啡探店', timestamp: 'Yesterday', platform: Platform.WeChat },
  { id: '3', title: '新款机械键盘评测', timestamp: '2 days ago', platform: Platform.RedNote },
] as const;
