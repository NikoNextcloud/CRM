"use client";

import { useMemo, useState } from "react";
import type { Order, OrderStatus } from "@/lib/types";

const kanbanStatuses: OrderStatus[] = [
  "New",
  "Quote Sent",
  "Approved",
  "In Production",
  "Printing",
  "Ready",
  "Shipped",
  "Completed"
];

export function KanbanBoard({ initialOrders }: { initialOrders: Order[] }) {
  const [items, setItems] = useState(initialOrders);
  const grouped = useMemo(
    () =>
      kanbanStatuses.map((status) => ({
        status,
        orders: items.filter((order) => order.status === status)
      })),
    [items]
  );

  function moveOrder(orderId: string, status: OrderStatus) {
    setItems((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  }

  return (
    <div className="grid gap-3 overflow-x-auto md:grid-cols-4 xl:grid-cols-8">
      {grouped.map((column) => (
        <div
          key={column.status}
          className="min-h-36 rounded-xl border border-line bg-soft p-3"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            const orderId = event.dataTransfer.getData("text/plain");
            if (orderId) moveOrder(orderId, column.status);
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-ink">{column.status}</p>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-muted">
              {column.orders.length}
            </span>
          </div>
          <div className="space-y-2">
            {column.orders.map((order) => (
              <button
                key={order.id}
                className="w-full cursor-grab rounded-lg bg-white p-3 text-left shadow-subtle active:cursor-grabbing"
                draggable
                onDragStart={(event) => event.dataTransfer.setData("text/plain", order.id)}
              >
                <p className="text-sm font-semibold text-ink">{order.product}</p>
                <p className="mt-1 text-xs text-muted">{order.deadline}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
