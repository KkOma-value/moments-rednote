import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSystemPrompt } from '@/lib/prompts';
import { Platform, GeneratedContent } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 延迟初始化 OpenAI 客户端（兼容豆包 API）
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.ARK_API_KEY || '',
    baseURL: process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
    timeout: 60000, // 60 seconds timeout for slow AI responses
    maxRetries: 2,  // Retry up to 2 times on transient failures
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, style, purpose, prompt, images } = body;

    // 参数校验
    if (!platform || !['wechat', 'rednote'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 1. 构建 system prompt
    const systemPrompt = getSystemPrompt(platform as Platform, style || '', purpose || '');

    // 2. 构建用户消息
    let userMessage = prompt.trim();
    if (style) {
      userMessage += `\n风格偏好：${style}`;
    }
    if (purpose) {
      userMessage += `\n创作目的：${purpose}`;
    }

    // 3. 构建消息内容（支持多模态图片）
    const client = getOpenAIClient();
    const model = process.env.ARK_MODEL || 'doubao-1-5-pro-32k-250115';

    // 构建 user message content：如果有图片，使用多模态格式
    let userContent: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
    if (images && Array.isArray(images) && images.length > 0) {
      userContent = [
        { type: 'text', text: userMessage },
        ...images.map((url: string) => ({
          type: 'image_url' as const,
          image_url: { url },
        })),
      ];
    } else {
      userContent = userMessage;
    }

    // 调用豆包 API（OpenAI-compatible Chat Completions）
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent as string },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const aiResponseText = completion.choices?.[0]?.message?.content || '';

    // 4. 解析 AI 返回的 JSON
    let generatedContent: GeneratedContent;
    try {
      const parsed = JSON.parse(aiResponseText);
      generatedContent = {
        title: parsed.title || '',
        body: parsed.body || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        interaction: parsed.interaction || undefined,
        rawText: aiResponseText,
      };
    } catch {
      // 如果 JSON 解析失败，将整个响应作为 body
      generatedContent = {
        title: '',
        body: aiResponseText,
        tags: [],
        rawText: aiResponseText,
      };
    }

    return NextResponse.json({
      content: generatedContent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Generate API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate content',
        ...(process.env.NODE_ENV !== 'production' ? { details: message } : {}),
      },
      { status: 500 }
    );
  }
}
