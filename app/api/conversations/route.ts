import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function getPrisma() {
    const { prisma } = await import('@/lib/prisma');
    return prisma;
}

// GET /api/conversations — list all conversations
export async function GET() {
    try {
        const prisma = await getPrisma();
        const conversations = await prisma.conversation.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });
        return NextResponse.json(conversations);
    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }
}

// POST /api/conversations — create a new conversation
export async function POST(request: Request) {
    try {
        const prisma = await getPrisma();
        const body = await request.json();
        const { title, platform, style, product } = body;

        if (typeof title !== 'string' || title.trim().length === 0) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        if (typeof platform !== 'string' || platform.trim().length === 0) {
            return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
        }

        const conversation = await prisma.conversation.create({
            data: {
                title: title.trim(),
                platform: platform.trim(),
                style: typeof style === 'string' && style.trim().length > 0 ? style.trim() : null,
                product: typeof product === 'string' && product.trim().length > 0 ? product.trim() : null,
            },
        });

        return NextResponse.json(conversation, { status: 201 });
    } catch (error) {
        console.error('Failed to create conversation:', error);
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }
}
