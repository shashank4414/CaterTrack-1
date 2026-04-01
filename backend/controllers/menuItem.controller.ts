import { MenuItem } from './../node_modules/.prisma/client/index.d';
import prisma from '../prisma';
import { Request, Response } from 'express';

// ---------------------------------------------
// GET /menuItems - Get all menu items
// ---------------------------------------------
export const getAllMenuItems = async (req: Request, res: Response) => {
  try {
    const menuItems = await prisma.menuItem.findMany();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

// ---------------------------------------------
// POST /menuItems - Create a new menu item
// ---------------------------------------------
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { name, description, price, categoryId } = req.body;

    // Validate
    const validation = await validateMenuItem({
      name,
      description,
      price,
      categoryId,
    });

    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // Create the menu item
    const newMenuItem = await prisma.menuItem.create({
      data: { name, description, price, categoryId },
    });
    res.status(201).json(newMenuItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create menu item' });
  }
};

// ---------------------------------------------
// GET /menuItems/:id - Get a menu item by ID
// ---------------------------------------------
export const getMenuItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: Number(id) },
    });
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
};

// ---------------------------------------------
// PUT /menuItems/:id - Update a menu item by ID
// ---------------------------------------------
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId } = req.body;

    // Validate
    const validation = await validateMenuItem({
      name,
      description,
      price,
      categoryId,
    });
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }
    const menuItem = await prisma.menuItem.update({
      where: { id: Number(id) },
      data: { name, description, price, categoryId },
    });
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

// ---------------------------------------------
// DELETE /menuItems/:id - Delete a menu item by ID
// ---------------------------------------------
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.menuItem.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    await prisma.menuItem.delete({
      where: { id: Number(id) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};

// ---------------------------------------------
// Filter menu items
// Get /menuItems/filter?name=...&categoryId=...&minPrice=...&maxPrice=...
// ---------------------------------------------
export const filterMenuItems = async (req: Request, res: Response) => {
  try {
    const { name, categoryId, minPrice, maxPrice } = req.query;
    const menuItems = await prisma.menuItem.findMany({
      where: {
        AND: [
          name ? { name: { contains: String(name), mode: 'insensitive' } } : {},
          categoryId ? { categoryId: Number(categoryId) } : {},
          minPrice ? { price: { gte: Number(minPrice) } } : {},
          maxPrice ? { price: { lte: Number(maxPrice) } } : {},
        ],
      },
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to filter menu items' });
  }
};

// ---------------------------------------------
// Sort
// GET /menuItems/sort?field=name&order=asc
// ---------------------------------------------
export const sortMenuItems = async (req: Request, res: Response) => {
  try {
    const { sortBy, order } = req.query;
    const sortFields = Array.isArray(sortBy) ? sortBy : [sortBy];
    const sortOrders = Array.isArray(order) ? order : [order];
    const orderBy = sortFields.map((field, index) => ({
      [field as string]: sortOrders[index] === 'desc' ? 'desc' : 'asc',
    }));
    const menuItems = await prisma.menuItem.findMany({
      orderBy,
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to sort menu items' });
  }
};

// ----------------------------- Helper Functions -----------------------------

// ---------------------------------------------
// Validate menu item data
// ---------------------------------------------

export interface MenuItemValidationResult {
  valid: boolean;
  errors: string[];
}
export const validateMenuItem = async (data: {
  name: string;
  description?: string;
  price: number;
  categoryId: number;
}): Promise<MenuItemValidationResult> => {
  const errors: string[] = [];

  //required fields
  if (!data.name) {
    errors.push('Name is required');
  }
  if (data.price === undefined) {
    errors.push('Price is required');
  }
  if (!data.categoryId) {
    errors.push('Category ID is required');
  }

  // Validate price
  if (
    data.price !== undefined &&
    (typeof data.price !== 'number' || data.price < 0)
  ) {
    errors.push('Price must be a non-negative number');
  }

  // Validate category existence
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      errors.push('Category not found');
    }
  }

  // validate length
  if (data.name && data.name.length > 255) {
    errors.push('Name must be less than 255 characters');
  }
  if (data.description && data.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
