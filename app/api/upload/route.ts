import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        const uploadResults = await Promise.all(
            files.map(async (file) => {
                const blob = await put(file.name, file, {
                    access: 'public',
                });
                return { url: blob.url, pathname: blob.pathname };
            })
        );

        return NextResponse.json({ blobs: uploadResults });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
