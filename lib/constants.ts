import { Platform } from '@/types';

export const STYLES = [
    { value: 'minimalist', label: '极简风 (Minimalist)' },
    { value: 'vintage', label: '复古风 (Vintage)' },
    { value: 'cinematic', label: '电影感 (Cinematic)' },
    { value: 'marketing', label: '营销风 (Marketing)' },
    { value: 'lifestyle', label: '生活方式 (Lifestyle)' },
];

export const PRODUCTS = [
    { value: 'skincare', label: '护肤品 (Skincare)' },
    { value: 'clothing', label: '服饰 (Clothing)' },
    { value: 'digital', label: '数码产品 (Digital)' },
    { value: 'food', label: '美食 (Food/Beverage)' },
    { value: 'travel', label: '旅游 (Travel)' },
];

export const MOCK_HISTORY = [
    { id: '1', title: '夏季防晒霜推广', timestamp: '10:30 AM', platform: Platform.RedNote },
    { id: '2', title: '周末咖啡探店', timestamp: 'Yesterday', platform: Platform.WeChat },
    { id: '3', title: '新款机械键盘评测', timestamp: '2 days ago', platform: Platform.RedNote },
];
