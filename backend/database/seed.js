import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';

const databaseUrl = 'file:./dev.db';
const adapter = new PrismaLibSql({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.category.deleteMany();
    await prisma.client.deleteMany();

    const appetizers = await prisma.category.create({
        data: { name: 'Appetizers' },
    });
    const mains = await prisma.category.create({
        data: { name: 'Main Courses' },
    });
    const desserts = await prisma.category.create({
        data: { name: 'Desserts' },
    });
    const beverages = await prisma.category.create({
        data: { name: 'Beverages' },
    });

    const bruschetta = await prisma.menuItem.create({
        data: {
            name: 'Bruschetta Platter',
            description: 'Toasted baguette with tomato, basil, and olive oil.',
            price: 24.99,
            categoryId: appetizers.id,
        },
    });
    const springRolls = await prisma.menuItem.create({
        data: {
            name: 'Vegetable Spring Rolls',
            description: 'Crispy spring rolls served with sweet chili sauce.',
            price: 19.5,
            categoryId: appetizers.id,
        },
    });
    const grilledSalmon = await prisma.menuItem.create({
        data: {
            name: 'Herb Grilled Salmon',
            description: 'Fresh salmon fillet with lemon herb butter.',
            price: 38.0,
            categoryId: mains.id,
        },
    });
    const pastaPrimavera = await prisma.menuItem.create({
        data: {
            name: 'Pasta Primavera',
            description: 'Seasonal vegetables tossed in a light cream sauce.',
            price: 27.5,
            categoryId: mains.id,
        },
    });
    const cheesecake = await prisma.menuItem.create({
        data: {
            name: 'New York Cheesecake',
            description: 'Classic cheesecake with berry compote.',
            price: 12.0,
            categoryId: desserts.id,
        },
    });
    const lemonade = await prisma.menuItem.create({
        data: {
            name: 'Fresh Lemonade',
            description: 'House-made lemonade with mint.',
            price: 6.5,
            categoryId: beverages.id,
        },
    });

    const clientA = await prisma.client.create({
        data: {
            firstName: 'Ava',
            lastName: 'Thompson',
            email: 'ava.thompson@example.com',
            phone: '555-1001',
        },
    });
    const clientB = await prisma.client.create({
        data: {
            firstName: 'Noah',
            lastName: 'Patel',
            email: 'noah.patel@example.com',
            phone: '555-1002',
        },
    });
    const clientC = await prisma.client.create({
        data: {
            firstName: 'Mia',
            lastName: 'Garcia',
            email: 'mia.garcia@example.com',
            phone: '555-1003',
        },
    });

    await prisma.order.create({
        data: {
            clientId: clientA.id,
            total: 75.98,
            discount: 5,
            status: 'confirmed',
            deliveryDate: new Date('2026-04-10T12:30:00Z'),
            items: {
                create: [
                    { menuItemId: bruschetta.id, quantity: 1 },
                    { menuItemId: grilledSalmon.id, quantity: 1 },
                    { menuItemId: lemonade.id, quantity: 2 },
                ],
            },
        },
    });

    await prisma.order.create({
        data: {
            clientId: clientB.id,
            total: 98.5,
            discount: 0,
            status: 'pending',
            deliveryDate: new Date('2026-04-12T18:00:00Z'),
            items: {
                create: [
                    { menuItemId: springRolls.id, quantity: 2 },
                    { menuItemId: pastaPrimavera.id, quantity: 2 },
                    { menuItemId: cheesecake.id, quantity: 1 },
                ],
            },
        },
    });

    await prisma.order.create({
        data: {
            clientId: clientC.id,
            total: 126.0,
            discount: 10,
            status: 'delivered',
            deliveryDate: new Date('2026-04-03T16:00:00Z'),
            items: {
                create: [
                    { menuItemId: grilledSalmon.id, quantity: 2 },
                    { menuItemId: cheesecake.id, quantity: 2 },
                    { menuItemId: lemonade.id, quantity: 4 },
                ],
            },
        },
    });

    console.log('Seed data inserted successfully.');
}

main()
    .catch((error) => {
        console.error('Seed failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
