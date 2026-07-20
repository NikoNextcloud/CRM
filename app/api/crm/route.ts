import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
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
        viber?: string;
        whatsapp?: string;
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
      action: "deleteOrder";
      id: string;
    }
  | {
      action: "createNote";
      payload: {
        customer_id: string;
        order_id?: string;
        body: string;
      };
    }
  | {
      action: "updateNote";
      id: string;
      payload: {
        body: string;
      };
    }
  | {
      action: "deleteNote";
      id: string;
    }
  | {
      action: "createCalendarNote";
      payload: {
        customer_id?: string | null;
        order_id?: string | null;
        title: string;
        body?: string;
        start_date: string;
        end_date: string;
      };
    }
  | {
      action: "updateCalendarNote";
      id: string;
      payload: {
        customer_id?: string | null;
        order_id?: string | null;
        title: string;
        body?: string;
        start_date: string;
        end_date: string;
      };
    }
  | {
      action: "deleteCalendarNote";
      id: string;
    }
  | {
      action: "createReminder";
      payload: {
        customer_id?: string | null;
        order_id?: string | null;
        title: string;
        description?: string;
        due_at: string;
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
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Не си влязъл в системата." }, { status: 401 });
  }

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
        notes: [],
        calendar_notes: []
      },
      { status: 200 }
    );
  }

  const [customers, orders, files, timeline, notifications, notes, calendarNotes] = await Promise.all([
    supabase.from("customers").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("files").select("*").order("created_at", { ascending: false }),
    supabase.from("timeline").select("*").order("event_at", { ascending: false }),
    supabase.from("notifications").select("*").order("created_at", { ascending: false }),
    supabase.from("notes").select("*").order("created_at", { ascending: false }),
    supabase.from("calendar_notes").select("*").order("start_date", { ascending: true })
  ]);

  const calendarTableMissing = calendarNotes.error?.message.toLowerCase().includes("calendar_notes");
  const error = customers.error || orders.error || files.error || timeline.error || notifications.error || notes.error || (calendarTableMissing ? null : calendarNotes.error);
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
    notes: notes.data ?? [],
    calendar_notes: calendarTableMissing ? [] : calendarNotes.data ?? []
  });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Не си влязъл в системата." }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase не е настроен. Първо добави променливите на средата." },
      { status: 400 }
    );
  }

  const body = (await request.json()) as CrmAction;

  if (body.action === "createCustomer") {
    let { data, error } = await supabase
      .from("customers")
      .insert({
        ...body.payload,
        last_contact_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error && (error.message.toLowerCase().includes("viber") || error.message.toLowerCase().includes("whatsapp"))) {
      const { viber, whatsapp, ...fallbackPayload } = body.payload;
      const retry = await supabase
        .from("customers")
        .insert({
          ...fallbackPayload,
          last_contact_at: new Date().toISOString()
        })
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

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
    let { data, error } = await supabase
      .from("customers")
      .update({ ...body.payload, last_contact_at: new Date().toISOString() })
      .eq("id", body.id)
      .select()
      .single();

    if (error && (error.message.toLowerCase().includes("viber") || error.message.toLowerCase().includes("whatsapp"))) {
      const { viber, whatsapp, ...fallbackPayload } = body.payload;
      const retry = await supabase
        .from("customers")
        .update({ ...fallbackPayload, last_contact_at: new Date().toISOString() })
        .eq("id", body.id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (body.action === "createOrder") {
    const orderNumber = `PP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const productName = body.payload.product || "Обща поръчка";
    let orderInsert: Record<string, unknown> = {
      ...body.payload,
      product: productName,
      order_number: orderNumber,
      status: body.payload.status || "New"
    };

    let { data, error } = await supabase
      .from("orders")
      .insert(orderInsert)
      .select()
      .single();

    if (error && error.message.toLowerCase().includes("product")) {
      const { product, ...fallbackInsert } = orderInsert;
      orderInsert = {
        ...fallbackInsert,
        description: `${productName}${body.payload.description ? ` - ${body.payload.description}` : ""}`
      };
      const retry = await supabase.from("orders").insert(orderInsert).select().single();
      data = retry.data;
      error = retry.error;
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("timeline").insert({
      customer_id: data.customer_id,
      order_id: data.id,
      event_type: "order",
      title: "Поръчката е създадена",
      description: `${data.order_number} беше създадена за ${data.product || productName}.`
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

  if (body.action === "deleteOrder") {
    const { error } = await supabase.from("orders").delete().eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: { id: body.id } });
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

  if (body.action === "updateNote") {
    const { data, error } = await supabase.from("notes").update(body.payload).eq("id", body.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (body.action === "deleteNote") {
    const { error } = await supabase.from("notes").delete().eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: { id: body.id } });
  }

  if (body.action === "createCalendarNote") {
    const { data, error } = await supabase.from("calendar_notes").insert(body.payload).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (body.payload.customer_id) {
      await supabase.from("timeline").insert({
        customer_id: body.payload.customer_id,
        order_id: body.payload.order_id || null,
        event_type: "note",
        title: "Добавена календарна бележка",
        description: `${body.payload.title} (${body.payload.start_date} - ${body.payload.end_date})`
      });
    }

    return NextResponse.json({ data });
  }

  if (body.action === "updateCalendarNote") {
    const { data, error } = await supabase.from("calendar_notes").update(body.payload).eq("id", body.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (body.action === "deleteCalendarNote") {
    const { error } = await supabase.from("calendar_notes").delete().eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: { id: body.id } });
  }

  if (body.action === "createReminder") {
    const { data, error } = await supabase.from("notifications").insert({
      ...body.payload,
      is_read: false
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (body.payload.customer_id) {
      await supabase.from("timeline").insert({
        customer_id: body.payload.customer_id,
        order_id: body.payload.order_id || null,
        event_type: "note",
        title: "Добавено напомняне",
        description: `${body.payload.title} - ${body.payload.description || ""}`
      });
    }

    return NextResponse.json({ data });
  }

  return NextResponse.json({ error: "Непознато CRM действие." }, { status: 400 });
}
