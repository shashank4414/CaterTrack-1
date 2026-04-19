'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const API_BASE_URL = '/api';

type Fields = {
  name: string;
  subtitle: string;
  description: string;
  price: string;
  categoryId: string;
};

type CategoryOption = {
  id: number;
  name: string;
  subtitle: string | null;
};

type MenuItemFormProps = {
  mode: 'create' | 'edit';
  initial: Fields;
  categories: CategoryOption[];
  menuItemId?: number;
  cancelHref: string;
};

export default function MenuItemForm({
  mode,
  initial,
  categories,
  menuItemId,
  cancelHref,
}: MenuItemFormProps) {
  const router = useRouter();
  const [fields, setFields] = useState<Fields>(initial);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function set(key: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    const normalizedPrice = fields.price.trim();
    const normalizedCategoryId = fields.categoryId.trim();
    const parsedPrice = normalizedPrice ? Number(normalizedPrice) : undefined;
    const parsedCategoryId = normalizedCategoryId
      ? Number(normalizedCategoryId)
      : undefined;
    const nextErrors: string[] = [];

    if (normalizedPrice && Number.isNaN(parsedPrice)) {
      nextErrors.push('Price must be a valid number');
    }

    if (normalizedCategoryId && Number.isNaN(parsedCategoryId)) {
      nextErrors.push('Category is required');
    }

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      setLoading(false);
      return;
    }

    try {
      const isEditing = mode === 'edit' && typeof menuItemId === 'number';
      const endpoint = isEditing
        ? `${API_BASE_URL}/menu-items/${menuItemId}`
        : `${API_BASE_URL}/menu-items`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.name.trim(),
          subtitle: fields.subtitle.trim() || null,
          description: fields.description.trim() || null,
          price: parsedPrice,
          categoryId: parsedCategoryId,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors(body?.errors ?? [body?.error ?? 'Failed to save menu item']);
        return;
      }

      const nextMenuItemId = isEditing ? menuItemId : body?.id;
      router.push(
        nextMenuItemId ? `/menu-items/${nextMenuItemId}` : '/menu-items',
      );
      router.refresh();
    } catch {
      setErrors(['Something went wrong. Please try again.']);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3">
          <ul className="space-y-0.5">
            {errors.map((err) => (
              <li key={err} className="text-xs text-red-600">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={fields.name}
            onChange={(e) => set('name', e.target.value)}
            className="mt-1.5 w-full rounded-2xl border border-stone-300 bg-stone-50/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Category <span className="text-red-400">*</span>
          </label>
          <select
            required
            value={fields.categoryId}
            onChange={(e) => set('categoryId', e.target.value)}
            className="mt-1.5 w-full rounded-2xl border border-stone-300 bg-stone-50/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Subtitle
          </label>
          <input
            type="text"
            value={fields.subtitle}
            onChange={(e) => set('subtitle', e.target.value)}
            className="mt-1.5 w-full rounded-2xl border border-stone-300 bg-stone-50/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Price <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            inputMode="decimal"
            value={fields.price}
            onChange={(e) => set('price', e.target.value)}
            className="mt-1.5 w-full rounded-2xl border border-stone-300 bg-stone-50/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Description
          </label>
          <textarea
            rows={4}
            maxLength={1000}
            value={fields.description}
            onChange={(e) => set('description', e.target.value)}
            className="mt-1.5 w-full resize-none rounded-2xl border border-stone-300 bg-stone-50/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
          <p className="mt-1 text-right text-[10px] text-stone-500">
            {fields.description.length}/1000
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-stone-200 pt-5">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-800 disabled:opacity-60"
        >
          {loading
            ? 'Saving…'
            : mode === 'create'
              ? 'Create menu item'
              : 'Save changes'}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => router.push(cancelHref)}
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition hover:border-orange-200 hover:text-orange-800 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
