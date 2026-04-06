import { Router } from 'express';
import {
  getOrderItems,
  createOrderItem,
  getOrderItemById,
  updateOrderItem,
  deleteOrderItem,
} from '../controllers/orderItem.controller';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         orderId:
 *           type: integer
 *         menuItemId:
 *           type: integer
 *         quantity:
 *           type: integer
 *     OrderItemInput:
 *       type: object
 *       required:
 *         - orderId
 *         - menuItemId
 *         - quantity
 *       properties:
 *         orderId:
 *           type: integer
 *         menuItemId:
 *           type: integer
 *         quantity:
 *           type: integer
 */

/**
 * @openapi
 * /order-items:
 *   get:
 *     tags:
 *       - Order Items
 *     summary: Get all order items
 *     responses:
 *       200:
 *         description: List of order items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderItem'
 */
router.get('/', getOrderItems);

/**
 * @openapi
 * /order-items:
 *   post:
 *     tags:
 *       - Order Items
 *     summary: Create a new order item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderItemInput'
 *     responses:
 *       201:
 *         description: Order item created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderItem'
 */
router.post('/', createOrderItem);

/**
 * @openapi
 * /order-items/{id}:
 *   get:
 *     tags:
 *       - Order Items
 *     summary: Get an order item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order item found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderItem'
 *       404:
 *         description: Order item not found
 */
router.get('/:id', getOrderItemById);

/**
 * @openapi
 * /order-items/{id}:
 *   put:
 *     tags:
 *       - Order Items
 *     summary: Update an order item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderItemInput'
 *     responses:
 *       200:
 *         description: Order item updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderItem'
 *       404:
 *         description: Order item not found
 */
router.put('/:id', updateOrderItem);

/**
 * @openapi
 * /order-items/{id}:
 *   delete:
 *     tags:
 *       - Order Items
 *     summary: Delete an order item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Order item deleted
 *       404:
 *         description: Order item not found
 */
router.delete('/:id', deleteOrderItem);

export default router;
