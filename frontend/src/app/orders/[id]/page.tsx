import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeleteOrderButton from './DeleteOrderButton';
import {
  formatCurrency,
  formatDate,
  getClientDisplayName,
  getOrder,
  getOrderItemCount,
  ORDER_STATUS_STYLES,
} from '../data';

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrder(id).catch(() => null);

  if (!order) notFound();

  const statusStyle =
    ORDER_STATUS_STYLES[order.status.toLowerCase()] ??
    'bg-stone-50 text-stone-600 border-stone-200';
  const itemCount = getOrderItemCount(order);

  return (
    <main className="px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/orders"
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
          Orders
        </Link>

        <section className="rounded-3xl border border-stone-300 bg-white/88 p-6 shadow-[0_24px_60px_-36px_rgba(120,53,15,0.4)] backdrop-blur-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  Order #{order.id}
                </h1>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyle}`}
                >
                  {order.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-500">
                {getClientDisplayName(order.client)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-800">
                {formatCurrency(order.total)}
              </div>
              <Link
                href={`/orders/${order.id}/edit`}
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

          <div className="mt-5 grid gap-3 border-t border-stone-200 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Client
              </p>
              {order.client ? (
                <Link
                  href={`/clients/${order.client.id}`}
                  className="mt-1 inline-flex text-sm text-slate-700 transition hover:text-orange-700"
                >
                  {getClientDisplayName(order.client)}
                </Link>
              ) : (
                <p className="mt-1 text-sm text-stone-400">Unknown client</p>
              )}
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Delivery
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {order.deliveryDate ? formatDate(order.deliveryDate) : '—'}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Discount
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {formatCurrency(order.discount ?? 0)}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Items
              </p>
              <p className="mt-1 text-sm text-slate-700">{itemCount}</p>
            </div>

            {order.note?.trim() && (
              <div className="sm:col-span-2 lg:col-span-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Note
                </p>
                <p className="mt-1 text-sm text-slate-700">{order.note}</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-stone-200 pt-4 text-xs text-stone-500">
            <span>Created {formatDate(order.createdAt)}</span>
            <span>Updated {formatDate(order.updatedAt)}</span>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Line items
              {itemCount > 0 && (
                <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                  {itemCount}
                </span>
              )}
            </h2>
          </div>

          {!order.items || order.items.length === 0 ? (
            <div className="rounded-3xl border border-stone-300 bg-white/88 py-12 text-center shadow-[0_24px_60px_-36px_rgba(120,53,15,0.35)] backdrop-blur-sm">
              <p className="text-sm font-medium text-slate-800">
                No line items yet
              </p>
              <p className="mt-1 text-xs text-stone-500">
                Add line items to define the order contents.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 sm:hidden">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-stone-300 bg-white/88 p-4 shadow-[0_16px_40px_-30px_rgba(120,53,15,0.35)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {item.menuItem?.name ??
                            `Menu item #${item.menuItemId}`}
                        </p>
                        {item.menuItem?.subtitle?.trim() && (
                          <p className="mt-0.5 text-xs text-stone-500">
                            {item.menuItem.subtitle}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-stone-600">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                          Quantity
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          {item.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                          Unit price
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    {item.note?.trim() && (
                      <p className="mt-3 text-xs text-stone-600">{item.note}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="hidden overflow-hidden rounded-3xl border border-stone-300 bg-white/88 shadow-[0_24px_60px_-36px_rgba(120,53,15,0.35)] backdrop-blur-sm sm:block">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900">
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/80">
                        Item
                      </th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/80">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/80">
                        Unit price
                      </th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/80">
                        Line total
                      </th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/80">
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {order.items.map((item) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-orange-50/70"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-medium text-slate-900">
                              {item.menuItem?.name ??
                                `Menu item #${item.menuItemId}`}
                            </span>
                            {item.menuItem?.subtitle?.trim() && (
                              <p className="mt-0.5 text-xs text-stone-500">
                                {item.menuItem.subtitle}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {item.quantity}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                        <td className="max-w-xs px-4 py-3 text-stone-500">
                          {item.note?.trim() ? (
                            item.note
                          ) : (
                            <span className="text-stone-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <section className="rounded-3xl border border-red-200 bg-white/88 p-6 shadow-[0_24px_60px_-36px_rgba(120,53,15,0.35)] backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-red-600">Danger zone</h2>
          <p className="mt-1 text-xs text-stone-500">
            Permanently delete this order and all of its line items. This action
            cannot be undone.
          </p>
          <div className="mt-4">
            <DeleteOrderButton orderId={order.id} />
          </div>
        </section>
      </div>
    </main>
  );
}
