import Link from 'next/link';
import SearchInput from './SearchInput';
import { getCategories, getCategoriesPageHref } from './data';

type CategoriesPageProps = {
  searchParams?: Promise<{
    search?: string | string[];
    page?: string | string[];
  }>;
};

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const resolvedSearchParams = await searchParams;

  const search = Array.isArray(resolvedSearchParams?.search)
    ? resolvedSearchParams.search[0]?.trim() || ''
    : resolvedSearchParams?.search?.trim() || '';
  const rawPage = Array.isArray(resolvedSearchParams?.page)
    ? resolvedSearchParams.page[0]?.trim() || '1'
    : resolvedSearchParams?.page?.trim() || '1';
  const page = Math.max(1, Number(rawPage) || 1);

  const result = await getCategories(search, page)
    .then((data) => ({ data, error: false }))
    .catch(() => ({ data: null, error: true }));

  if (result.error || !result.data) {
    return (
      <main className="px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-md rounded-3xl border border-red-200 bg-white/90 p-8 text-center shadow-[0_24px_60px_-36px_rgba(120,53,15,0.45)] backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-5 w-5 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h1 className="text-base font-semibold text-slate-900">
            Unable to load categories
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            The API request failed. Please try again.
          </p>
        </div>
      </main>
    );
  }

  const {
    data: categories,
    total,
    page: currentPage,
    totalPages,
    limit,
  } = result.data;
  const pageStart = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const pageEnd = total === 0 ? 0 : pageStart + categories.length - 1;
  const canGoToPreviousPage = currentPage > 1;
  const canGoToNextPage = currentPage < totalPages;
  const resultsLabel = search
    ? `${categories.length} result${categories.length !== 1 ? 's' : ''} for "${search}"`
    : `${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'} total`;
  const mobileSummaryLabel =
    categories.length > 0
      ? resultsLabel
      : search
        ? 'No matching categories'
        : 'No categories yet';

  return (
    <main className="px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-700">
              Category Catalog
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Categories
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Organize menu items into clear, reusable groups.
            </p>
          </div>
          <Link
            href="/categories/new"
            className="hidden items-center justify-center gap-1.5 rounded-full border border-orange-200 bg-white/90 px-4 py-2 text-sm font-semibold text-orange-800 shadow-[0_12px_28px_-24px_rgba(120,53,15,0.5)] transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-900 sm:inline-flex"
          >
            <svg
              className="h-4 w-4 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            New category
          </Link>
        </header>

        <SearchInput defaultValue={search} />

        <div className="flex items-start justify-between gap-2 sm:hidden">
          <p className="min-w-0 flex-1 text-xs font-medium leading-5 tracking-wide text-stone-600">
            {mobileSummaryLabel}
          </p>
          <Link
            href="/categories/new"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-orange-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-orange-800 shadow-[0_12px_28px_-24px_rgba(120,53,15,0.5)] transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-900"
          >
            <svg
              className="h-3.5 w-3.5 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            New category
          </Link>
        </div>

        {categories.length > 0 && (
          <p className="hidden text-xs font-medium tracking-wide text-stone-600 sm:block">
            {resultsLabel}
          </p>
        )}

        {categories.length === 0 ? (
          <div className="rounded-3xl border border-stone-300 bg-white/85 py-16 text-center shadow-[0_24px_60px_-36px_rgba(120,53,15,0.35)] backdrop-blur-sm">
            <p className="text-sm font-medium text-slate-800">
              {search ? 'No matching categories' : 'No categories yet'}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              {search
                ? 'Try adjusting your search term.'
                : 'Your category records will appear here once added.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2 md:hidden">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="block rounded-2xl border border-stone-300 bg-white/90 px-4 py-3 shadow-[0_16px_40px_-30px_rgba(120,53,15,0.35)] transition hover:border-orange-300 hover:bg-orange-50/70"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {category.name}
                      </p>
                      {category.subtitle?.trim() && (
                        <p className="mt-0.5 text-xs text-stone-500">
                          {category.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-stone-400">
                      #{category.id}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="hidden overflow-hidden rounded-3xl border border-stone-300 bg-white/90 shadow-[0_24px_60px_-36px_rgba(120,53,15,0.35)] backdrop-blur-sm md:block">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900">
                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/80">
                      ID
                    </th>
                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/80">
                      Name
                    </th>
                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/80">
                      Subtitle
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="relative transition hover:bg-orange-50/70"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs font-medium text-stone-400">
                        <Link
                          href={`/categories/${category.id}`}
                          className="absolute inset-0"
                          aria-label={`View ${category.name}`}
                        />
                        #{category.id}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {category.name}
                      </td>
                      <td className="px-5 py-3.5 text-stone-500">
                        {category.subtitle?.trim() ? (
                          category.subtitle
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col gap-3 px-1 py-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="mt-1 text-sm text-stone-600">
                    Showing{' '}
                    <span className="font-semibold text-slate-900">
                      {pageStart}
                    </span>{' '}
                    -{' '}
                    <span className="font-semibold text-slate-900">
                      {pageEnd}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-slate-900">
                      {total}
                    </span>{' '}
                    categories
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <Link
                    href={getCategoriesPageHref(search, currentPage - 1)}
                    aria-disabled={!canGoToPreviousPage}
                    className={`inline-flex w-28 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                      canGoToPreviousPage
                        ? 'border border-stone-300 bg-white text-stone-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800'
                        : 'pointer-events-none border border-stone-200 bg-stone-50 text-stone-300'
                    }`}
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
                    Previous
                  </Link>

                  <div className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-800">
                    Page {currentPage}
                    <span className="ml-1 font-normal text-orange-600">
                      of {totalPages}
                    </span>
                  </div>

                  <Link
                    href={getCategoriesPageHref(search, currentPage + 1)}
                    aria-disabled={!canGoToNextPage}
                    className={`inline-flex w-28 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                      canGoToNextPage
                        ? 'border border-stone-300 bg-white text-stone-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800'
                        : 'pointer-events-none border border-stone-200 bg-stone-50 text-stone-300'
                    }`}
                  >
                    Next
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
                        d="M8.25 4.5 15.75 12l-7.5 7.5"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
