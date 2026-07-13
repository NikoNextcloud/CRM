import type { Customer, Order, StoredFile, TimelineEvent } from "./types";

export const customers: Customer[] = [
  {
    id: "c-001",
    firstName: "Martin",
    lastName: "Petrov",
    company: "Urban Coffee Studio",
    phone: "+359 888 215 047",
    email: "martin@urbancoffee.bg",
    address: "bul. Vitosha 41",
    city: "Sofia",
    vatNumber: "BG204812991",
    notes: "Premium client. Often orders seasonal signage and menus.",
    createdDate: "2025-01-18",
    lastContact: "2026-07-11"
  },
  {
    id: "c-002",
    firstName: "Elena",
    lastName: "Dimitrova",
    company: "Dimitrova Dental Clinic",
    phone: "+359 887 902 321",
    email: "office@ddclinic.bg",
    address: "ul. Shipka 19",
    city: "Plovdiv",
    vatNumber: "BG202700114",
    notes: "Needs precise brand colors and quick delivery.",
    createdDate: "2025-03-04",
    lastContact: "2026-07-09"
  },
  {
    id: "c-003",
    firstName: "Nikolay",
    lastName: "Georgiev",
    company: "Motion Auto",
    phone: "+359 899 440 118",
    email: "nikolay@motionauto.bg",
    address: "Industrialna zona 8",
    city: "Varna",
    vatNumber: "BG205900772",
    notes: "High-value vehicle branding customer.",
    createdDate: "2024-11-22",
    lastContact: "2026-06-29"
  },
  {
    id: "c-004",
    firstName: "Raya",
    lastName: "Koleva",
    company: "Raya Events",
    phone: "+359 886 100 774",
    email: "raya@rayaevents.bg",
    address: "ul. Angel Kanchev 7",
    city: "Burgas",
    vatNumber: "BG207441002",
    notes: "Orders many event materials with short deadlines.",
    createdDate: "2026-02-10",
    lastContact: "2026-07-12"
  }
];

export const orders: Order[] = [
  {
    id: "o-1001",
    number: "PP-2026-1001",
    customerId: "c-001",
    product: "Exterior lightbox sign",
    description: "Aluminum frame, acrylic face, LED module, installation included.",
    quantity: 1,
    price: 2850,
    cost: 1610,
    status: "In Production",
    createdDate: "2026-07-08",
    deadline: "2026-07-17"
  },
  {
    id: "o-1002",
    number: "PP-2026-1002",
    customerId: "c-002",
    product: "Frosted window foil",
    description: "Reception glass branding with privacy gradient and clinic logo.",
    quantity: 6,
    price: 1180,
    cost: 520,
    status: "Quote Sent",
    createdDate: "2026-07-10",
    deadline: "2026-07-18"
  },
  {
    id: "o-1003",
    number: "PP-2026-1003",
    customerId: "c-003",
    product: "Full van wrap",
    description: "Design adaptation, print, lamination and application for two vehicles.",
    quantity: 2,
    price: 7600,
    cost: 4300,
    status: "Printing",
    createdDate: "2026-07-03",
    deadline: "2026-07-15"
  },
  {
    id: "o-1004",
    number: "PP-2026-1004",
    customerId: "c-004",
    product: "Event banners and rollups",
    description: "Four rollups, twelve PVC banners, rush delivery.",
    quantity: 16,
    price: 3250,
    cost: 1420,
    status: "Ready",
    createdDate: "2026-07-11",
    deadline: "2026-07-14"
  },
  {
    id: "o-1005",
    number: "PP-2026-1005",
    customerId: "c-001",
    product: "Seasonal menu boards",
    description: "Magnetic boards, print-ready design, matte laminate.",
    quantity: 8,
    price: 960,
    cost: 360,
    status: "Completed",
    createdDate: "2026-06-22",
    deadline: "2026-06-28"
  }
];

export const files: StoredFile[] = [
  { id: "f-1", customerId: "c-001", orderId: "o-1001", name: "urban-coffee-sign.ai", type: "AI", size: "24 MB" },
  { id: "f-2", customerId: "c-001", orderId: "o-1001", name: "installation-plan.pdf", type: "PDF", size: "2.1 MB" },
  { id: "f-3", customerId: "c-003", orderId: "o-1003", name: "motion-auto-wrap.cdr", type: "CDR", size: "81 MB" },
  { id: "f-4", customerId: "c-004", orderId: "o-1004", name: "event-banners.zip", type: "ZIP", size: "134 MB" }
];

export const timeline: TimelineEvent[] = [
  {
    id: "t-1",
    customerId: "c-001",
    type: "order",
    date: "2026-07-08",
    time: "10:20",
    title: "Order created",
    description: "Exterior lightbox sign entered into production queue.",
    relatedOrder: "PP-2026-1001"
  },
  {
    id: "t-2",
    customerId: "c-001",
    type: "file",
    date: "2026-07-09",
    time: "14:05",
    title: "File uploaded",
    description: "Final logo vector and installation plan were attached.",
    relatedOrder: "PP-2026-1001"
  },
  {
    id: "t-3",
    customerId: "c-001",
    type: "ai",
    date: "2026-07-11",
    time: "09:30",
    title: "AI recommendation",
    description: "Offer autumn window campaign before September foot traffic increase.",
    relatedOrder: "PP-2026-1001"
  },
  {
    id: "t-4",
    customerId: "c-002",
    type: "email",
    date: "2026-07-10",
    time: "16:45",
    title: "Email offer sent",
    description: "Quotation for frosted window foil sent to the clinic manager.",
    relatedOrder: "PP-2026-1002"
  }
];

export const navItems = [
  "Dashboard",
  "Clients",
  "Orders",
  "Calendar",
  "Statistics",
  "AI Assistant",
  "Files",
  "Settings"
] as const;
