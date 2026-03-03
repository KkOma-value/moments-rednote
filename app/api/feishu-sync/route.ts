import { NextRequest, NextResponse } from 'next/server';
import * as lark from '@larksuiteoapi/node-sdk';

export const dynamic = 'force-dynamic';

// 初始化飞书 Client（自动管理 tenant token）
function getFeishuClient() {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('Missing FEISHU_APP_ID or FEISHU_APP_SECRET environment variables');
  }

  return new lark.Client({
    appId,
    appSecret,
    disableTokenCache: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { content, purpose, style, userId, platform } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '内容不能为空' },
        { status: 400 }
      );
    }

    const appToken = process.env.FEISHU_BITABLE_APP_TOKEN;
    const tableId = platform === 'rednote'
      ? process.env.FEISHU_TABLE_ID_REDNOTE
      : process.env.FEISHU_TABLE_ID_WECHAT;

    if (!appToken || !tableId) {
      return NextResponse.json(
        { error: `Missing FEISHU config for platform: ${platform}` },
        { status: 500 }
      );
    }

    const client = getFeishuClient();

    const res = await client.bitable.v1.appTableRecord.create({
      path: {
        app_token: appToken,
        table_id: tableId,
      },
      data: {
        fields: {
          'UserId': userId || '',
          '内容': content,
          'Purpose': purpose || '',
          'Style': style || '',
          'CreateTime': Date.now(),
        },
      },
    });

    // Check for Lark SDK-level errors
    if (res?.code !== 0) {
      console.error('Feishu API returned error:', JSON.stringify(res, null, 2));
      return NextResponse.json(
        { error: `Feishu API error: ${res?.msg || 'Unknown'}`, code: res?.code },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recordId: res?.data?.record?.record_id,
    });
  } catch (error: unknown) {
    // Log full error details for debugging
    console.error('Feishu sync error:', error);
    try {
      console.error('Feishu sync error (stringified):', JSON.stringify(error, Object.getOwnPropertyNames(error as object), 2));
    } catch { /* ignore serialization errors */ }
    if (error && typeof error === 'object' && 'response' in error) {
      console.error('Feishu SDK response:', JSON.stringify((error as Record<string, unknown>).response, null, 2));
    }
    const message = error instanceof Error ? error.message : '同步飞书失败';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
