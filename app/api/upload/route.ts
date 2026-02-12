import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) {
            return NextResponse.json(
                { error: 'Missing BLOB_READ_WRITE_TOKEN. Please set it in your environment variables.' },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        const uploadResults = await Promise.all(
            files.map(async (file, idx) => {
                if (!file || typeof file.size !== 'number' || file.size <= 0) {
                    throw new Error(`Invalid file at index ${idx}`);
                }

                const originalName = typeof file.name === 'string' && file.name.length > 0 ? file.name : `upload_${idx}`;
                const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
                const pathname = `uploads/${crypto.randomUUID()}_${safeName}`;

                const blob = await put(pathname, file, {
                    access: 'public',
                    token,
                    contentType: file.type || undefined,
                });

                return {
                    url: blob.url,
                    pathname: blob.pathname,
                };
            })
        );

        return NextResponse.json({ blobs: uploadResults });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed', details: message }, { status: 500 });
    }
}
