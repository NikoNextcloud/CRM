import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Cloud,
  FileArchive,
  FolderOpen,
  LayoutDashboard,
  MessageSquareText,
  PanelLeft,
  Phone,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";
import { KanbanBoard } from "@/components/kanban-board";
import { currency } from "@/lib/utils";
import { customers, files, navItems, orders, timeline } from "@/lib/data";
import type { OrderStatus } from "@/lib/types";

const navIcons = {
  Dashboard: LayoutDashboard,
  Clients: Users,
  Orders: ClipboardList,
  Calendar: CalendarDays,
  Statistics: BarChart3,
  "AI Assistant": Sparkles,
  Files: FolderOpen,
  Settings
};

const statusColors: Record<OrderStatus, string> = {
  New: "bg-slate-100 text-slate-700",
  "Quote Sent": "bg-blue-50 text-blue-700",
  Approved: "bg-emerald-50 text-emerald-700",
  "In Production": "bg-amber-50 text-amber-700",
  Printing: "bg-violet-50 text-violet-700",
  Ready: "bg-teal-50 text-teal-700",
  Shipped: "bg-cyan-50 text-cyan-700",
  Completed: "bg-green-50 text-green-700",
  Cancelled: "bg-rose-50 text-rose-700"
};

const activeOrders = orders.filter((order) =>
  ["New", "Quote Sent", "Approved", "In Production", "Printing", "Ready", "Shipped"].includes(order.status)
);
const completedOrders = orders.filter((order) => order.status === "Completed");
const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0);
const totalProfit = orders.reduce((sum, order) => sum + order.price - order.cost, 0);
const averageOrderValue = totalRevenue / orders.length;
const bestCustomer = customers[0];
const today = "2026-07-13";
const ordersToday = orders.filter((order) => order.createdDate === today).length;

const stats = [
  { label: "Total Customers", value: customers.length.toString(), icon: Users, tone: "text-accent" },
  { label: "Total Orders", value: orders.length.toString(), icon: ClipboardList, tone: "text-violet" },
  { label: "Orders Today", value: ordersToday.toString(), icon: CalendarDays, tone: "text-coral" },
  { label: "Active Orders", value: activeOrders.length.toString(), icon: Activity, tone: "text-teal" },
  { label: "Completed Orders", value: completedOrders.length.toString(), icon: CheckCircle2, tone: "text-emerald-600" },
  { label: "Monthly Revenue", value: currency(15840), icon: TrendingUp, tone: "text-accent" },
  { label: "Total Revenue", value: currency(totalRevenue), icon: BarChart3, tone: "text-ink" },
  { label: "Total Profit", value: currency(totalProfit), icon: Sparkles, tone: "text-teal" },
  { label: "Average Order Value", value: currency(averageOrderValue), icon: Cloud, tone: "text-violet" },
  { label: "Best Customer", value: bestCustomer.company, icon: Users, tone: "text-coral" }
];

const chartBars = [
  { label: "Jan", revenue: 42, profit: 25, orders: 18 },
  { label: "Feb", revenue: 56, profit: 34, orders: 24 },
  { label: "Mar", revenue: 49, profit: 31, orders: 20 },
  { label: "Apr", revenue: 64, profit: 41, orders: 28 },
  { label: "May", revenue: 72, profit: 46, orders: 34 },
  { label: "Jun", revenue: 68, profit: 39, orders: 31 },
  { label: "Jul", revenue: 86, profit: 54, orders: 38 }
];

function customerName(customerId: string) {
  const customer = customers.find((item) => item.id === customerId);
  return customer ? `${customer.firstName} ${customer.lastName}` : "Unknown customer";
}

export default function Home() {
  const selectedCustomer = customers[0];
  const selectedCustomerOrders = orders.filter((order) => order.customerId === selectedCustomer.id);
  const selectedCustomerRevenue = selectedCustomerOrders.reduce((sum, order) => sum + order.price, 0);
  const selectedCustomerProfit = selectedCustomerOrders.reduce((sum, order) => sum + order.price - order.cost, 0);
  const selectedTimeline = timeline.filter((event) => event.customerId === selectedCustomer.id);

  return (
    <main className="min-h-screen">
      <div className="flex min-h-screen">
        <aside className="glass-panel sticky top-0 hidden h-screen w-72 shrink-0 flex-col justify-between p-5 lg:flex">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-white shadow-subtle">
                <PanelLeft size={21} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">PrintPilot</p>
                <h1 className="text-xl font-bold text-ink">AI CRM</h1>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = navIcons[item];
                const active = item === "Dashboard";
                return (
                  <button
                    key={item}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-ink text-white shadow-subtle"
                        : "text-slate-600 hover:bg-white hover:text-ink"
                    }`}
                  >
                    <Icon size={18} />
                    {item}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="rounded-2xl border border-line bg-white p-4 shadow-subtle">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <Sparkles size={17} className="text-violet" />
              AI Pulse
            </div>
            <p className="text-sm leading-6 text-muted">
              3 clients are ready for follow-up. One high-value order needs deadline attention.
            </p>
          </div>
        </aside>

        <section className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 shadow-subtle md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Owner dashboard</p>
              <h2 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">Print production command center</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex min-w-0 items-center gap-2 rounded-xl border border-line bg-soft px-3 py-2 text-sm text-muted">
                <Search size={17} />
                <input
                  className="w-full bg-transparent outline-none placeholder:text-slate-400"
                  placeholder="Search customers, orders, files..."
                />
              </label>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-subtle transition hover:bg-slate-800">
                <Bell size={17} />
                Notifications
              </button>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <article key={stat.label} className="premium-card rounded-2xl p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted">{stat.label}</span>
                    <Icon size={18} className={stat.tone} />
                  </div>
                  <strong className="block truncate text-2xl font-bold text-ink">{stat.value}</strong>
                </article>
              );
            })}
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
            <article className="premium-card rounded-2xl p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-ink">Revenue, Profit and Orders</h3>
                  <p className="text-sm text-muted">Monthly business health across sales and production.</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">+18.4%</span>
              </div>
              <div className="flex h-72 items-end gap-3 rounded-xl border border-line bg-soft p-4">
                {chartBars.map((bar) => (
                  <div key={bar.label} className="flex h-full flex-1 flex-col justify-end gap-1">
                    <div className="flex flex-1 items-end gap-1">
                      <span className="w-full rounded-t bg-accent" style={{ height: `${bar.revenue}%` }} />
                      <span className="w-full rounded-t bg-teal" style={{ height: `${bar.profit}%` }} />
                      <span className="w-full rounded-t bg-coral" style={{ height: `${bar.orders}%` }} />
                    </div>
                    <span className="text-center text-xs font-medium text-muted">{bar.label}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="premium-card rounded-2xl p-5">
              <div className="mb-5 flex items-center gap-2">
                <Sparkles size={19} className="text-violet" />
                <h3 className="text-lg font-bold text-ink">AI Suggestions</h3>
              </div>
              <div className="space-y-3">
                {[
                  "Send a follow-up to Dimitrova Dental Clinic. Offer expires soon.",
                  "Motion Auto has strong repeat potential. Suggest fleet discount.",
                  "Create a seasonal coffee shop package for windows, menus and outdoor boards."
                ].map((suggestion) => (
                  <div key={suggestion} className="rounded-xl border border-line bg-soft p-3 text-sm leading-6 text-slate-700">
                    {suggestion}
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <article className="premium-card rounded-2xl p-5">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-ink">Recent Customers</h3>
                <button className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  View all <ChevronRight size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {customers.map((customer) => {
                  const customerOrders = orders.filter((order) => order.customerId === customer.id);
                  const spent = customerOrders.reduce((sum, order) => sum + order.price, 0);
                  return (
                    <div key={customer.id} className="flex items-center justify-between rounded-xl border border-line p-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{customer.company}</p>
                        <p className="truncate text-sm text-muted">{customer.firstName} {customer.lastName} · {customer.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-ink">{currency(spent)}</p>
                        <p className="text-xs text-muted">{customerOrders.length} orders</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="premium-card rounded-2xl p-5">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-ink">Recent Orders</h3>
                <span className="text-sm text-muted">{activeOrders.length} active</span>
              </div>
              <div className="overflow-hidden rounded-xl border border-line">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-soft text-xs uppercase tracking-[0.12em] text-muted">
                    <tr>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-white">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-soft">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-ink">{order.number}</p>
                          <p className="text-muted">{order.product}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{customerName(order.customerId)}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-ink">{currency(order.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          <section className="mt-5 premium-card rounded-2xl p-5">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">Order Status Kanban</h3>
                <p className="text-sm text-muted">Drag-and-drop ready structure for production workflow.</p>
              </div>
              <button className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-soft">
                New Order
              </button>
            </div>
            <KanbanBoard initialOrders={orders} />
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <article className="premium-card rounded-2xl p-5">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Customer 360 View</p>
                <h3 className="text-xl font-bold text-ink">{selectedCustomer.company}</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-line p-4">
                  <p className="text-sm font-semibold text-muted">Customer Information</p>
                  <h4 className="mt-2 font-bold text-ink">{selectedCustomer.firstName} {selectedCustomer.lastName}</h4>
                  <p className="mt-1 text-sm text-muted">{selectedCustomer.phone}</p>
                  <p className="text-sm text-muted">{selectedCustomer.email}</p>
                  <p className="mt-2 text-sm text-muted">{selectedCustomer.address}, {selectedCustomer.city}</p>
                  <p className="text-sm text-muted">VAT: {selectedCustomer.vatNumber}</p>
                </div>
                <div className="rounded-xl border border-line p-4">
                  <p className="text-sm font-semibold text-muted">Financial Overview</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Metric label="Revenue" value={currency(selectedCustomerRevenue)} />
                    <Metric label="Profit" value={currency(selectedCustomerProfit)} />
                    <Metric label="Orders" value={selectedCustomerOrders.length.toString()} />
                    <Metric label="AOV" value={currency(selectedCustomerRevenue / selectedCustomerOrders.length)} />
                  </div>
                </div>
                <div className="rounded-xl border border-line p-4">
                  <p className="text-sm font-semibold text-muted">AI Analysis</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Loyalty score 87/100. Best contact window: late August. Recommended offer: branded autumn window set.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-line p-4">
                  <h4 className="mb-3 font-bold text-ink">Customer Timeline</h4>
                  <div className="space-y-3">
                    {selectedTimeline.map((event) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-accent">
                          <MessageSquareText size={15} />
                        </div>
                        <div>
                          <p className="font-semibold text-ink">{event.title}</p>
                          <p className="text-sm text-muted">{event.date} · {event.time} · {event.relatedOrder}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-700">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-line p-4">
                  <h4 className="mb-3 font-bold text-ink">Files and Product Gallery</h4>
                  <div className="space-y-2">
                    {files
                      .filter((file) => file.customerId === selectedCustomer.id)
                      .map((file) => (
                        <div key={file.id} className="flex items-center justify-between rounded-lg bg-soft p-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <FileArchive size={17} className="text-coral" />
                            <span className="truncate text-sm font-semibold text-ink">{file.name}</span>
                          </div>
                          <span className="text-xs text-muted">{file.size}</span>
                        </div>
                      ))}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {["Lightbox", "Menu", "Window"].map((item, index) => (
                      <div
                        key={item}
                        className="grid aspect-[4/3] place-items-center rounded-xl border border-line bg-soft text-xs font-semibold text-muted"
                      >
                        {item} {index + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            <aside className="space-y-5">
              <article className="premium-card rounded-2xl p-5">
                <div className="mb-4 flex items-center gap-2">
                  <CalendarDays size={19} className="text-coral" />
                  <h3 className="text-lg font-bold text-ink">Upcoming Deadlines</h3>
                </div>
                <div className="space-y-3">
                  {orders
                    .slice()
                    .sort((a, b) => a.deadline.localeCompare(b.deadline))
                    .slice(0, 4)
                    .map((order) => (
                      <div key={order.id} className="rounded-xl border border-line p-3">
                        <p className="font-semibold text-ink">{order.product}</p>
                        <p className="text-sm text-muted">{order.deadline} · {customerName(order.customerId)}</p>
                      </div>
                    ))}
                </div>
              </article>

              <article className="premium-card rounded-2xl p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Phone size={19} className="text-teal" />
                  <h3 className="text-lg font-bold text-ink">Reminders</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <p className="rounded-xl bg-soft p-3 text-slate-700">Call Urban Coffee Studio about installation time.</p>
                  <p className="rounded-xl bg-soft p-3 text-slate-700">Follow up on unanswered clinic offer.</p>
                  <p className="rounded-xl bg-soft p-3 text-slate-700">Prepare thank you message after Raya Events pickup.</p>
                </div>
              </article>
            </aside>
          </section>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 font-bold text-ink">{value}</p>
    </div>
  );
}
