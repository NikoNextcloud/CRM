import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

type CrmAction =
  | {
      action: "createCustomer";
      payload: {
        first_name: string;
        last_name: string;
        company?: string;
        phone?: string;
        email?: string;
        address?: string;
        city?: string;
        vat_number?: string;
        notes?: string;
      };
    }
  | {
      action: "updateCustomer";
      id: string;
      payload: Record<string, unknown>;
    }
  | {
      action: "createOrder";
      payload: {
        customer_id: string;
        product: string;
        description?: string;
        quantity: number;
        price: number;
        cost: number;
        deadline_at?: string;
        status?: string;
      };
    }
  | {
      action: "updateOrder";
      id: string;
      payload: Record<string, unknown>;
    }
  | {
      action: "createNote";
      payload: {
        customer_id: string;
        order_id?: string;
        body: string;
      };
    };

const statusLabels: Record<string, string> = {
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

export async function GET() {
  const supabase = createSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json(
      {
        configured: false,
        customers: [],
        orders: [],
        files: [],
        timeline: [],
        notifications: [],
        notes: []
      },
      { status: 200 }
    );
  }

  const [customers, orders, files, timeline, notifications, notes] = await Promise.all([
    supabase.from("customers").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("files").select("*").order("created_at", { ascending: false }),
    supabase.from("timeline").select("*").order("event_at", { ascending: false }),
    supabase.from("notifications").select("*").order("created_at", { ascending: false }),
    supabase.from("notes").select("*").order("created_at", { ascending: false })
  ]);

  const error = customers.error || orders.error || files.error || timeline.error || notifications.error || notes.error;
  if (error) {
    return NextResponse.json({ configured: true, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    configured: true,
    customers: customers.data ?? [],
    orders: orders.data ?? [],
    files: files.data ?? [],
    timeline: timeline.data ?? [],
    notifications: notifications.data ?? [],
    notes: notes.data ?? []
  });
}

export async function POST(request: Request) {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase не е настроен. Първо добави променливите на средата." },
      { status: 400 }
    );
  }

  const body = (await request.json()) as CrmAction;

  if (body.action === "createCustomer") {
    const { data, error } = await supabase
      .from("customers")
      .insert({
        ...body.payload,
        last_contact_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("timeline").insert({
      customer_id: data.id,
      event_type: "note",
      title: "Клиентът е добавен",
      description: `${data.company || `${data.first_name} ${data.last_name}`} беше добавен в CRM системата.`
    });

    return NextResponse.json({ data });
  }

  if (body.action === "updateCustomer") {
    const { data, error } = await supabase
      .from("customers")
      .update({ ...body.payload, last_contact_at: new Date().toISOString() })
      .eq("id", body.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (body.action === "createOrder") {
    const orderNumber = `PP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const { data, error } = await supabase
      .from("orders")
      .insert({
        ...body.payload,
        order_number: orderNumber,
        status: body.payload.status || "New"
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("timeline").insert({
      customer_id: data.customer_id,
      order_id: data.id,
      event_type: "order",
      title: "Поръчката е създадена",
      description: `${data.order_number} беше създадена за ${data.product || "нова производствена работа"}.`
    });

    return NextResponse.json({ data });
  }

  if (body.action === "updateOrder") {
    const { data, error } = await supabase
      .from("orders")
      .update(body.payload)
      .eq("id", body.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("timeline").insert({
      customer_id: data.customer_id,
      order_id: data.id,
      event_type: "order",
      title: "Поръчката е обновена",
      description: `${data.order_number} беше преместена към статус ${statusLabels[data.status] || data.status}.`
    });

    return NextResponse.json({ data });
  }

  if (body.action === "createNote") {
    const { data, error } = await supabase.from("notes").insert(body.payload).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("timeline").insert({
      customer_id: body.payload.customer_id,
      order_id: body.payload.order_id || null,
      event_type: "note",
      title: "Добавена бележка",
      description: body.payload.body
    });

    return NextResponse.json({ data });
  }

  return NextResponse.json({ error: "Непознато CRM действие." }, { status: 400 });
}
