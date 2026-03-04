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

/** 获取飞书 tenant_access_token */
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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const recordId = searchParams.get('recordId');
        const platform = searchParams.get('platform') || 'rednote';

        if (!recordId) {
            return NextResponse.json({ error: 'recordId is required' }, { status: 400 });
        }

        const appToken = process.env.FEISHU_BITABLE_APP_TOKEN;
        const tableId = platform === 'rednote'
            ? process.env.FEISHU_TABLE_ID_REDNOTE
            : process.env.FEISHU_TABLE_ID_WECHAT;

        if (!appToken || !tableId) {
            return NextResponse.json({ error: 'Missing FEISHU config' }, { status: 500 });
        }

        const client = getFeishuClient();

        // 读取记录
        const res = await client.bitable.v1.appTableRecord.get({
            path: { app_token: appToken, table_id: tableId, record_id: recordId },
        });

        if (res?.code !== 0) {
            return NextResponse.json(
                { error: `Feishu API error: ${res?.msg || 'Unknown'}` },
                { status: 500 },
            );
        }

        const fields = res.data?.record?.fields || {};
        const photoField = fields['photo'];

        // photo 字段是附件数组，格式: [{ file_token, name, type, ... }]
        if (!photoField || !Array.isArray(photoField) || photoField.length === 0) {
            return NextResponse.json({ photos: [] });
        }

        // 获取 token 用于下载
        const token = await getTenantToken();

        // 下载每张图片并转为 base64 data URL
        const photos: string[] = [];
        for (const attachment of photoField as Array<{ file_token?: string }>) {
            const fileToken = attachment.file_token;
            if (!fileToken) continue;

            try {
                const downloadRes = await fetch(
                    `https://open.feishu.cn/open-apis/drive/v1/medias/${fileToken}/download`,
                    { headers: { 'Authorization': `Bearer ${token}` } },
                );

                if (!downloadRes.ok) {
                    console.error(`Failed to download photo ${fileToken}:`, downloadRes.status);
                    continue;
                }

                const buffer = await downloadRes.arrayBuffer();
                const contentType = downloadRes.headers.get('content-type') || 'image/png';
                const base64 = Buffer.from(buffer).toString('base64');
                photos.push(`data:${contentType};base64,${base64}`);
            } catch (e) {
                console.error(`Error downloading photo ${fileToken}:`, e);
            }
        }

        return NextResponse.json({ photos });
    } catch (error: unknown) {
        console.error('fetch-record-photo error:', error);
        const message = error instanceof Error ? error.message : '获取记录图片失败';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
