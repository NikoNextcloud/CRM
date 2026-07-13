import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase не е настроен. Първо добави променливите на средата." },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Липсва ID на файла." }, { status: 400 });
  }

  const file = await supabase.from("files").select("*").eq("id", id).single();
  if (file.error) {
    return NextResponse.json({ error: file.error.message }, { status: 404 });
  }

  const signed = await supabase.storage.from("order-files").createSignedUrl(file.data.storage_path, 60 * 10, {
    download: file.data.file_name
  });

  if (signed.error) {
    return NextResponse.json({ error: signed.error.message }, { status: 500 });
  }

  return NextResponse.json({ url: signed.data.signedUrl });
}

export async function POST(request: Request) {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase не е настроен. Първо добави променливите на средата." },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const customerId = formData.get("customer_id");
  const orderId = formData.get("order_id");

  if (!(file instanceof File) || typeof customerId !== "string" || typeof orderId !== "string") {
    return NextResponse.json({ error: "Липсва файл, customer_id или order_id." }, { status: 400 });
  }

  const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";
  const storagePath = `${customerId}/${orderId}/${Date.now()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const upload = await supabase.storage.from("order-files").upload(storagePath, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });

  if (upload.error) {
    return NextResponse.json({ error: upload.error.message }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("files")
    .insert({
      customer_id: customerId,
      order_id: orderId,
      file_name: file.name,
      file_type: extension,
      storage_path: storagePath,
      size_bytes: file.size
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("timeline").insert({
    customer_id: customerId,
    order_id: orderId,
    event_type: "file",
    title: "Файлът е качен",
    description: file.name
  });

  return NextResponse.json({ data });
}
