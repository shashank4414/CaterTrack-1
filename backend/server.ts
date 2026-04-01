import express from 'express';
import clientRoutes from './routes/clients.routes';
import categoryRoutes from './routes/categories.routes';
import menuItemRoutes from './routes/menuItems.routes';
import orderRoutes from './routes/orders.routes';
import orderItemRoutes from './routes/orderItems.routes';

const app = express();
app.use(express.json());

// Register routes
app.use('/clients', clientRoutes);
app.use('/categories', categoryRoutes);
app.use('/menu-items', menuItemRoutes);
app.use('/orders', orderRoutes);
app.use('/order-items', orderItemRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
