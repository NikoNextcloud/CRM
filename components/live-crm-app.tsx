"use client";

import { type DragEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Archive,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  Loader2,
  MessageSquareText,
  PanelLeft,
  Pencil,
  Phone,
  Plus,
  Moon,
  RefreshCw,
  Save,
  Search,
  Settings,
  Sparkles,
  Sun,
  Trash2,
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
  viber: string | null;
  whatsapp: string | null;
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

type NotificationRow = {
  id: string;
  customer_id: string | null;
  order_id: string | null;
  title: string;
  description: string | null;
  due_at: string | null;
  is_read: boolean;
  created_at: string;
};

type CalendarNoteRow = {
  id: string;
  customer_id: string | null;
  order_id: string | null;
  title: string;
  body: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
};

type CrmPayload = {
  configured: boolean;
  customers: CustomerRow[];
  orders: OrderRow[];
  files: FileRow[];
  timeline: TimelineRow[];
  notifications: NotificationRow[];
  notes: NoteRow[];
  calendar_notes: CalendarNoteRow[];
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
  | "Cancelled"
  | "Archived";

const navItems = [
  "Dashboard",
  "Clients",
  "Orders",
  "Calendar",
  "ArchiveView",
  "Settings"
] as const;

type AppView = (typeof navItems)[number];

const navLabels = {
  Dashboard: "Табло",
  Clients: "Клиенти",
  Orders: "Поръчки",
  Calendar: "Календар",
  ArchiveView: "Архив",
  Settings: "Настройки"
};

const navIcons = {
  Dashboard: LayoutDashboard,
  Clients: Users,
  Orders: ClipboardList,
  Calendar: CalendarDays,
  ArchiveView: Archive,
  Settings
};

const defaultModuleOrder = ["stats", "forms", "lists", "kanban", "ordersForm", "calendar", "profile", "settings"] as const;
type ModuleId = (typeof defaultModuleOrder)[number];

const statuses: OrderStatus[] = [
  "New",
  "Quote Sent",
  "Approved",
  "In Production",
  "Printing",
  "Ready",
  "Shipped",
  "Completed",
  "Cancelled",
  "Archived"
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
  Cancelled: "bg-rose-50 text-rose-700",
  Archived: "bg-stone-100 text-stone-700"
};

const statusColumnColors: Record<OrderStatus, string> = {
  New: "border-slate-300 bg-slate-50 shadow-[0_0_24px_rgba(100,116,139,0.16)]",
  "Quote Sent": "border-blue-300 bg-blue-50 shadow-[0_0_24px_rgba(37,99,235,0.18)]",
  Approved: "border-emerald-300 bg-emerald-50 shadow-[0_0_24px_rgba(5,150,105,0.18)]",
  "In Production": "border-amber-300 bg-amber-50 shadow-[0_0_24px_rgba(217,119,6,0.2)]",
  Printing: "border-violet-300 bg-violet-50 shadow-[0_0_24px_rgba(124,58,237,0.18)]",
  Ready: "border-teal-300 bg-teal-50 shadow-[0_0_24px_rgba(13,148,136,0.18)]",
  Shipped: "border-cyan-300 bg-cyan-50 shadow-[0_0_24px_rgba(8,145,178,0.18)]",
  Completed: "border-green-300 bg-green-50 shadow-[0_0_24px_rgba(22,163,74,0.18)]",
  Cancelled: "border-rose-300 bg-rose-50 shadow-[0_0_24px_rgba(225,29,72,0.18)]",
  Archived: "border-stone-300 bg-stone-50 shadow-[0_0_24px_rgba(120,113,108,0.18)]"
};

const statusCardColors: Record<OrderStatus, string> = {
  New: "border-l-slate-500",
  "Quote Sent": "border-l-blue-500",
  Approved: "border-l-emerald-500",
  "In Production": "border-l-amber-500",
  Printing: "border-l-violet-500",
  Ready: "border-l-teal-500",
  Shipped: "border-l-cyan-500",
  Completed: "border-l-green-500",
  Cancelled: "border-l-rose-500",
  Archived: "border-l-stone-500"
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
  Cancelled: "Отказана",
  Archived: "Архив"
};

const emptyCustomer = {
  first_name: "",
  last_name: "",
  company: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  viber: "",
  whatsapp: "",
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

function localDateFromValue(value: string | Date) {
  if (value instanceof Date) return value;
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly && !value.includes("T")) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }
  return new Date(value);
}

function formatLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shortDate(value?: string | null) {
  if (!value) return "Няма дата";
  return new Intl.DateTimeFormat("bg-BG", { day: "2-digit", month: "short", year: "numeric" }).format(localDateFromValue(value));
}

function cleanPhone(value?: string | null) {
  return (value || "").replace(/[^\d+]/g, "");
}

function whatsappLink(value?: string | null) {
  const phone = cleanPhone(value).replace(/^\+/, "");
  return phone ? `https://wa.me/${phone}` : "";
}

function viberLink(value?: string | null) {
  const phone = cleanPhone(value);
  return phone ? `viber://chat?number=${encodeURIComponent(phone)}` : "";
}

function dateKey(value: string | Date) {
  const date = localDateFromValue(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatLocalDateKey(date);
}

function buildCalendarDays(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return {
      date: day,
      key: dateKey(day),
      inMonth: day.getMonth() === month,
      label: day.getDate()
    };
  });
}

function isDateInRange(day: string, start?: string | null, end?: string | null) {
  if (!day || !start || !end) return false;
  const from = start <= end ? start : end;
  const to = start <= end ? end : start;
  return day >= from && day <= to;
}

export function LiveCrmApp() {
  const [crm, setCrm] = useState<CrmPayload>({
    configured: false,
    customers: [],
    orders: [],
    files: [],
    timeline: [],
    notifications: [],
    notes: [],
    calendar_notes: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState<AppView>("Dashboard");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [moduleOrder, setModuleOrder] = useState<ModuleId[]>([...defaultModuleOrder]);
  const [draggedModule, setDraggedModule] = useState<ModuleId | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [orderForm, setOrderForm] = useState(emptyOrder);
  const [editingOrderId, setEditingOrderId] = useState("");
  const [note, setNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState("");
  const [calendarForm, setCalendarForm] = useState({
    id: "",
    customer_id: "",
    order_id: "",
    title: "",
    body: "",
    start_date: "",
    end_date: ""
  });
  const [reminderForm, setReminderForm] = useState({
    order_id: "",
    due_at: "",
    description: ""
  });
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

  const archivedOrders = useMemo(
    () =>
      crm.orders.filter((order) => ["Archived", "Completed", "Cancelled"].includes(order.status)),
    [crm.orders]
  );

  const filteredOrders = useMemo(() => {
    const visibleOrders = crm.orders.filter((order) => order.status !== "Archived");
    const query = search.toLowerCase().trim();
    if (!query) return visibleOrders;
    return visibleOrders.filter((order) =>
      [order.order_number, order.product, order.description, customerName(crm.customers, order.customer_id)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [crm.orders, crm.customers, search]);

  const totalRevenue = crm.orders.reduce((sum, order) => sum + money(order.price), 0);
  const totalProfit = crm.orders.reduce((sum, order) => sum + money(order.price) - money(order.cost), 0);
  const activeOrders = crm.orders.filter((order) => !["Completed", "Cancelled", "Archived"].includes(order.status));
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
    const storedTheme = window.localStorage.getItem("printpilot:theme");
    if (storedTheme === "dark" || storedTheme === "light") setTheme(storedTheme);
    const storedModuleOrder = window.localStorage.getItem("printpilot:module-order");
    if (storedModuleOrder) {
      try {
        const parsed = JSON.parse(storedModuleOrder) as string[];
        const valid = parsed.filter((item): item is ModuleId => defaultModuleOrder.includes(item as ModuleId));
        const missing = defaultModuleOrder.filter((item) => !valid.includes(item));
        setModuleOrder([...valid, ...missing]);
      } catch {
        setModuleOrder([...defaultModuleOrder]);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("printpilot:theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("printpilot:module-order", JSON.stringify(moduleOrder));
  }, [moduleOrder]);

  useEffect(() => {
    if (!("Notification" in window)) return;
    const timers = crm.notifications
      .filter((item) => !item.is_read && item.due_at)
      .map((item) => {
        const delay = new Date(item.due_at as string).getTime() - Date.now();
        if (delay <= 0 || delay > 2147483647) return null;
        return window.setTimeout(() => {
          if (Notification.permission === "granted") {
            new Notification(item.title, { body: item.description || "Имате напомняне за поръчка." });
          } else {
            setMessage(`${item.title}: ${item.description || "Имате напомняне за поръчка."}`);
          }
        }, delay);
      })
      .filter((timer): timer is number => timer !== null);

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [crm.notifications]);

  useEffect(() => {
    if (!selectedCustomerId && crm.customers[0]) setSelectedCustomerId(crm.customers[0].id);
  }, [crm.customers, selectedCustomerId]);

  useEffect(() => {
    if (!calendarForm.customer_id && crm.customers[0]) {
      setCalendarForm((current) => ({ ...current, customer_id: crm.customers[0].id }));
    }
  }, [crm.customers, calendarForm.customer_id]);

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
      viber: customerForm.viber.trim(),
      whatsapp: customerForm.whatsapp.trim(),
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
    if (!orderForm.customer_id) {
      setMessage("Избери клиент за поръчката.");
      return;
    }

    const productName = orderForm.product.trim() || "Обща поръчка";
    const payload = {
      ...orderForm,
      product: productName,
      description: orderForm.description.trim(),
      quantity: Number(orderForm.quantity) || 1,
      price: Number(orderForm.price) || 0,
      cost: Number(orderForm.cost) || 0,
      deadline_at: orderForm.deadline_at || null
    };

    const ok = editingOrderId
      ? await crmAction({ action: "updateOrder", id: editingOrderId, payload }, "Поръчката е обновена.")
      : await crmAction({ action: "createOrder", payload }, "Поръчката е добавена.");

    if (ok) {
      setOrderForm(emptyOrder);
      setEditingOrderId("");
      setActiveView("Orders");
    }
  }

  function startEditOrder(order: OrderRow) {
    setEditingOrderId(order.id);
    setOrderForm({
      customer_id: order.customer_id,
      product: order.product || "",
      description: order.description || "",
      quantity: order.quantity || 1,
      price: money(order.price),
      cost: money(order.cost),
      deadline_at: order.deadline_at ? order.deadline_at.slice(0, 10) : "",
      status: order.status
    });
    setActiveView("Orders");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditOrder() {
    setEditingOrderId("");
    setOrderForm(emptyOrder);
  }

  async function deleteOrder(orderId: string) {
    const confirmed = window.confirm("Сигурен ли си, че искаш да изтриеш тази поръчка?");
    if (!confirmed) return;
    await crmAction({ action: "deleteOrder", id: orderId }, "Поръчката е изтрита.");
  }

  async function moveOrder(orderId: string, status: OrderStatus) {
    await crmAction({ action: "updateOrder", id: orderId, payload: { status } }, `Поръчката е преместена към: ${statusLabels[status]}.`);
  }

  async function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCustomer || !note.trim()) return;
    const ok = editingNoteId
      ? await crmAction({ action: "updateNote", id: editingNoteId, payload: { body: note.trim() } }, "Бележката е обновена.")
      : await crmAction(
          {
            action: "createNote",
            payload: { customer_id: selectedCustomer.id, body: note.trim() }
          },
          "Бележката е добавена."
        );
    if (ok) {
      setNote("");
      setEditingNoteId("");
    }
  }

  async function deleteNote(noteId: string) {
    const confirmed = window.confirm("Сигурен ли си, че искаш да изтриеш тази бележка?");
    if (!confirmed) return;
    await crmAction({ action: "deleteNote", id: noteId }, "Бележката е изтрита.");
  }

  async function saveCalendarNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!calendarForm.start_date || !calendarForm.end_date) {
      setMessage("Избери начален и краен ден за срока.");
      return;
    }
    const startDate = calendarForm.start_date <= calendarForm.end_date ? calendarForm.start_date : calendarForm.end_date;
    const endDate = calendarForm.start_date <= calendarForm.end_date ? calendarForm.end_date : calendarForm.start_date;
    const payload = {
      customer_id: calendarForm.customer_id || null,
      order_id: calendarForm.order_id || null,
      title: calendarForm.title.trim() || "Срок за изработка",
      body: calendarForm.body.trim(),
      start_date: startDate,
      end_date: endDate
    };
    const ok = calendarForm.id
      ? await crmAction({ action: "updateCalendarNote", id: calendarForm.id, payload }, "Календарната бележка е обновена.")
      : await crmAction({ action: "createCalendarNote", payload }, "Календарната бележка е записана.");
    if (ok) {
      setCalendarForm({
        id: "",
        customer_id: calendarForm.customer_id,
        order_id: "",
        title: "",
        body: "",
        start_date: "",
        end_date: ""
      });
    }
  }

  async function deleteCalendarNote(id: string) {
    const confirmed = window.confirm("Сигурен ли си, че искаш да изтриеш тази календарна бележка?");
    if (!confirmed) return;
    await crmAction({ action: "deleteCalendarNote", id }, "Календарната бележка е изтрита.");
  }

  async function saveReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reminderForm.order_id || !reminderForm.due_at) {
      setMessage("Избери поръчка, дата и час за напомнянето.");
      return;
    }
    const order = crm.orders.find((item) => item.id === reminderForm.order_id);
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    const ok = await crmAction(
      {
        action: "createReminder",
        payload: {
          customer_id: order?.customer_id || null,
          order_id: reminderForm.order_id,
          title: `Напомняне за ${order?.order_number || "поръчка"}`,
          description: reminderForm.description.trim() || "Провери поръчката.",
          due_at: new Date(reminderForm.due_at).toISOString()
        }
      },
      "Напомнянето е записано."
    );
    if (ok) setReminderForm({ order_id: "", due_at: "", description: "" });
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
      viber: selectedCustomer.viber || "",
      whatsapp: selectedCustomer.whatsapp || "",
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
    { label: "Най-добър клиент", value: bestCustomer?.customer.company || "Няма данни", icon: Users, tone: "text-accent" }
  ];

  const selectedRevenue = selectedCustomerOrders.reduce((sum, order) => sum + money(order.price), 0);
  const selectedProfit = selectedCustomerOrders.reduce((sum, order) => sum + money(order.price) - money(order.cost), 0);
  const selectedTimeline = crm.timeline.filter((event) => event.customer_id === selectedCustomer?.id);
  const selectedNotes = crm.notes.filter((item) => item.customer_id === selectedCustomer?.id);
  const calendarDays = buildCalendarDays();
  const calendarOrders = crm.orders.filter((order) => order.deadline_at);
  const selectedCalendarCustomer = crm.customers.find((customer) => customer.id === calendarForm.customer_id);
  const selectedCalendarOrder = crm.orders.find((order) => order.id === calendarForm.order_id);
  const showStats = activeView === "Dashboard";
  const showCustomerForm = activeView === "Dashboard" || activeView === "Clients";
  const showOrderForm = activeView === "Dashboard";
  const showCustomerList = activeView === "Dashboard" || activeView === "Clients";
  const showOrderList = activeView === "Dashboard" || activeView === "Orders";
  const showKanban = activeView === "Dashboard" || activeView === "Orders";
  const showCustomerProfile = activeView === "Dashboard" || activeView === "Clients";
  const showDeadlines = activeView === "Dashboard";

  function moduleDragProps(id: ModuleId) {
    const order = moduleOrder.includes(id) ? moduleOrder.indexOf(id) : defaultModuleOrder.indexOf(id);
    return {
      draggable: true,
      onDragStart: () => setDraggedModule(id),
      onDragOver: (event: DragEvent<HTMLElement>) => event.preventDefault(),
      onDrop: (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        if (!draggedModule || draggedModule === id) return;
        setModuleOrder((current) => {
          const next = current.filter((item) => item !== draggedModule);
          const targetIndex = next.indexOf(id);
          next.splice(targetIndex < 0 ? next.length : targetIndex, 0, draggedModule);
          return next;
        });
        setDraggedModule(null);
      },
      onDragEnd: () => setDraggedModule(null),
      title: "Хвани и премести този модул",
      style: { order }
    };
  }

  return (
    <main className={`${theme === "dark" ? "dark" : ""} min-h-screen pb-24 lg:pb-0`}>
      <div className="flex min-h-screen">
        <aside className="glass-panel sticky top-0 hidden h-screen w-72 shrink-0 flex-col justify-between p-5 lg:flex">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-white shadow-subtle">
                <PanelLeft size={21} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-ink">AI CRM на живо</h1>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = navIcons[item];
                return (
                  <button
                    key={item}
                    onClick={() => setActiveView(item)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      item === activeView ? "bg-ink text-white shadow-subtle" : "text-slate-600 hover:bg-white hover:text-ink"
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
          {/* Мобилен горен бар */}
          <header className="sticky top-2 z-40 mb-4 rounded-2xl border border-line bg-white/95 p-3 shadow-subtle backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink text-white">
                  <PanelLeft size={17} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-bold leading-tight text-ink">{navLabels[activeView]}</p>
                  <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted">AI CRM на живо</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen((open) => !open)}
                  className={`grid h-10 w-10 place-items-center rounded-xl border border-line ${mobileSearchOpen ? "bg-ink text-white" : "text-ink"}`}
                  title="Търсене"
                >
                  <Search size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink"
                  title="Смени темата"
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                  type="button"
                  onClick={loadCrm}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink"
                  title="Обнови"
                >
                  <RefreshCw size={18} />
                </button>
                <button
                  type="button"
                  onClick={runAiAnalysis}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white"
                  title="AI анализ"
                >
                  {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                </button>
              </div>
            </div>
            {mobileSearchOpen && (
              <label className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-soft px-3 py-2.5 text-base text-muted">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full bg-transparent outline-none placeholder:text-slate-400"
                  placeholder="Търси клиенти, поръчки..."
                  autoFocus
                />
              </label>
            )}
            {message && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-800">
                {message}
              </div>
            )}
          </header>

          {/* Десктоп хедър */}
          <header className="mb-5 hidden rounded-2xl border border-line bg-white p-4 shadow-subtle lg:block">
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
                    placeholder="Търси клиенти, поръчки..."
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-soft"
                  title={theme === "dark" ? "Включи бяла тема" : "Включи черна тема"}
                >
                  {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                  {theme === "dark" ? "Бяла" : "Черна"}
                </button>
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
            <div className="flex flex-col">
              {showStats && <section {...moduleDragProps("stats")} className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
                {statCards.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <article key={stat.label} className="premium-card rounded-2xl p-3 sm:p-4">
                      <div className="mb-2 flex items-center justify-between sm:mb-4">
                        <span className="text-xs font-medium text-muted sm:text-sm">{stat.label}</span>
                        <Icon size={18} className={`shrink-0 ${stat.tone}`} />
                      </div>
                      <strong className="block truncate text-lg font-bold text-ink sm:text-2xl">{stat.value}</strong>
                    </article>
                  );
                })}
              </section>}

              {(showCustomerForm || showOrderForm) && <section {...moduleDragProps("forms")} className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                {showCustomerForm && <FormCard title={editingCustomer ? "Редакция на клиент" : "Добави клиент"} icon={<Users size={19} />}>
                  <form onSubmit={saveCustomer} className="grid gap-3 md:grid-cols-2">
                    <Input label="Име" value={customerForm.first_name} onChange={(value) => setCustomerForm({ ...customerForm, first_name: value })} />
                    <Input label="Фамилия" value={customerForm.last_name} onChange={(value) => setCustomerForm({ ...customerForm, last_name: value })} />
                    <Input label="Фирма" value={customerForm.company} onChange={(value) => setCustomerForm({ ...customerForm, company: value })} />
                    <Input label="Телефон" value={customerForm.phone} onChange={(value) => setCustomerForm({ ...customerForm, phone: value })} />
                    <Input label="Имейл" value={customerForm.email} onChange={(value) => setCustomerForm({ ...customerForm, email: value })} />
                    <Input label="Viber номер" value={customerForm.viber} onChange={(value) => setCustomerForm({ ...customerForm, viber: value })} />
                    <Input label="WhatsApp номер" value={customerForm.whatsapp} onChange={(value) => setCustomerForm({ ...customerForm, whatsapp: value })} />
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
                </FormCard>}

                {showOrderForm && <FormCard title={editingOrderId ? "Редакция на поръчка" : "Добави поръчка"} icon={editingOrderId ? <Pencil size={19} /> : <Plus size={19} />}>
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
                    <div className="flex gap-2 md:col-span-2">
                      <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white" disabled={saving}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : editingOrderId ? <Save size={16} /> : <Plus size={16} />}
                        {editingOrderId ? "Запази промените" : "Добави поръчка"}
                      </button>
                      {editingOrderId && (
                        <button type="button" onClick={cancelEditOrder} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink">
                          Отказ
                        </button>
                      )}
                    </div>
                  </form>
                </FormCard>}

                {showOrderForm && reminderForm.order_id && (
                  <FormCard title="Напомняне за поръчка" icon={<Bell size={19} />}>
                    <form onSubmit={saveReminder} className="grid gap-3 md:grid-cols-2">
                      <label className="md:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Поръчка</span>
                        <select
                          value={reminderForm.order_id}
                          onChange={(event) => setReminderForm({ ...reminderForm, order_id: event.target.value })}
                          className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                        >
                          {crm.orders.map((order) => (
                            <option key={order.id} value={order.id}>
                              {order.order_number} - {order.product || order.description || "Обща поръчка"}
                            </option>
                          ))}
                        </select>
                      </label>
                      <Input
                        label="Дата и час"
                        type="datetime-local"
                        value={reminderForm.due_at}
                        onChange={(value) => setReminderForm({ ...reminderForm, due_at: value })}
                      />
                      <Input
                        label="Бележка"
                        value={reminderForm.description}
                        onChange={(value) => setReminderForm({ ...reminderForm, description: value })}
                      />
                      <div className="flex gap-2 md:col-span-2">
                        <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white" disabled={saving}>
                          {saving ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
                          Запази напомняне
                        </button>
                        <button
                          type="button"
                          onClick={() => setReminderForm({ order_id: "", due_at: "", description: "" })}
                          className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink"
                        >
                          Отказ
                        </button>
                      </div>
                    </form>
                  </FormCard>
                )}
              </section>}

              {(showCustomerList || showOrderList) && <section {...moduleDragProps("lists")} className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                {showCustomerList && <article className="premium-card rounded-2xl p-5">
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
                </article>}

                {showOrderList && <article className="premium-card rounded-2xl p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-ink">Поръчки на живо</h3>
                    <span className="text-sm text-muted">Активни: {activeOrders.length}</span>
                  </div>
                  {/* Мобилен изглед: карти */}
                  <div className="space-y-3 md:hidden">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="rounded-xl border border-line bg-white p-4 shadow-subtle">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-ink">{order.order_number}</p>
                            <p className="truncate text-sm text-slate-700">{order.product || order.description || "Обща поръчка"}</p>
                            <p className="mt-0.5 truncate text-sm text-muted">{customerName(crm.customers, order.customer_id)}</p>
                          </div>
                          <span className="shrink-0 text-base font-bold text-ink">{currency(money(order.price))}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <select
                            value={order.status}
                            onChange={(event) => moveOrder(order.id, event.target.value as OrderStatus)}
                            className={`min-w-0 flex-1 rounded-xl px-3 py-2 text-sm font-semibold outline-none ${statusColors[order.status]}`}
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>{statusLabels[status]}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => startEditOrder(order)}
                            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-white text-slate-600"
                            title="Редактирай"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReminderForm({ order_id: order.id, due_at: "", description: "" });
                              setActiveView("Orders");
                            }}
                            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700"
                            title="Напомняне"
                          >
                            <Bell size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteOrder(order.id)}
                            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700"
                            title="Изтрий"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {!filteredOrders.length && <p className="rounded-xl bg-soft p-4 text-sm text-muted">Няма поръчки.</p>}
                  </div>

                  {/* Десктоп изглед: таблица */}
                  <div className="hidden overflow-x-auto rounded-xl border border-line md:block">
                    <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                      <thead className="bg-soft text-xs uppercase tracking-[0.12em] text-muted">
                        <tr>
                          <th className="px-4 py-3">Поръчка</th>
                          <th className="px-4 py-3">Клиент</th>
                          <th className="px-4 py-3">Статус</th>
                          <th className="px-4 py-3 text-right">Стойност</th>
                          <th className="px-4 py-3 text-right">Действие</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line bg-white">
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-soft">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-ink">{order.order_number}</p>
                              <p className="text-muted">{order.product || order.description || "Обща поръчка"}</p>
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
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => startEditOrder(order)}
                                className="mr-2 inline-flex items-center justify-center rounded-lg border border-line bg-white p-2 text-slate-600 transition hover:bg-soft hover:text-ink"
                                title="Редактирай поръчката"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setReminderForm({ order_id: order.id, due_at: "", description: "" });
                                  setActiveView("Orders");
                                }}
                                className="mr-2 inline-flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-700 transition hover:bg-amber-100"
                                title="Добави напомняне"
                              >
                                <Bell size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteOrder(order.id)}
                                className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700 transition hover:bg-rose-100"
                                title="Изтрий поръчката"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>}
              </section>}

              {showKanban && <section {...moduleDragProps("kanban")} className="mt-5 premium-card rounded-2xl p-5">
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-ink">Поръчки</h3>
                    <p className="text-sm text-muted">Премествай поръчките между колоните или ги редактирай с молива. Колоната „Архив" изпраща поръчката в таб Архив.</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Bell size={16} />
                    Общо поръчки: {crm.orders.length}
                  </div>
                </div>
                <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 lg:snap-none">
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
                        className={`min-h-40 w-[78vw] max-w-64 shrink-0 snap-start rounded-xl border p-3 sm:w-64 ${statusColumnColors[status]}`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-bold text-ink">{statusLabels[status]}</p>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[status]}`}>
                            {columnOrders.length}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {columnOrders.map((order) => (
                            <div
                              key={order.id}
                              draggable
                              onDragStart={(event) => {
                                event.stopPropagation();
                                event.dataTransfer.setData("text/plain", order.id);
                              }}
                              className={`w-full cursor-grab rounded-lg border-l-4 bg-white p-3 text-left shadow-subtle active:cursor-grabbing ${statusCardColors[order.status]}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-ink">{order.product || order.description || order.order_number}</p>
                                <button
                                  type="button"
                                  onClick={() => startEditOrder(order)}
                                  className="shrink-0 rounded-lg border border-line bg-white p-1.5 text-slate-500 transition hover:bg-soft hover:text-ink"
                                  title="Редактирай поръчката"
                                >
                                  <Pencil size={13} />
                                </button>
                              </div>
                              <p className="mt-1 text-xs text-muted">{customerName(crm.customers, order.customer_id)}</p>
                              <p className="mt-1 text-xs text-muted">{shortDate(order.deadline_at)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>}

              {activeView === "Orders" && (
                <section {...moduleDragProps("ordersForm")} className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                  <FormCard title={editingOrderId ? "Редакция на поръчка" : "Добави поръчка"} icon={editingOrderId ? <Pencil size={19} /> : <Plus size={19} />}>
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
                      <div className="flex gap-2 md:col-span-2">
                        <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white" disabled={saving}>
                          {saving ? <Loader2 size={16} className="animate-spin" /> : editingOrderId ? <Save size={16} /> : <Plus size={16} />}
                          {editingOrderId ? "Запази промените" : "Добави поръчка"}
                        </button>
                        {editingOrderId && (
                          <button type="button" onClick={cancelEditOrder} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink">
                            Отказ
                          </button>
                        )}
                      </div>
                    </form>
                  </FormCard>

                  {reminderForm.order_id && (
                    <FormCard title="Напомняне за поръчка" icon={<Bell size={19} />}>
                      <form onSubmit={saveReminder} className="grid gap-3 md:grid-cols-2">
                        <label className="md:col-span-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Поръчка</span>
                          <select
                            value={reminderForm.order_id}
                            onChange={(event) => setReminderForm({ ...reminderForm, order_id: event.target.value })}
                            className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                          >
                            {crm.orders.map((order) => (
                              <option key={order.id} value={order.id}>
                                {order.order_number} - {order.product || order.description || "Обща поръчка"}
                              </option>
                            ))}
                          </select>
                        </label>
                        <Input
                          label="Дата и час"
                          type="datetime-local"
                          value={reminderForm.due_at}
                          onChange={(value) => setReminderForm({ ...reminderForm, due_at: value })}
                        />
                        <Input
                          label="Бележка"
                          value={reminderForm.description}
                          onChange={(value) => setReminderForm({ ...reminderForm, description: value })}
                        />
                        <div className="flex gap-2 md:col-span-2">
                          <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white" disabled={saving}>
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
                            Запази напомняне
                          </button>
                          <button
                            type="button"
                            onClick={() => setReminderForm({ order_id: "", due_at: "", description: "" })}
                            className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink"
                          >
                            Отказ
                          </button>
                        </div>
                      </form>
                    </FormCard>
                  )}
                </section>
              )}

              {activeView === "ArchiveView" && (
                <section className="mt-5 premium-card rounded-2xl p-5">
                  <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-ink">Архив на поръчките</h3>
                      <p className="text-sm text-muted">Тук се пазят всички завършени, отказани и архивирани поръчки. Можеш да върнеш поръчка обратно, като смениш статуса ѝ.</p>
                    </div>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-700">
                      Общо в архива: {archivedOrders.length}
                    </span>
                  </div>
                  {archivedOrders.length ? (
                    <div className="space-y-3">
                      {archivedOrders
                        .slice()
                        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
                        .map((order) => (
                          <div key={order.id} className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4 shadow-subtle sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="font-bold text-ink">{order.order_number}</p>
                              <p className="truncate text-sm text-slate-700">{order.product || order.description || "Обща поръчка"}</p>
                              <p className="mt-1 text-sm text-muted">
                                {customerName(crm.customers, order.customer_id)} · Създадена: {shortDate(order.created_at)}
                                {order.deadline_at ? ` · Срок: ${shortDate(order.deadline_at)}` : ""}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-ink">{currency(money(order.price))}</span>
                              <select
                                value={order.status}
                                onChange={(event) => moveOrder(order.id, event.target.value as OrderStatus)}
                                className={`rounded-full px-2.5 py-1.5 text-xs font-semibold outline-none ${statusColors[order.status]}`}
                                title="Смени статуса, за да върнеш поръчката"
                              >
                                {statuses.map((status) => (
                                  <option key={status} value={status}>{statusLabels[status]}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => startEditOrder(order)}
                                className="inline-flex items-center justify-center rounded-lg border border-line bg-white p-2 text-slate-600 transition hover:bg-soft hover:text-ink"
                                title="Редактирай поръчката"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteOrder(order.id)}
                                className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700 transition hover:bg-rose-100"
                                title="Изтрий завинаги"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="rounded-xl bg-soft p-4 text-sm text-muted">Архивът е празен. Когато завършиш или архивираш поръчка, тя ще се появи тук.</p>
                  )}
                </section>
              )}

              {activeView === "Calendar" && (
                <section {...moduleDragProps("calendar")} className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
                  <article className="premium-card rounded-2xl p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-ink">Календар на сроковете</h3>
                        <p className="text-sm text-muted">Зеленият ден е днешната дата. Червените дни са срокове за изработка или избрани периоди.</p>
                      </div>
                      <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                        {new Intl.DateTimeFormat("bg-BG", { month: "long", year: "numeric" }).format(new Date())}
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-[0.12em] text-muted sm:gap-2">
                      {["Пон", "Вто", "Сря", "Чет", "Пет", "Съб", "Нед"].map((day) => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>
                    <div className="mt-3 grid grid-cols-7 gap-1 sm:gap-2">
                      {calendarDays.map((day) => {
                        const isToday = day.key === formatLocalDateKey(new Date());
                        const orderForDay = calendarOrders.find((order) => dateKey(order.deadline_at || "") === day.key);
                        const savedNote = crm.calendar_notes.find((item) => isDateInRange(day.key, item.start_date, item.end_date));
                        const selectedRange = isDateInRange(day.key, calendarForm.start_date, calendarForm.end_date);
                        const isDeadline = Boolean(orderForDay || savedNote || selectedRange);
                        return (
                          <div
                            key={day.key}
                            className={`min-h-14 rounded-lg border p-1.5 text-left transition sm:min-h-28 sm:rounded-xl sm:p-2 ${
                              isToday
                                ? "border-green-500 bg-green-100 text-green-950 ring-2 ring-green-500"
                                : isDeadline
                                  ? "border-rose-200 bg-rose-50 text-rose-950"
                                  : day.inMonth
                                    ? "border-line bg-white"
                                    : "border-slate-100 bg-slate-50 text-slate-400"
                            }`}
                          >
                            <div className="mb-1 flex items-center justify-between sm:mb-2">
                              <span className={`text-sm font-bold ${isToday ? "grid h-6 w-6 place-items-center rounded-full bg-green-600 text-white sm:h-7 sm:w-7" : ""}`}>{day.label}</span>
                              {isToday && <span className="hidden rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white sm:inline">Днес</span>}
                              {!isToday && isDeadline && <span className="h-2 w-2 rounded-full bg-rose-600" />}
                            </div>
                            {orderForDay && (
                              <p className="hidden line-clamp-2 text-xs font-semibold sm:block">
                                {customerName(crm.customers, orderForDay.customer_id)} · {orderForDay.product || orderForDay.description || orderForDay.order_number}
                              </p>
                            )}
                            {savedNote && (
                              <p className="mt-1 hidden line-clamp-2 text-xs sm:block">
                                {savedNote.title}{savedNote.body ? ` · ${savedNote.body}` : ""}
                              </p>
                            )}
                            {selectedRange && !savedNote && (
                              <p className="mt-1 hidden text-xs font-semibold sm:block">Нов избран срок</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </article>

                  <article className="premium-card rounded-2xl p-5">
                    <h3 className="mb-4 text-lg font-bold text-ink">Бележка в календара</h3>
                    <form onSubmit={saveCalendarNote} className="space-y-3">
                      <label>
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Клиент</span>
                        <select
                          value={calendarForm.customer_id}
                          onChange={(event) => setCalendarForm({ ...calendarForm, customer_id: event.target.value, order_id: "" })}
                          className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                        >
                          <option value="">Без клиент</option>
                          {crm.customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>{displayCustomer(customer)}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Поръчка</span>
                        <select
                          value={calendarForm.order_id}
                          onChange={(event) => setCalendarForm({ ...calendarForm, order_id: event.target.value })}
                          className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                        >
                          <option value="">Без поръчка</option>
                          {crm.orders
                            .filter((order) => !calendarForm.customer_id || order.customer_id === calendarForm.customer_id)
                            .map((order) => (
                              <option key={order.id} value={order.id}>{order.order_number} - {order.product || order.description || "Обща поръчка"}</option>
                            ))}
                        </select>
                      </label>
                      <Input label="Начален ден" type="date" value={calendarForm.start_date} onChange={(value) => setCalendarForm({ ...calendarForm, start_date: value })} />
                      <Input label="Краен ден" type="date" value={calendarForm.end_date} onChange={(value) => setCalendarForm({ ...calendarForm, end_date: value })} />
                      <Input label="Заглавие" value={calendarForm.title} onChange={(value) => setCalendarForm({ ...calendarForm, title: value })} />
                      <label>
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Бележка</span>
                        <textarea
                          value={calendarForm.body}
                          onChange={(event) => setCalendarForm({ ...calendarForm, body: event.target.value })}
                          className="mt-1 min-h-28 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                        />
                      </label>
                      <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
                        {selectedCalendarCustomer ? displayCustomer(selectedCalendarCustomer) : "Без избран клиент"}
                        {selectedCalendarOrder ? ` · ${selectedCalendarOrder.order_number}` : ""}
                      </div>
                      <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white" disabled={saving}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {calendarForm.id ? "Обнови в календара" : "Запази в календара"}
                      </button>
                      {calendarForm.id && (
                        <button
                          type="button"
                          onClick={() =>
                            setCalendarForm({
                              id: "",
                              customer_id: calendarForm.customer_id,
                              order_id: "",
                              title: "",
                              body: "",
                              start_date: "",
                              end_date: ""
                            })
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink"
                        >
                          Отказ от редакция
                        </button>
                      )}
                    </form>
                    <div className="mt-5 space-y-2">
                      {crm.calendar_notes.map((item) => (
                        <div key={item.id} className="rounded-xl border border-line bg-soft p-3 text-sm">
                          <p className="font-semibold text-ink">{item.title}</p>
                          <p className="text-muted">
                            {shortDate(item.start_date)} - {shortDate(item.end_date)}
                            {item.customer_id ? ` · ${customerName(crm.customers, item.customer_id)}` : ""}
                          </p>
                          {item.body && <p className="mt-1 leading-6 text-slate-700">{item.body}</p>}
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setCalendarForm({
                                  id: item.id,
                                  customer_id: item.customer_id || "",
                                  order_id: item.order_id || "",
                                  title: item.title,
                                  body: item.body || "",
                                  start_date: item.start_date,
                                  end_date: item.end_date
                                })
                              }
                              className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-soft"
                            >
                              Редактирай
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteCalendarNote(item.id)}
                              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              Изтрий
                            </button>
                          </div>
                        </div>
                      ))}
                      {!crm.calendar_notes.length && <p className="text-sm text-muted">Все още няма записани календарни бележки.</p>}
                    </div>
                  </article>
                </section>
              )}

              {(showCustomerProfile || showDeadlines) && <section {...moduleDragProps("profile")} className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                {showCustomerProfile && <article className="premium-card rounded-2xl p-5">
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
                          <div className="mt-3 flex flex-wrap gap-2">
                            <a
                              href={viberLink(selectedCustomer.viber || selectedCustomer.phone)}
                              className={`rounded-xl px-3 py-2 text-sm font-semibold ${viberLink(selectedCustomer.viber || selectedCustomer.phone) ? "bg-violet text-white" : "pointer-events-none bg-slate-100 text-slate-400"}`}
                            >
                              Отвори Viber
                            </a>
                            <a
                              href={whatsappLink(selectedCustomer.whatsapp || selectedCustomer.phone)}
                              target="_blank"
                              rel="noreferrer"
                              className={`rounded-xl px-3 py-2 text-sm font-semibold ${whatsappLink(selectedCustomer.whatsapp || selectedCustomer.phone) ? "bg-teal text-white" : "pointer-events-none bg-slate-100 text-slate-400"}`}
                            >
                              Отвори WhatsApp
                            </a>
                          </div>
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
                          <form onSubmit={saveNote} className="mb-4 flex flex-col gap-2 sm:flex-row">
                            <input
                              value={note}
                              onChange={(event) => setNote(event.target.value)}
                              className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-accent"
                              placeholder="Добави бележка за клиента..."
                            />
                            <button className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white">
                              {editingNoteId ? "Запази" : "Добави"}
                            </button>
                            {editingNoteId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNoteId("");
                                  setNote("");
                                }}
                                className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink"
                              >
                                Отказ
                              </button>
                            )}
                          </form>
                          <div className="max-h-52 space-y-2 overflow-auto">
                            {selectedNotes.map((item) => (
                              <div key={item.id} className="rounded-xl bg-soft p-3 text-sm text-slate-700">
                                <p className="leading-6">{item.body}</p>
                                <div className="mt-3 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingNoteId(item.id);
                                      setNote(item.body);
                                    }}
                                    className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-soft"
                                  >
                                    Редактирай
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteNote(item.id)}
                                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                  >
                                    Изтрий
                                  </button>
                                </div>
                              </div>
                            ))}
                            {!selectedNotes.length && <p className="text-sm text-muted">Все още няма бележки.</p>}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="rounded-xl bg-soft p-4 text-sm text-muted">Добави първия клиент, за да се активира 360° профилът.</p>
                  )}
                </article>}

                {showDeadlines && <aside className="space-y-5">
                  {showDeadlines && <article className="premium-card rounded-2xl p-5">
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
                            <p className="font-semibold text-ink">{order.product || order.description || order.order_number}</p>
                            <p className="text-sm text-muted">{shortDate(order.deadline_at)} · {customerName(crm.customers, order.customer_id)}</p>
                          </div>
                        ))}
                    </div>
                  </article>}
                </aside>}
              </section>}

              {activeView === "Settings" && (
                <section {...moduleDragProps("settings")} className="mt-5 grid gap-5 xl:grid-cols-2">
                  <article className="premium-card rounded-2xl p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Settings size={19} className="text-accent" />
                      <h3 className="text-lg font-bold text-ink">Настройки на връзките</h3>
                    </div>
                    <div className="space-y-3 text-sm leading-6 text-slate-700">
                      <p>Supabase статус: {crm.configured ? "свързан" : "не е свързан"}</p>
                      <p>За запис на клиенти, поръчки и файлове трябва да са добавени Supabase променливите на средата.</p>
                      <p>За AI анализ трябва да са добавени Cloudflare AI ключовете.</p>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white"
                      >
                        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                        {theme === "dark" ? "Бяла тема" : "Черна тема"}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!("Notification" in window)) {
                            setMessage("Този браузър не поддържа известия.");
                            return;
                          }
                          const permission = await Notification.requestPermission();
                          setMessage(permission === "granted" ? "Известията са включени." : "Известията не са разрешени.");
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-soft"
                      >
                        <Bell size={16} />
                        Разреши известия
                      </button>
                      <button
                        type="button"
                        onClick={loadCrm}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-soft"
                      >
                        <RefreshCw size={16} />
                        Синхронизирай
                      </button>
                    </div>
                  </article>
                  <article className="premium-card rounded-2xl p-5">
                    <h3 className="mb-4 text-lg font-bold text-ink">Нужни променливи</h3>
                    <div className="space-y-2 rounded-xl bg-soft p-4 text-sm font-semibold text-slate-700">
                      <p>NEXT_PUBLIC_SUPABASE_URL</p>
                      <p>NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
                      <p>SUPABASE_SERVICE_ROLE_KEY</p>
                      <p>CLOUDFLARE_ACCOUNT_ID</p>
                      <p>CLOUDFLARE_API_TOKEN</p>
                    </div>
                  </article>
                </section>
              )}
            </div>
          )}
        </section>
      </div>
      <nav className="fixed inset-x-2 bottom-2 z-50 grid grid-cols-6 gap-1 rounded-2xl border border-line bg-white/95 p-2 shadow-premium backdrop-blur lg:hidden">
        {navItems.map((item) => {
          const Icon = navIcons[item];
          return (
            <button
              key={item}
              type="button"
              onClick={() => {
                setActiveView(item);
                window.scrollTo({ top: 0 });
              }}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold leading-none transition ${
                item === activeView ? "bg-ink text-white" : "text-slate-600 hover:bg-soft hover:text-ink"
              }`}
              title={navLabels[item]}
            >
              <Icon size={20} />
              <span>{navLabels[item]}</span>
            </button>
          );
        })}
      </nav>
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
