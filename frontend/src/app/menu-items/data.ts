export type MenuItem = {
  id: number;
  name: string;
  subtitle: string | null;
  description: string | null;
  price: number;
  categoryId: number;
};

export type Category = {
  id: number;
  name: string;
  subtitle: string | null;
};

export type MenuItemsResponse = {
  data: MenuItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type CategoriesResponse = {
  data: Category[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3001';

export async function getMenuItems(
  search: string,
  page: number,
): Promise<MenuItemsResponse> {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (page > 1) query.set('page', String(page));

  const response = await fetch(
    `${API_BASE_URL}/menu-items?${query.toString()}`,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch menu items');
  }

  return response.json();
}

export async function getMenuItem(id: string): Promise<MenuItem | null> {
  const response = await fetch(`${API_BASE_URL}/menu-items/${id}`, {
    cache: 'no-store',
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch menu item');
  }

  return response.json();
}

export async function getCategories(): Promise<Category[]> {
  const query = new URLSearchParams({
    limit: '100',
    sortBy: 'name',
    order: 'asc',
  });

  const response = await fetch(`${API_BASE_URL}/categories?${query.toString()}`,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  const data: CategoriesResponse = await response.json();
  return data.data;
}

export function getMenuItemsPageHref(search: string, page: number) {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (page > 1) query.set('page', String(page));
  const queryString = query.toString();
  return queryString ? `/menu-items?${queryString}` : '/menu-items';
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}