export type Category = {
  id: number;
  name: string;
  subtitle: string | null;
};

export type MenuItemSummary = {
  id: number;
  name: string;
  subtitle: string | null;
  description: string | null;
  price: number;
  categoryId: number;
};

export type CategoriesResponse = {
  data: Category[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type MenuItemsResponse = {
  data: MenuItemSummary[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3001';

export async function getCategories(
  search: string,
  page: number,
): Promise<CategoriesResponse> {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (page > 1) query.set('page', String(page));

  const response = await fetch(
    `${API_BASE_URL}/categories?${query.toString()}`,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
}

export async function getCategory(id: string): Promise<Category | null> {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    cache: 'no-store',
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch category');
  }

  return response.json();
}

export async function getCategoryMenuItems(
  categoryId: string,
): Promise<MenuItemsResponse> {
  const query = new URLSearchParams({
    categoryId,
    limit: '50',
    sortBy: 'name',
    order: 'asc',
  });

  const response = await fetch(
    `${API_BASE_URL}/menu-items?${query.toString()}`,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    return { data: [], page: 1, limit: 50, total: 0, totalPages: 0 };
  }

  return response.json();
}

export function getCategoriesPageHref(search: string, page: number) {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (page > 1) query.set('page', String(page));
  const queryString = query.toString();
  return queryString ? `/categories?${queryString}` : '/categories';
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
