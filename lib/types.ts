export type OrderStatus =
  | "New"
  | "Quote Sent"
  | "Approved"
  | "In Production"
  | "Printing"
  | "Ready"
  | "Shipped"
  | "Completed"
  | "Cancelled";

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  vatNumber: string;
  notes: string;
  createdDate: string;
  lastContact: string;
};

export type Order = {
  id: string;
  number: string;
  customerId: string;
  product: string;
  description: string;
  quantity: number;
  price: number;
  cost: number;
  status: OrderStatus;
  createdDate: string;
  deadline: string;
};

export type TimelineEvent = {
  id: string;
  customerId: string;
  type: "call" | "email" | "message" | "order" | "shipping" | "payment" | "note" | "file" | "ai";
  date: string;
  time: string;
  title: string;
  description: string;
  relatedOrder?: string;
};

export type StoredFile = {
  id: string;
  customerId: string;
  orderId: string;
  name: string;
  type: string;
  size: string;
};
