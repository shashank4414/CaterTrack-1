import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeleteMenuItemButton from './DeleteMenuItemButton';
import { formatCurrency, getCategories, getMenuItem } from '../data';

type MenuItemDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MenuItemDetailPage({
  params,
}: MenuItemDetailPageProps) {
  const { id } = await params;

  const [menuItem, categories] = await Promise.all([
    getMenuItem(id).catch(() => null),
    getCategories().catch(() => []),
  ]);

  if (!menuItem) notFound();

  const category = categories.find(
    (entry) => entry.id === menuItem.categoryId,
  );

  return (
    <main className="min-h-screen bg-amber-50 px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/menu-items"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition hover:text-orange-700"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
          Menu items
        </Link>

        <section className="rounded-3xl border border-stone-300 bg-white/88 p-6 shadow-[0_24px_60px_-36px_rgba(120,53,15,0.4)] backdrop-blur-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {menuItem.name}
                </h1>
                <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                  #{menuItem.id}
                </span>
                <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                  {category?.name ?? `Category #${menuItem.categoryId}`}
                </span>
              </div>
              {menuItem.subtitle?.trim() && (
                <p className="mt-1 text-sm text-stone-500">{menuItem.subtitle}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-800">
                {formatCurrency(menuItem.price)}
              </div>
              <Link
                href={`/menu-items/${menuItem.id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-800 transition hover:border-orange-300 hover:bg-orange-100 hover:text-orange-900"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                  />
                </svg>
                Edit
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 border-t border-stone-200 pt-5 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Category
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {category?.name ?? `Category #${menuItem.categoryId}`}
              </p>
              {category?.subtitle?.trim() && (
                <p className="mt-0.5 text-xs text-stone-500">
                  {category.subtitle}
                </p>
              )}
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Price
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatCurrency(menuItem.price)}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Description
              </p>
              {menuItem.description?.trim() ? (
                <p className="mt-1 text-sm text-slate-700">
                  {menuItem.description}
                </p>
              ) : (
                <p className="mt-1 text-sm text-stone-400">—</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-red-200 bg-white/88 p-6 shadow-[0_24px_60px_-36px_rgba(120,53,15,0.35)] backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-red-600">Danger zone</h2>
          <p className="mt-1 text-xs text-stone-500">
            Permanently delete this menu item. This action cannot be undone.
          </p>
          <div className="mt-4">
            <DeleteMenuItemButton
              menuItemId={menuItem.id}
              menuItemName={menuItem.name}
            />
          </div>
        </section>
      </div>
    </main>
  );
}