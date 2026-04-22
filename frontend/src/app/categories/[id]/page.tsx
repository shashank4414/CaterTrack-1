import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeleteCategoryButton from './DeleteCategoryButton';
import { formatCurrency, getCategory, getCategoryMenuItems } from '../data';

type CategoryDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { id } = await params;

  const [category, relatedMenuItems] = await Promise.all([
    getCategory(id).catch(() => null),
    getCategoryMenuItems(id).catch(() => ({ data: [], total: 0 })),
  ]);

  if (!category) notFound();

  const menuItems = relatedMenuItems.data;

  return (
    <main className="px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/categories"
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
          Categories
        </Link>

        <section className="rounded-3xl border border-stone-300 bg-white/88 p-6 shadow-[0_24px_60px_-36px_rgba(120,53,15,0.4)] backdrop-blur-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {category.name}
                </h1>
                <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                  #{category.id}
                </span>
              </div>
              {category.subtitle?.trim() && (
                <p className="mt-1 text-sm text-stone-500">
                  {category.subtitle}
                </p>
              )}
            </div>

            <Link
              href={`/categories/${category.id}/edit`}
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

          <div className="mt-5 grid gap-3 border-t border-stone-200 pt-5 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Name
              </p>
              <p className="mt-1 text-sm text-slate-900">{category.name}</p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Subtitle
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {category.subtitle?.trim() ? category.subtitle : '—'}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Menu items
              {menuItems.length > 0 && (
                <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                  {menuItems.length}
                </span>
              )}
            </h2>
          </div>

          {menuItems.length === 0 ? (
            <div className="rounded-3xl border border-stone-300 bg-white/88 py-12 text-center shadow-[0_24px_60px_-36px_rgba(120,53,15,0.35)] backdrop-blur-sm">
              <p className="text-sm font-medium text-slate-800">
                No menu items yet
              </p>
              <p className="mt-1 text-xs text-stone-500">
                Menu items assigned to this category will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-stone-300 bg-white/88 shadow-[0_24px_60px_-36px_rgba(120,53,15,0.35)] backdrop-blur-sm">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900">
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/80">
                      ID
                    </th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/80">
                      Name
                    </th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/80">
                      Price
                    </th>
                    <th className="hidden px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/80 sm:table-cell">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {menuItems.map((menuItem) => (
                    <tr
                      key={menuItem.id}
                      className="relative transition hover:bg-orange-50/70"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-stone-500">
                        <Link
                          href={`/menu-items/${menuItem.id}`}
                          className="absolute inset-0"
                          aria-label={`View ${menuItem.name}`}
                        />
                        #{menuItem.id}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-slate-900">
                            {menuItem.name}
                          </span>
                          {menuItem.subtitle?.trim() && (
                            <p className="mt-0.5 text-xs text-stone-500">
                              {menuItem.subtitle}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                        {formatCurrency(menuItem.price)}
                      </td>
                      <td className="hidden max-w-lg px-4 py-3 text-stone-500 sm:table-cell">
                        {menuItem.description?.trim() ? (
                          menuItem.description
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-red-200 bg-white/88 p-6 shadow-[0_24px_60px_-36px_rgba(120,53,15,0.35)] backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-red-600">Danger zone</h2>
          <p className="mt-1 text-xs text-stone-500">
            Permanently delete this category. This action cannot be undone.
          </p>
          <div className="mt-4">
            <DeleteCategoryButton
              categoryId={category.id}
              categoryName={category.name}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
