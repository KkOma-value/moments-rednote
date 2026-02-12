import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSystemPrompt } from '@/lib/prompts';
import { Platform, GeneratedContent } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 延迟初始化 Prisma
async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

// 延迟初始化 OpenAI 客户端（兼容豆包 API）
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.ARK_API_KEY || '',
    baseURL: process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, style, product, prompt, images, conversationId } = body;

    // 参数校验
    if (!platform || !['wechat', 'rednote'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 1. 构建 system prompt
    const systemPrompt = getSystemPrompt(platform as Platform, style || '', product || '');

    // 2. 构建用户消息
    let userMessage = prompt.trim();
    if (images && Array.isArray(images) && images.length > 0) {
      userMessage += `\n\n[用户上传了 ${images.length} 张图片]`;
    }
    if (style) {
      userMessage += `\n风格偏好：${style}`;
    }
    if (product) {
      userMessage += `\n产品类型：${product}`;
    }

    // 3. 调用豆包 API（OpenAI-compatible Chat Completions）
    const client = getOpenAIClient();
    const model = process.env.ARK_MODEL || 'doubao-1-5-pro-32k-250115';

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
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

    // 5. 保存到数据库
    const prisma = await getPrisma();
    let actualConversationId = conversationId;

    // 如果没有 conversationId，创建新对话
    if (!actualConversationId) {
      const title = generatedContent.title
        || prompt.slice(0, 20) + (prompt.length > 20 ? '...' : '');
      const conversation = await prisma.conversation.create({
        data: {
          title,
          platform,
          style: style || null,
          product: product || null,
        },
      });
      actualConversationId = conversation.id;
    }

    // 保存用户消息
    await prisma.message.create({
      data: {
        conversationId: actualConversationId,
        role: 'user',
        content: prompt.trim(),
        images: Array.isArray(images) ? images : [],
      },
    });

    // 保存 AI 回复
    await prisma.message.create({
      data: {
        conversationId: actualConversationId,
        role: 'assistant',
        content: JSON.stringify(generatedContent),
        images: [],
      },
    });

    // 更新对话的 updatedAt
    await prisma.conversation.update({
      where: { id: actualConversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      conversationId: actualConversationId,
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
