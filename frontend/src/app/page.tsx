import Link from 'next/link';
import {
  formatCurrency,
  getClientDisplayName,
  getOrderItemCount,
  ORDER_STATUS_STYLES,
  type Order,
} from './orders/data';

type PaginatedResponse<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3001';
const UPCOMING_ORDER_LIMIT = 100;
const ACTIVE_ORDER_STATUSES = new Set(['pending', 'confirmed']);

async function fetchDashboardData<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

async function getCollectionTotal(path: string) {
  const data = await fetchDashboardData<{ total: number }>(path);
  return data?.total ?? null;
}

async function getOrderTotal(status?: string) {
  const query = new URLSearchParams({ limit: '1' });

  if (status) {
    query.set('status', status);
  }

  return getCollectionTotal(`/orders?${query.toString()}`);
}

async function getUpcomingOrders() {
  const query = new URLSearchParams({
    limit: String(UPCOMING_ORDER_LIMIT),
    sortBy: 'deliveryDate',
    order: 'asc',
  });

  const response = await fetchDashboardData<PaginatedResponse<Order>>(
    `/orders?${query.toString()}`,
  );

  return response?.data ?? [];
}

function formatMetric(value: number | null) {
  if (value === null) {
    return '—';
  }

  return new Intl.NumberFormat('en-US').format(value);
}

function formatCompactDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getRelativeScheduleLabel(iso: string) {
  const target = new Date(iso);
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startOfTarget = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  const diffInDays = Math.round(
    (startOfTarget.getTime() - startOfToday.getTime()) / 86400000,
  );

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Tomorrow';
  if (diffInDays < 0)
    return `${Math.abs(diffInDays)} day${Math.abs(diffInDays) === 1 ? '' : 's'} late`;
  return `In ${diffInDays} day${diffInDays === 1 ? '' : 's'}`;
}

function getUpcomingOrderRows(orders: Order[]) {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const scheduledActiveOrders = orders
    .filter(
      (order) =>
        order.deliveryDate &&
        ACTIVE_ORDER_STATUSES.has(order.status.toLowerCase()),
    )
    .sort((left, right) => {
      const leftTime = new Date(left.deliveryDate as string).getTime();
      const rightTime = new Date(right.deliveryDate as string).getTime();
      return leftTime - rightTime;
    });

  const upcomingOrders = scheduledActiveOrders.filter(
    (order) =>
      new Date(order.deliveryDate as string).getTime() >=
      startOfToday.getTime(),
  );

  return (
    upcomingOrders.length > 0 ? upcomingOrders : scheduledActiveOrders
  ).slice(0, 6);
}

export default async function Home() {
  const [
    pendingTotal,
    confirmedTotal,
    completedTotal,
    cancelledTotal,
    upcomingOrderSource,
  ] = await Promise.all([
    getOrderTotal('pending'),
    getOrderTotal('confirmed'),
    getOrderTotal('completed'),
    getOrderTotal('cancelled'),
    getUpcomingOrders(),
  ]);

  const orderCounts = {
    pending: pendingTotal ?? 0,
    confirmed: confirmedTotal ?? 0,
    completed: completedTotal ?? 0,
    cancelled: cancelledTotal ?? 0,
  };
  const trackedOrderTotal = Object.values(orderCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const upcomingOrders = getUpcomingOrderRows(upcomingOrderSource);
  const hasPartialData = [
    pendingTotal,
    confirmedTotal,
    completedTotal,
    cancelledTotal,
  ].some((value) => value === null);

  const statusCards = [
    {
      label: 'Pending',
      value: orderCounts.pending,
      description: 'Awaiting confirmation or kitchen review',
      cardClass: 'border-orange-200 bg-orange-50/90',
      trackClass: 'bg-orange-100',
      fillClass: 'from-orange-400 via-amber-300 to-orange-200',
    },
    {
      label: 'Confirmed',
      value: orderCounts.confirmed,
      description: 'Approved and on the production board',
      cardClass: 'border-amber-200 bg-amber-50/90',
      trackClass: 'bg-amber-100',
      fillClass: 'from-amber-500 via-orange-300 to-amber-200',
    },
    {
      label: 'Completed',
      value: orderCounts.completed,
      description: 'Delivered or closed successfully',
      cardClass: 'border-emerald-200 bg-emerald-50/85',
      trackClass: 'bg-emerald-100',
      fillClass: 'from-emerald-500 via-emerald-300 to-lime-200',
    },
    {
      label: 'Cancelled',
      value: orderCounts.cancelled,
      description: 'Dropped before fulfillment',
      cardClass: 'border-rose-200 bg-rose-50/85',
      trackClass: 'bg-rose-100',
      fillClass: 'from-rose-500 via-orange-300 to-rose-200',
    },
  ];

  return (
    <main className="px-4 py-8 text-slate-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-4xl border border-orange-200/70 bg-white/75 shadow-[0_30px_80px_-38px_rgba(120,53,15,0.45)] backdrop-blur-sm">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,1fr)]">
            <div className="relative space-y-4 px-5 py-6 sm:px-7 sm:py-7">
              <div className="absolute -left-10 top-6 h-32 w-32 rounded-full bg-orange-300/20 blur-3xl" />
              <div className="absolute bottom-2 right-10 h-28 w-28 rounded-full bg-rose-300/20 blur-3xl" />
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-700">
                  Catering Control Room
                </p>
                <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  CaterTrack
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                  Track your clients and orders in one place.
                </p>
              </div>

              <div className="relative flex flex-wrap gap-3">
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/85 px-5 py-3 text-sm font-semibold text-orange-800 transition hover:border-orange-300 hover:bg-orange-50"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="1" width="10" height="14" rx="1.5" />
                    <path d="M6 5h4M6 8h4M6 11h2" />
                  </svg>
                  All Orders
                </Link>
                <Link
                  href="/orders/new"
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/85 px-5 py-3 text-sm font-semibold text-orange-800 transition hover:border-orange-300 hover:bg-orange-50"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  >
                    <path d="M8 3v10M3 8h10" />
                  </svg>
                  New order
                </Link>
              </div>
            </div>

            <div className="px-4 py-4 sm:px-6 sm:py-6">
              <div className="rounded-3xl border border-orange-200/80 bg-white/82 p-4 text-slate-900 shadow-[0_28px_64px_-40px_rgba(120,53,15,0.35)] backdrop-blur-sm sm:rounded-[1.75rem] sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-700">
                  Workflow pulse
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-4 lg:grid-cols-1 xl:grid-cols-2">
                  {statusCards.map((status) => {
                    const share =
                      trackedOrderTotal > 0
                        ? Math.max(
                            8,
                            Math.round(
                              (status.value / trackedOrderTotal) * 100,
                            ),
                          )
                        : 8;

                    return (
                      <div
                        key={status.label}
                        className={`rounded-xl border p-3 sm:rounded-2xl sm:p-4 ${status.cardClass}`}
                      >
                        <div className="flex items-center justify-between gap-3 sm:items-start">
                          <div>
                            <p className="text-xs font-semibold text-slate-900 sm:text-sm">
                              {status.label}
                            </p>
                            <p className="mt-1 hidden text-xs leading-5 text-stone-600 sm:block">
                              {status.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-slate-950 sm:text-2xl">
                              {formatMetric(status.value)}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`mt-2 h-1.5 rounded-full sm:mt-4 sm:h-2 ${status.trackClass}`}
                        >
                          <div
                            className={`h-1.5 rounded-full bg-linear-to-r sm:h-2 ${status.fillClass}`}
                            style={{ width: `${share}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {hasPartialData && (
          <div className="rounded-3xl border border-amber-300 bg-amber-50/90 px-4 py-3 text-sm text-amber-900 shadow-[0_18px_50px_-32px_rgba(180,83,9,0.4)]">
            Some order data is temporarily unavailable because one or more API
            requests failed. The available sections are still live.
          </div>
        )}

        <section>
          <article className="rounded-4xl border border-stone-200 bg-white/82 p-6 shadow-[0_30px_80px_-42px_rgba(120,53,15,0.35)] backdrop-blur-sm">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-700">
                  Upcoming Orders
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  Next deliveries on the board
                </h2>
              </div>
              <Link
                href="/orders"
                className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-800 transition hover:border-orange-300 hover:bg-orange-100"
              >
                View all orders
              </Link>
            </div>

            {upcomingOrders.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-stone-300 bg-stone-50/70 px-6 py-12 text-center">
                <p className="text-base font-semibold text-slate-900">
                  No scheduled active orders
                </p>
                <p className="mt-2 text-sm text-stone-500">
                  Add a delivery date to pending or confirmed orders and they
                  will surface here.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {upcomingOrders.map((order) => {
                  const deliveryDate = order.deliveryDate as string;
                  const statusStyle =
                    ORDER_STATUS_STYLES[order.status.toLowerCase()] ??
                    'bg-stone-50 text-stone-600 border-stone-200';

                  return (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="block rounded-3xl border border-stone-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,240,0.96))] p-4 transition hover:border-orange-300 hover:shadow-[0_22px_48px_-36px_rgba(120,53,15,0.5)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-lg font-semibold text-slate-950">
                              {getClientDisplayName(order.client)}
                            </p>
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusStyle}`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-stone-500">
                            Order #{order.id}
                            {order.note?.trim()
                              ? ` • ${order.note.trim().slice(0, 70)}`
                              : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-950">
                            {formatCurrency(order.total)}
                          </p>
                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
                            {getOrderItemCount(order)} items
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-orange-800">
                          {formatCompactDate(deliveryDate)}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
                          {getRelativeScheduleLabel(deliveryDate)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}
