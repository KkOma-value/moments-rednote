require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function main() {
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

    try {
        const prisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
        });
        const result = await prisma.conversation.findMany();
        console.log('SUCCESS: Found', result.length, 'conversations');
        await prisma.$disconnect();
    } catch (error) {
        console.error('FULL ERROR:');
        console.error(error.toString());
        console.error('---');
        console.error('Message:', error.message);
    }
}

main();
