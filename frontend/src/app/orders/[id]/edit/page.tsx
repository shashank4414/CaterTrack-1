import Link from 'next/link';
import { notFound } from 'next/navigation';
import OrderForm from '../OrderForm';
import {
  formatDateInput,
  getClients,
  getMenuItems,
  getOrder,
} from '../../data';

type EditOrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = await params;

  const [order, clients, menuItems] = await Promise.all([
    getOrder(id).catch(() => null),
    getClients().catch(() => []),
    getMenuItems().catch(() => []),
  ]);

  if (!order) notFound();

  return (
    <main className="px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href={`/orders/${id}`}
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
          Order #{order.id}
        </Link>

        <section className="rounded-3xl border border-stone-300 bg-white/88 p-6 shadow-[0_24px_60px_-36px_rgba(120,53,15,0.4)] backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-700">
            Order Editor
          </p>
          <h1 className="mt-2 text-lg font-bold text-slate-900">Edit order</h1>
          <p className="mt-0.5 text-xs text-stone-500">
            Update the workflow details and line items for order #{order.id}.
          </p>
          <div className="mt-5 border-t border-stone-200 pt-5">
            <OrderForm
              mode="edit"
              orderId={order.id}
              clients={clients}
              menuItems={menuItems}
              cancelHref={`/orders/${order.id}`}
              initial={{
                clientId: String(order.clientId),
                status: order.status,
                deliveryDate: formatDateInput(order.deliveryDate),
                discount: order.discount ? String(order.discount) : '',
                note: order.note ?? '',
                items:
                  order.items?.map((item) => ({
                    menuItemId: String(item.menuItemId),
                    quantity: String(item.quantity),
                    note: item.note ?? '',
                  })) ?? [],
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
