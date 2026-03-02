import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { storeBrief, getBrief } from '@/lib/briefStore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const { brief, platform } = await req.json();
        if (!brief || typeof brief !== 'string') {
            return NextResponse.json({ error: 'brief is required' }, { status: 400 });
        }
        const id = crypto.randomUUID().slice(0, 8);
        storeBrief(id, brief, platform);
        const url = `${req.nextUrl.origin}/?id=${id}${platform ? `&platform=${platform}` : ''}`;
        return NextResponse.json({ id, url });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }
    const entry = getBrief(id);
    if (!entry) {
        return NextResponse.json({ error: 'Brief not found or expired' }, { status: 404 });
    }
    return NextResponse.json({ brief: entry.brief, platform: entry.platform });
}
