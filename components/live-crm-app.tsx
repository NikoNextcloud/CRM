"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CloudUpload,
  FileArchive,
  FolderOpen,
  LayoutDashboard,
  Loader2,
  MessageSquareText,
  PanelLeft,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";
import { currency } from "@/lib/utils";

type CustomerRow = {
  id: string;
  first_name: string;
  last_name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  vat_number: string | null;
  notes: string | null;
  created_at: string;
  last_contact_at: string | null;
};

type OrderRow = {
  id: string;
  order_number: string;
  customer_id: string;
  product: string | null;
  status: OrderStatus;
  description: string | null;
  quantity: number;
  price: number | string;
  cost: number | string;
  profit?: number | string;
  created_at: string;
  deadline_at: string | null;
  notes: string | null;
};

type FileRow = {
  id: string;
  customer_id: string;
  order_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  size_bytes: number | null;
  created_at: string;
};

type TimelineRow = {
  id: string;
  customer_id: string;
  order_id: string | null;
  event_type: string;
  title: string;
  description: string | null;
  event_at: string;
};

type NoteRow = {
  id: string;
  customer_id: string;
  order_id: string | null;
  body: string;
  created_at: string;
};

type CrmPayload = {
  configured: boolean;
  customers: CustomerRow[];
  orders: OrderRow[];
  files: FileRow[];
  timeline: TimelineRow[];
  notes: NoteRow[];
  error?: string;
};

type OrderStatus =
  | "New"
  | "Quote Sent"
  | "Approved"
  | "In Production"
  | "Printing"
  | "Ready"
  | "Shipped"
  | "Completed"
  | "Cancelled";

const navItems = [
  "Dashboard",
  "Clients",
  "Orders",
  "Calendar",
  "Statistics",
  "AI Assistant",
  "Files",
  "Settings"
] as const;

const navLabels = {
  Dashboard: "Табло",
  Clients: "Клиенти",
  Orders: "Поръчки",
  Calendar: "Календар",
  Statistics: "Статистика",
  "AI Assistant": "AI Асистент",
  Files: "Файлове",
  Settings: "Настройки"
};

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

const statuses: OrderStatus[] = [
  "New",
  "Quote Sent",
  "Approved",
  "In Production",
  "Printing",
  "Ready",
  "Shipped",
  "Completed",
  "Cancelled"
];

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

const statusLabels: Record<OrderStatus, string> = {
  New: "Нова",
  "Quote Sent": "Оферта изпратена",
  Approved: "Одобрена",
  "In Production": "В производство",
  Printing: "Печат",
  Ready: "Готова",
  Shipped: "Изпратена",
  Completed: "Завършена",
  Cancelled: "Отказана"
};

const emptyCustomer = {
  first_name: "",
  last_name: "",
  company: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  vat_number: "",
  notes: ""
};

const emptyOrder = {
  customer_id: "",
  product: "",
  description: "",
  quantity: 1,
  price: 0,
  cost: 0,
  deadline_at: "",
  status: "New" as OrderStatus
};

function money(value: number | string | undefined | null) {
  return typeof value === "string" ? Number(value) || 0 : value || 0;
}

function shortDate(value?: string | null) {
  if (!value) return "Няма дата";
  return new Intl.DateTimeFormat("bg-BG", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function fileSize(bytes: number | null) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LiveCrmApp() {
  const [crm, setCrm] = useState<CrmPayload>({
    configured: false,
    customers: [],
    orders: [],
    files: [],
    timeline: [],
    notes: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [orderForm, setOrderForm] = useState(emptyOrder);
  const [note, setNote] = useState("");
  const [aiText, setAiText] = useState("AI анализът ще се появи тук, след като свържеш Cloudflare AI и натиснеш Анализирай.");
  const [aiLoading, setAiLoading] = useState(false);

  const selectedCustomer = useMemo(
    () => crm.customers.find((customer) => customer.id === selectedCustomerId) || crm.customers[0],
    [crm.customers, selectedCustomerId]
  );

  const selectedCustomerOrders = useMemo(
    () => crm.orders.filter((order) => order.customer_id === selectedCustomer?.id),
    [crm.orders, selectedCustomer?.id]
  );

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return crm.customers;
    return crm.customers.filter((customer) =>
      [customer.first_name, customer.last_name, customer.company, customer.phone, customer.email, customer.vat_number]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [crm.customers, search]);

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return crm.orders;
    return crm.orders.filter((order) =>
      [order.order_number, order.product, order.description, customerName(crm.customers, order.customer_id)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [crm.orders, crm.customers, search]);

  const totalRevenue = crm.orders.reduce((sum, order) => sum + money(order.price), 0);
  const totalProfit = crm.orders.reduce((sum, order) => sum + money(order.price) - money(order.cost), 0);
  const activeOrders = crm.orders.filter((order) => !["Completed", "Cancelled"].includes(order.status));
  const completedOrders = crm.orders.filter((order) => order.status === "Completed");
  const ordersToday = crm.orders.filter((order) => new Date(order.created_at).toDateString() === new Date().toDateString());
  const bestCustomer = useMemo(() => {
    return crm.customers
      .map((customer) => ({
        customer,
        revenue: crm.orders
          .filter((order) => order.customer_id === customer.id)
          .reduce((sum, order) => sum + money(order.price), 0)
      }))
      .sort((a, b) => b.revenue - a.revenue)[0];
  }, [crm.customers, crm.orders]);

  useEffect(() => {
    loadCrm();
  }, []);

  useEffect(() => {
    if (!selectedCustomerId && crm.customers[0]) setSelectedCustomerId(crm.customers[0].id);
    if (!orderForm.customer_id && crm.customers[0]) {
      setOrderForm((current) => ({ ...current, customer_id: crm.customers[0].id }));
    }
  }, [crm.customers, selectedCustomerId, orderForm.customer_id]);

  async function loadCrm() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/crm", { cache: "no-store" });
      const data = (await response.json()) as CrmPayload;
      setCrm(data);
      if (data.error) setMessage(data.error);
      if (!data.configured) setMessage("Supabase още не е свързан. Добави променливите на средата и рестартирай локално или публикувай отново във Vercel.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "CRM данните не можаха да се заредят.");
    } finally {
      setLoading(false);
    }
  }

  async function crmAction(body: unknown, success: string) {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Записът не беше успешен.");
      setMessage(success);
      await loadCrm();
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Записът не беше успешен.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerForm.first_name.trim() || !customerForm.last_name.trim()) {
      setMessage("Име и фамилия са задължителни.");
      return;
    }

    const payload = {
      first_name: customerForm.first_name.trim(),
      last_name: customerForm.last_name.trim(),
      company: customerForm.company.trim(),
      phone: customerForm.phone.trim(),
      email: customerForm.email.trim(),
      address: customerForm.address.trim(),
      city: customerForm.city.trim(),
      vat_number: customerForm.vat_number.trim(),
      notes: customerForm.notes.trim()
    };

    const ok =
      editingCustomer && selectedCustomer
        ? await crmAction({ action: "updateCustomer", id: selectedCustomer.id, payload }, "Клиентът е обновен.")
        : await crmAction({ action: "createCustomer", payload }, "Клиентът е добавен.");

    if (ok) {
      setCustomerForm(emptyCustomer);
      setEditingCustomer(false);
    }
  }

  async function saveOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!orderForm.customer_id || !orderForm.product.trim()) {
      setMessage("Избери клиент и въведи продукт.");
      return;
    }

    const ok = await crmAction(
      {
        action: "createOrder",
        payload: {
          ...orderForm,
          product: orderForm.product.trim(),
          description: orderForm.description.trim(),
          quantity: Number(orderForm.quantity) || 1,
          price: Number(orderForm.price) || 0,
          cost: Number(orderForm.cost) || 0,
          deadline_at: orderForm.deadline_at ? new Date(orderForm.deadline_at).toISOString() : null
        }
      },
      "Поръчката е добавена."
    );

    if (ok) setOrderForm({ ...emptyOrder, customer_id: orderForm.customer_id });
  }

  async function moveOrder(orderId: string, status: OrderStatus) {
    await crmAction({ action: "updateOrder", id: orderId, payload: { status } }, `Поръчката е преместена към: ${statusLabels[status]}.`);
  }

  async function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCustomer || !note.trim()) return;
    const ok = await crmAction(
      {
        action: "createNote",
        payload: { customer_id: selectedCustomer.id, body: note.trim() }
      },
      "Бележката е добавена."
    );
    if (ok) setNote("");
  }

  async function uploadFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const orderInput = form.elements.namedItem("order_id") as HTMLSelectElement;
    const file = fileInput.files?.[0];
    if (!selectedCustomer || !file || !orderInput.value) {
      setMessage("Първо избери клиент, поръчка и файл.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("customer_id", selectedCustomer.id);
    formData.append("order_id", orderInput.value);

    setSaving(true);
    try {
      const response = await fetch("/api/files", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Качването не беше успешно.");
      setMessage("Файлът е качен в Supabase Storage.");
      form.reset();
      await loadCrm();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Качването не беше успешно.");
    } finally {
      setSaving(false);
    }
  }

  async function runAiAnalysis() {
    setAiLoading(true);
    setAiText("");
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt:
            "Анализирай CRM данните и дай на собственика предложения за продажби, напомняния за последващ контакт, рискове, идеи за допълнителни продажби и оценка на стойността на клиентите. Отговори на български език.",
          context: {
            customers: crm.customers,
            orders: crm.orders,
            notes: crm.notes,
            timeline: crm.timeline
          }
        })
      });
      const data = await response.json();
      setAiText(data.result?.response || data.recommendation || JSON.stringify(data, null, 2));
    } catch (error) {
      setAiText(error instanceof Error ? error.message : "AI анализът не беше успешен.");
    } finally {
      setAiLoading(false);
    }
  }

  async function openFile(fileId: string) {
    setMessage("");
    try {
      const response = await fetch(`/api/files?id=${encodeURIComponent(fileId)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Не можа да се създаде линк към файла.");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Файлът не можа да се отвори.");
    }
  }

  function startEditCustomer() {
    if (!selectedCustomer) return;
    setEditingCustomer(true);
    setCustomerForm({
      first_name: selectedCustomer.first_name || "",
      last_name: selectedCustomer.last_name || "",
      company: selectedCustomer.company || "",
      phone: selectedCustomer.phone || "",
      email: selectedCustomer.email || "",
      address: selectedCustomer.address || "",
      city: selectedCustomer.city || "",
      vat_number: selectedCustomer.vat_number || "",
      notes: selectedCustomer.notes || ""
    });
  }

  const statCards = [
    { label: "Общо клиенти", value: crm.customers.length.toString(), icon: Users, tone: "text-accent" },
    { label: "Общо поръчки", value: crm.orders.length.toString(), icon: ClipboardList, tone: "text-violet" },
    { label: "Поръчки днес", value: ordersToday.length.toString(), icon: CalendarDays, tone: "text-coral" },
    { label: "Активни поръчки", value: activeOrders.length.toString(), icon: Activity, tone: "text-teal" },
    { label: "Завършени поръчки", value: completedOrders.length.toString(), icon: CheckCircle2, tone: "text-emerald-600" },
    { label: "Общ оборот", value: currency(totalRevenue), icon: BarChart3, tone: "text-ink" },
    { label: "Обща печалба", value: currency(totalProfit), icon: Sparkles, tone: "text-teal" },
    {
      label: "Средна стойност",
      value: crm.orders.length ? currency(totalRevenue / crm.orders.length) : currency(0),
      icon: TrendingUp,
      tone: "text-violet"
    },
    { label: "Файлове", value: crm.files.length.toString(), icon: FileArchive, tone: "text-coral" },
    { label: "Най-добър клиент", value: bestCustomer?.customer.company || "Няма данни", icon: Users, tone: "text-accent" }
  ];

  const selectedRevenue = selectedCustomerOrders.reduce((sum, order) => sum + money(order.price), 0);
  const selectedProfit = selectedCustomerOrders.reduce((sum, order) => sum + money(order.price) - money(order.cost), 0);
  const selectedFiles = crm.files.filter((file) => file.customer_id === selectedCustomer?.id);
  const selectedTimeline = crm.timeline.filter((event) => event.customer_id === selectedCustomer?.id);
  const selectedNotes = crm.notes.filter((item) => item.customer_id === selectedCustomer?.id);

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
                <h1 className="text-xl font-bold text-ink">AI CRM на живо</h1>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = navIcons[item];
                return (
                  <button
                    key={item}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      item === "Dashboard" ? "bg-ink text-white shadow-subtle" : "text-slate-600 hover:bg-white hover:text-ink"
                    }`}
                  >
                    <Icon size={18} />
                    {navLabels[item]}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="rounded-2xl border border-line bg-white p-4 shadow-subtle">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <Sparkles size={17} className="text-violet" />
              Статус на връзката
            </div>
            <p className="text-sm leading-6 text-muted">
              {crm.configured ? "Свързано със Supabase през сървърните API routes." : "Очакват се Supabase променливите на средата."}
            </p>
          </div>
        </aside>

        <section className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-5 rounded-2xl border border-line bg-white p-4 shadow-subtle">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Табло на собственика</p>
                <h2 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">Команден център за печатно производство</h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex min-w-0 items-center gap-2 rounded-xl border border-line bg-soft px-3 py-2 text-sm text-muted">
                  <Search size={17} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full bg-transparent outline-none placeholder:text-slate-400"
                    placeholder="Търси клиенти, поръчки, файлове..."
                  />
                </label>
                <button
                  onClick={loadCrm}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-soft"
                >
                  <RefreshCw size={17} />
                  Обнови
                </button>
                <button
                  onClick={runAiAnalysis}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-subtle hover:bg-slate-800"
                >
                  {aiLoading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
                  Анализирай
                </button>
              </div>
            </div>
            {message && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                {message}
              </div>
            )}
          </header>

          {loading ? (
            <div className="grid min-h-96 place-items-center rounded-2xl border border-line bg-white shadow-subtle">
              <div className="flex items-center gap-3 text-muted">
                <Loader2 className="animate-spin" />
                Зареждане на CRM данните в реално време...
              </div>
            </div>
          ) : (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {statCards.map((stat) => {
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

              <section className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                <FormCard title={editingCustomer ? "Редакция на клиент" : "Добави клиент"} icon={<Users size={19} />}>
                  <form onSubmit={saveCustomer} className="grid gap-3 md:grid-cols-2">
                    <Input label="Име" value={customerForm.first_name} onChange={(value) => setCustomerForm({ ...customerForm, first_name: value })} />
                    <Input label="Фамилия" value={customerForm.last_name} onChange={(value) => setCustomerForm({ ...customerForm, last_name: value })} />
                    <Input label="Фирма" value={customerForm.company} onChange={(value) => setCustomerForm({ ...customerForm, company: value })} />
                    <Input label="Телефон" value={customerForm.phone} onChange={(value) => setCustomerForm({ ...customerForm, phone: value })} />
                    <Input label="Имейл" value={customerForm.email} onChange={(value) => setCustomerForm({ ...customerForm, email: value })} />
                    <Input label="Град" value={customerForm.city} onChange={(value) => setCustomerForm({ ...customerForm, city: value })} />
                    <Input label="Адрес" value={customerForm.address} onChange={(value) => setCustomerForm({ ...customerForm, address: value })} />
                    <Input label="ДДС номер" value={customerForm.vat_number} onChange={(value) => setCustomerForm({ ...customerForm, vat_number: value })} />
                    <label className="md:col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Бележки</span>
                      <textarea
                        value={customerForm.notes}
                        onChange={(event) => setCustomerForm({ ...customerForm, notes: event.target.value })}
                        className="mt-1 min-h-20 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                    </label>
                    <div className="flex gap-2 md:col-span-2">
                      <button className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white" disabled={saving}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {editingCustomer ? "Запази промените" : "Добави клиент"}
                      </button>
                      {editingCustomer && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCustomer(false);
                            setCustomerForm(emptyCustomer);
                          }}
                          className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink"
                        >
                          Отказ
                        </button>
                      )}
                    </div>
                  </form>
                </FormCard>

                <FormCard title="Добави поръчка" icon={<Plus size={19} />}>
                  <form onSubmit={saveOrder} className="grid gap-3 md:grid-cols-2">
                    <label className="md:col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Клиент</span>
                      <select
                        value={orderForm.customer_id}
                        onChange={(event) => setOrderForm({ ...orderForm, customer_id: event.target.value })}
                        className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      >
                        <option value="">Избери клиент</option>
                        {crm.customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {displayCustomer(customer)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Input label="Продукт" value={orderForm.product} onChange={(value) => setOrderForm({ ...orderForm, product: value })} />
                    <label>
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Статус</span>
                      <select
                        value={orderForm.status}
                        onChange={(event) => setOrderForm({ ...orderForm, status: event.target.value as OrderStatus })}
                        className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>{statusLabels[status]}</option>
                        ))}
                      </select>
                    </label>
                    <Input label="Количество" type="number" value={String(orderForm.quantity)} onChange={(value) => setOrderForm({ ...orderForm, quantity: Number(value) })} />
                    <Input label="Цена" type="number" value={String(orderForm.price)} onChange={(value) => setOrderForm({ ...orderForm, price: Number(value) })} />
                    <Input label="Разход" type="number" value={String(orderForm.cost)} onChange={(value) => setOrderForm({ ...orderForm, cost: Number(value) })} />
                    <Input label="Краен срок" type="date" value={orderForm.deadline_at} onChange={(value) => setOrderForm({ ...orderForm, deadline_at: value })} />
                    <label className="md:col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Описание</span>
                      <textarea
                        value={orderForm.description}
                        onChange={(event) => setOrderForm({ ...orderForm, description: event.target.value })}
                        className="mt-1 min-h-20 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                    </label>
                    <button className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white md:col-span-2" disabled={saving}>
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      Добави поръчка
                    </button>
                  </form>
                </FormCard>
              </section>

              <section className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                <article className="premium-card rounded-2xl p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-ink">Клиенти на живо</h3>
                    <span className="text-sm text-muted">Показани: {filteredCustomers.length}</span>
                  </div>
                  <div className="space-y-3">
                    {filteredCustomers.map((customer) => {
                      const customerOrders = crm.orders.filter((order) => order.customer_id === customer.id);
                      const revenue = customerOrders.reduce((sum, order) => sum + money(order.price), 0);
                      return (
                        <button
                          key={customer.id}
                          onClick={() => setSelectedCustomerId(customer.id)}
                          className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                            selectedCustomer?.id === customer.id ? "border-accent bg-blue-50" : "border-line bg-white hover:bg-soft"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">{displayCustomer(customer)}</p>
                            <p className="truncate text-sm text-muted">{customer.phone || customer.email || customer.city || "Няма контакт"}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-ink">{currency(revenue)}</p>
                            <p className="text-xs text-muted">Поръчки: {customerOrders.length}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </article>

                <article className="premium-card rounded-2xl p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-ink">Поръчки на живо</h3>
                    <span className="text-sm text-muted">Активни: {activeOrders.length}</span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-line">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="bg-soft text-xs uppercase tracking-[0.12em] text-muted">
                        <tr>
                          <th className="px-4 py-3">Поръчка</th>
                          <th className="px-4 py-3">Клиент</th>
                          <th className="px-4 py-3">Статус</th>
                          <th className="px-4 py-3 text-right">Стойност</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line bg-white">
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-soft">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-ink">{order.order_number}</p>
                              <p className="text-muted">{order.product || "Производствена работа"}</p>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{customerName(crm.customers, order.customer_id)}</td>
                            <td className="px-4 py-3">
                              <select
                                value={order.status}
                                onChange={(event) => moveOrder(order.id, event.target.value as OrderStatus)}
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold outline-none ${statusColors[order.status]}`}
                              >
                                {statuses.map((status) => (
                                  <option key={status} value={status}>{statusLabels[status]}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-ink">{currency(money(order.price))}</td>
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
                    <h3 className="text-lg font-bold text-ink">Kanban на живо</h3>
                    <p className="text-sm text-muted">Премествай поръчките между колоните. Статусът се записва в Supabase.</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Bell size={16} />
                    Общо поръчки: {crm.orders.length}
                  </div>
                </div>
                <div className="grid gap-3 overflow-x-auto md:grid-cols-3 xl:grid-cols-9">
                  {statuses.map((status) => {
                    const columnOrders = crm.orders.filter((order) => order.status === status);
                    return (
                      <div
                        key={status}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          const id = event.dataTransfer.getData("text/plain");
                          if (id) moveOrder(id, status);
                        }}
                        className="min-h-40 rounded-xl border border-line bg-soft p-3"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-bold text-ink">{statusLabels[status]}</p>
                          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-muted">
                            {columnOrders.length}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {columnOrders.map((order) => (
                            <button
                              key={order.id}
                              draggable
                              onDragStart={(event) => event.dataTransfer.setData("text/plain", order.id)}
                              className="w-full cursor-grab rounded-lg bg-white p-3 text-left shadow-subtle active:cursor-grabbing"
                            >
                              <p className="text-sm font-semibold text-ink">{order.product || order.order_number}</p>
                              <p className="mt-1 text-xs text-muted">{shortDate(order.deadline_at)}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <article className="premium-card rounded-2xl p-5">
                  <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">360° профил на клиента</p>
                      <h3 className="text-xl font-bold text-ink">{selectedCustomer ? displayCustomer(selectedCustomer) : "Няма избран клиент"}</h3>
                    </div>
                    <button onClick={startEditCustomer} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-soft">
                      Редактирай клиент
                    </button>
                  </div>

                  {selectedCustomer ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-3">
                        <InfoPanel title="Информация за клиента">
                          <p className="font-bold text-ink">{selectedCustomer.first_name} {selectedCustomer.last_name}</p>
                          <p>{selectedCustomer.phone || "Няма телефон"}</p>
                          <p>{selectedCustomer.email || "Няма имейл"}</p>
                          <p>{[selectedCustomer.address, selectedCustomer.city].filter(Boolean).join(", ") || "Няма адрес"}</p>
                          <p>ДДС: {selectedCustomer.vat_number || "Няма ДДС номер"}</p>
                        </InfoPanel>
                        <InfoPanel title="Финансов преглед">
                          <Metric label="Оборот" value={currency(selectedRevenue)} />
                          <Metric label="Печалба" value={currency(selectedProfit)} />
                          <Metric label="Поръчки" value={selectedCustomerOrders.length.toString()} />
                          <Metric label="Средна стойност" value={selectedCustomerOrders.length ? currency(selectedRevenue / selectedCustomerOrders.length) : currency(0)} />
                        </InfoPanel>
                        <InfoPanel title="AI анализ">
                          <p>{aiText}</p>
                        </InfoPanel>
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border border-line p-4">
                          <h4 className="mb-3 font-bold text-ink">История</h4>
                          <div className="max-h-80 space-y-3 overflow-auto pr-1">
                            {selectedTimeline.map((event) => (
                              <div key={event.id} className="flex gap-3">
                                <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-accent">
                                  <MessageSquareText size={15} />
                                </div>
                                <div>
                                  <p className="font-semibold text-ink">{event.title}</p>
                                  <p className="text-sm text-muted">{shortDate(event.event_at)}</p>
                                  <p className="mt-1 text-sm leading-6 text-slate-700">{event.description}</p>
                                </div>
                              </div>
                            ))}
                            {!selectedTimeline.length && <p className="text-sm text-muted">Все още няма събития.</p>}
                          </div>
                        </div>

                        <div className="rounded-xl border border-line p-4">
                          <h4 className="mb-3 font-bold text-ink">Бележки</h4>
                          <form onSubmit={saveNote} className="mb-4 flex gap-2">
                            <input
                              value={note}
                              onChange={(event) => setNote(event.target.value)}
                              className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-accent"
                              placeholder="Добави бележка за клиента..."
                            />
                            <button className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white">Добави</button>
                          </form>
                          <div className="max-h-52 space-y-2 overflow-auto">
                            {selectedNotes.map((item) => (
                              <p key={item.id} className="rounded-xl bg-soft p-3 text-sm text-slate-700">
                                {item.body}
                              </p>
                            ))}
                            {!selectedNotes.length && <p className="text-sm text-muted">Все още няма бележки.</p>}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="rounded-xl bg-soft p-4 text-sm text-muted">Добави първия клиент, за да се активира 360° профилът.</p>
                  )}
                </article>

                <aside className="space-y-5">
                  <article className="premium-card rounded-2xl p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <CloudUpload size={19} className="text-coral" />
                      <h3 className="text-lg font-bold text-ink">Качване на файлове</h3>
                    </div>
                    <form onSubmit={uploadFile} className="space-y-3">
                      <select name="order_id" className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent">
                        <option value="">Избери поръчка</option>
                        {selectedCustomerOrders.map((order) => (
                          <option key={order.id} value={order.id}>
                            {order.order_number} - {order.product}
                          </option>
                        ))}
                      </select>
                      <input
                        name="file"
                        type="file"
                        className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                      <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white" disabled={saving}>
                        <CloudUpload size={16} />
                        Качи в Supabase
                      </button>
                    </form>
                    <div className="mt-4 space-y-2">
                      {selectedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between rounded-lg bg-soft p-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <FileArchive size={17} className="text-coral" />
                            <span className="truncate text-sm font-semibold text-ink">{file.file_name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => openFile(file.id)}
                            className="shrink-0 rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold text-ink hover:bg-soft"
                          >
                            {fileSize(file.size_bytes)}
                          </button>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="premium-card rounded-2xl p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Phone size={19} className="text-teal" />
                      <h3 className="text-lg font-bold text-ink">Предстоящи срокове</h3>
                    </div>
                    <div className="space-y-3">
                      {crm.orders
                        .filter((order) => order.deadline_at)
                        .slice()
                        .sort((a, b) => String(a.deadline_at).localeCompare(String(b.deadline_at)))
                        .slice(0, 5)
                        .map((order) => (
                          <div key={order.id} className="rounded-xl border border-line p-3">
                            <p className="font-semibold text-ink">{order.product || order.order_number}</p>
                            <p className="text-sm text-muted">{shortDate(order.deadline_at)} · {customerName(crm.customers, order.customer_id)}</p>
                          </div>
                        ))}
                    </div>
                  </article>
                </aside>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function displayCustomer(customer: CustomerRow) {
  return customer.company || `${customer.first_name} ${customer.last_name}`;
}

function customerName(customers: CustomerRow[], customerId: string) {
  const customer = customers.find((item) => item.id === customerId);
  return customer ? displayCustomer(customer) : "Неизвестен клиент";
}

function FormCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="premium-card rounded-2xl p-5">
      <div className="mb-5 flex items-center gap-2">
        <span className="text-accent">{icon}</span>
        <h3 className="text-lg font-bold text-ink">{title}</h3>
      </div>
      {children}
    </article>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </label>
  );
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line p-4 text-sm leading-6 text-muted">
      <p className="mb-2 text-sm font-semibold text-muted">{title}</p>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 font-bold text-ink">{value}</p>
    </div>
  );
}
