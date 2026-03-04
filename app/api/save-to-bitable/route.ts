import { NextRequest, NextResponse } from 'next/server';
import * as lark from '@larksuiteoapi/node-sdk';

export const dynamic = 'force-dynamic';

function getFeishuClient() {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error('Missing FEISHU_APP_ID or FEISHU_APP_SECRET');
  }
  return new lark.Client({ appId, appSecret, disableTokenCache: false });
}

/** 获取飞书 tenant_access_token（上传文件需要手动传 token） */
async function getTenantToken(): Promise<string> {
  const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: process.env.FEISHU_APP_ID,
      app_secret: process.env.FEISHU_APP_SECRET,
    }),
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`Failed to get tenant token: ${data.msg}`);
  return data.tenant_access_token;
}

/**
 * 把 base64 图片上传到飞书多维表格附件，返回 file_token
 * 使用 drive v1 media upload API（适配多维表格附件字段）
 */
async function uploadBase64ToFeishu(
  base64Data: string,
  appToken: string,
): Promise<string> {
  // 解析 base64，支持 data:image/xxx;base64,... 格式
  let mimeType = 'image/png';
  let pure = base64Data;
  if (base64Data.startsWith('data:')) {
    const match = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      pure = match[2];
    }
  }
  const ext = mimeType.split('/')[1] || 'png';
  const fileName = `photo_${Date.now()}.${ext}`;
  const buffer = Buffer.from(pure, 'base64');

  const token = await getTenantToken();

  // 使用 multipart/form-data 上传
  const boundary = `----FormBoundary${Date.now()}`;
  const parts: Buffer[] = [];

  // file_name
  parts.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file_name"\r\n\r\n${fileName}\r\n`
  ));
  // parent_type
  parts.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="parent_type"\r\n\r\nbitable_image\r\n`
  ));
  // parent_node
  parts.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="parent_node"\r\n\r\n${appToken}\r\n`
  ));
  // size
  parts.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="size"\r\n\r\n${buffer.length}\r\n`
  ));
  // file binary
  parts.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`
  ));
  parts.push(buffer);
  parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

  const body = Buffer.concat(parts);

  const uploadRes = await fetch('https://open.feishu.cn/open-apis/drive/v1/medias/upload_all', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  const uploadData = await uploadRes.json();
  if (uploadData.code !== 0) {
    console.error('Feishu upload error:', JSON.stringify(uploadData, null, 2));
    throw new Error(`Upload failed: ${uploadData.msg}`);
  }

  return uploadData.data.file_token;
}

export async function POST(request: NextRequest) {
  try {
    const { content, platform, purpose, style, recordId, photo, userId } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }
    if (!platform || !['rednote', 'wechat'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    const appToken = process.env.FEISHU_BITABLE_APP_TOKEN;
    const tableId = platform === 'rednote'
      ? process.env.FEISHU_TABLE_ID_REDNOTE
      : process.env.FEISHU_TABLE_ID_WECHAT;

    if (!appToken || !tableId) {
      return NextResponse.json({ error: `Missing FEISHU config for platform: ${platform}` }, { status: 500 });
    }

    // 构建 fields
    type FieldValue = string | number | boolean | { file_token: string }[];
    const fields: Record<string, FieldValue> = {
      '内容': content,
      'Purpose': Array.isArray(purpose) ? purpose.join(', ') : (purpose || ''),
      'Style': Array.isArray(style) ? style.join(', ') : (style || ''),
      'CreateTime': new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      'UserId': userId || '',
    };

    // 如果有 photo（base64），上传到飞书并写入附件字段
    if (photo && typeof photo === 'string') {
      try {
        const fileToken = await uploadBase64ToFeishu(photo, appToken);
        fields['photo'] = [{ file_token: fileToken }];
      } catch (e) {
        console.error('Photo upload failed, continuing without photo:', e);
      }
    }

    const client = getFeishuClient();

    console.log('[save-to-bitable] fields:', JSON.stringify(Object.keys(fields)));
    console.log('[save-to-bitable] recordId:', recordId || '(none, will create)');
    console.log('[save-to-bitable] appToken:', appToken, 'tableId:', tableId);

    if (recordId) {
      // Aily 工作流已创建记录，用 PUT 更新
      const res = await client.bitable.v1.appTableRecord.update({
        path: {
          app_token: appToken,
          table_id: tableId,
          record_id: recordId,
        },
        data: { fields },
      });

      if (res?.code !== 0) {
        console.error('Feishu update error:', JSON.stringify(res, null, 2));
        return NextResponse.json(
          { error: `Feishu API error: ${res?.msg || 'Unknown'}`, code: res?.code },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true, recordId, action: 'updated' });
    } else {
      // H5 独立使用，创建新记录
      const res = await client.bitable.v1.appTableRecord.create({
        path: {
          app_token: appToken,
          table_id: tableId,
        },
        data: { fields },
      });

      if (res?.code !== 0) {
        console.error('Feishu create error:', JSON.stringify(res, null, 2));
        return NextResponse.json(
          { error: `Feishu API error: ${res?.msg || 'Unknown'}`, code: res?.code },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        recordId: res?.data?.record?.record_id,
        action: 'created',
      });
    }
  } catch (error: unknown) {
    console.error('save-to-bitable error:', error);
    const message = error instanceof Error ? error.message : '保存到飞书失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
