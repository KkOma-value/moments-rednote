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
          'UserID': userId || '',
          '内容': content,
          'Purpose': purpose || '',
          'Style': style || '',
          'CreateTime': Date.now(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      recordId: res?.data?.record?.record_id,
    });
  } catch (error) {
    console.error('Feishu sync error:', error);
    const message = error instanceof Error ? error.message : '同步飞书失败';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
