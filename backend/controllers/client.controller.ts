import prisma from '../prisma';
import { Request, Response } from 'express';

// ---------------------------------------------
// GET /clients - Get all clients, filter, sort, pagination
// ---------------------------------------------
import { Request, Response } from 'express';
import prisma from '../prisma';

export const getClients = async (req: Request, res: Response) => {
  try {
    const {
      search,
      phone,
      email,
      sortBy = 'firstName',
      order = 'asc',
      page = '1',
      limit = '10',
    } = req.query;

    // Pagination numbers
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting (supports multiple fields)
    const sortFields = Array.isArray(sortBy) ? sortBy : [sortBy];
    const sortOrders = Array.isArray(order) ? order : [order];

    const orderBy = sortFields.map((field, index) => ({
      [field as string]: sortOrders[index] === 'desc' ? 'desc' : 'asc',
    }));

    // Build WHERE conditions
    const where: any = {
      AND: [
        search
          ? {
              OR: [
                {
                  firstName: {
                    contains: String(search),
                    mode: 'insensitive',
                  },
                },
                {
                  lastName: {
                    contains: String(search),
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {},

        phone
          ? { phone: { contains: String(phone), mode: 'insensitive' } }
          : {},

        email
          ? { email: { contains: String(email), mode: 'insensitive' } }
          : {},
      ],
    };

    // Query DB
    const clients = await prisma.client.findMany({
      where,
      orderBy,
      skip,
      take: limitNum,
    });

    // Total count for pagination
    const total = await prisma.client.count({ where });

    res.json({
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      data: clients,
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
};

// ---------------------------------------------
// POST /clients - Create a new client
// ---------------------------------------------
export const createClient = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, email } = req.body;

    // Validate required fields and formats
    const validation = await validateClient({
      firstName,
      lastName,
      phone,
      email,
    });
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // Create the client
    const client = await prisma.client.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email?.trim(),
      },
    });
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create client' });
  }
};

// ---------------------------------------------
// GET /clients/:id - Get a client by ID
// ---------------------------------------------
export const getClientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      where: { id: Number(id) },
    });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch client' });
  }
};

// ---------------------------------------------
// PUT /clients/:id - Update a client by ID
// ---------------------------------------------
export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, email } = req.body;

    const existing = await prisma.client.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Validate required fields and formats
    const validation = await validateClient(
      { firstName, lastName, phone, email },
      Number(id), // exclude current client ID for email uniqueness check
    );
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // Update the client
    const client = await prisma.client.update({
      where: { id: Number(id) },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email?.trim(),
      },
    });

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update client' });
  }
};

// ---------------------------------------------
// DELETE /clients/:id - Delete a client by ID
// ---------------------------------------------
export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.client.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await prisma.client.delete({
      where: { id: Number(id) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete client' });
  }
};

// ------------------- Helper Functions ------------------

// ---------------------------------------------
// Validation function for client data (used in create and update)
// ---------------------------------------------
export interface ClientValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateClient = async (
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string | null;
  },
  excludeId?: number, // used for update
): Promise<ClientValidationResult> => {
  const errors: string[] = [];

  const { firstName, lastName, phone, email } = data;

  // Required fields
  if (!firstName?.trim()) errors.push('First name is required');
  if (!lastName?.trim()) errors.push('Last name is required');
  if (!phone?.trim()) errors.push('Phone number is required');

  // Email format
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  // Phone format
  if (phone && !/^\+?[0-9\s\-()]+$/.test(phone)) {
    errors.push('Invalid phone number format');
  }

  // Duplicate email check
  if (email) {
    const existing = await prisma.client.findUnique({
      where: { email },
    });

    if (existing && existing.id !== excludeId) {
      errors.push('Email already exists');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
