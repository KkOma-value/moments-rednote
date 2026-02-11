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

        const conversation = await prisma.conversation.create({
            data: {
                title,
                platform,
                style: style || null,
                product: product || null,
            },
        });

        return NextResponse.json(conversation, { status: 201 });
    } catch (error) {
        console.error('Failed to create conversation:', error);
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }
}
