import prisma from '../prisma';
import { Request, Response } from 'express';

// ---------------------------------------------
// GET /categories - Get all categories
// ---------------------------------------------
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// ---------------------------------------------
// POST /categories - Create a new category
// ---------------------------------------------
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const category = await prisma.category.create({
      data: { name: name.trim() },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// ---------------------------------------------
// GET /categories/:id - Get a category by ID
// ---------------------------------------------
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

// ---------------------------------------------
// PUT /categories/:id - Update a category by ID
// ---------------------------------------------
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    // Validation
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: { name: name.trim() },
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// ---------------------------------------------
// DELETE /categories/:id - Delete a category by ID
// ---------------------------------------------
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({
      where: { id: Number(id) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

// ---------------------------------------------
// Sorting categories by name
// ---------------------------------------------
export const getCategoriesSortedByName = async (
  req: Request,
  res: Response,
) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};
