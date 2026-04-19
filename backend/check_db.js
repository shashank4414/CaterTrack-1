import { createClient } from '@libsql/client';
const client = createClient({ url: 'file:dev.db' });
try {
    const clients = await client.execute('SELECT * FROM Client LIMIT 5');
    const catCount = await client.execute('SELECT COUNT(*) as count FROM Category');
    const itemCount = await client.execute('SELECT COUNT(*) as count FROM MenuItem');
    const clientCount = await client.execute('SELECT COUNT(*) as count FROM Client');
    console.log(JSON.stringify({
        first5Clients: clients.rows,
        categoriesCount: catCount.rows[0].count,
        itemsCount: itemCount.rows[0].count,
        clientsCount: clientCount.rows[0].count
    }, null, 2));
} finally {
    client.close();
}
