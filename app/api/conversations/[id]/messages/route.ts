import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function getPrisma() {
    const { prisma } = await import('@/lib/prisma');
    return prisma;
}

// GET /api/conversations/[id]/messages — list messages for a conversation
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const prisma = await getPrisma();
        const { id } = await params;
        const messages = await prisma.message.findMany({
            where: { conversationId: id },
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json(messages);
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

// POST /api/conversations/[id]/messages — add a message
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const prisma = await getPrisma();
        const { id } = await params;
        const body = await request.json();
        const { role, content, images } = body;

        const message = await prisma.message.create({
            data: {
                conversationId: id,
                role,
                content,
                images: images || [],
            },
        });

        // Update conversation's updatedAt
        await prisma.conversation.update({
            where: { id },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json(message, { status: 201 });
    } catch (error) {
        console.error('Failed to create message:', error);
        return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }
}
