import fs from 'fs';
import path from 'path';
import { Platform } from '@/types';
import { STYLE_LABEL_MAP } from '@/lib/constants';

// 缓存读取的 prompt 文件内容
let momentsPromptCache: string | null = null;
let rednotePromptCache: string | null = null;

function loadPromptFile(filename: string): string {
  const filePath = path.join(process.cwd(), 'prompt', filename);
  return fs.readFileSync(filePath, 'utf-8');
}

function getMomentsPrompt(): string {
  if (!momentsPromptCache) {
    momentsPromptCache = loadPromptFile('moments.md');
  }
  return momentsPromptCache;
}

function getRednotePrompt(): string {
  if (!rednotePromptCache) {
    rednotePromptCache = loadPromptFile('rednote.md');
  }
  return rednotePromptCache;
}

/**
 * 根据平台类型获取完整的 system prompt
 * 将用户选择的 style 和 product 注入到 prompt 中
 */
export function getSystemPrompt(platform: Platform, style: string, product: string): string {
  const styleLabel = STYLE_LABEL_MAP[style] || style || '专业';
  const productLabel = product || '';

  const basePrompt = platform === Platform.WeChat
    ? getMomentsPrompt()
    : getRednotePrompt();

  // 注入用户选择的上下文
  const contextInjection = `
## 当前用户选择
- 写作的风格：${styleLabel}
- 产品的名称：${productLabel || '（用户未指定）'}

## 输出格式强制要求
你必须以纯 JSON 格式返回内容，不要包含任何 markdown 代码块标记或其他文本。
JSON 结构如下：
${platform === Platform.WeChat ? `{
  "title": "标题式前缀（如【RollingAI @ ××】）",
  "body": "正文内容（不超过100字）",
  "tags": ["标签1", "标签2", "标签3"]
}

其中：
- title: 标题前缀部分
- body: 正文部分，不超过100字
- tags: 3-6个标签，不要带#号` : `{
  "title": "小红书笔记标题（可含1个Emoji）",
  "body": "正文内容（300-500字，用\\n分段）",
  "tags": ["RollingAI", "标签2", "标签3"],
  "interaction": "末尾互动提问句"
}

其中：
- title: 1行标题
- body: 300-500字正文，使用\\n进行分段
- tags: 3-5个标签，不要带#号，必须包含RollingAI
- interaction: 一句互动提问（鼓励评论/收藏/转发）`}
`;

  return basePrompt + '\n\n' + contextInjection;
}
