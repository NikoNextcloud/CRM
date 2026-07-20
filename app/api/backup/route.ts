import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { isAuthenticated } from "@/lib/auth";

const BACKUP_BUCKET = "backups";
const KEEP_BACKUPS = 12;

async function isAllowed(request: Request) {
  if (await isAuthenticated()) return true;
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const header = request.headers.get("authorization");
    if (header === `Bearer ${cronSecret}`) return true;
  }
  return false;
}

async function collectData(supabase: NonNullable<ReturnType<typeof createSupabaseAdmin>>) {
  const tables = ["customers", "orders", "timeline", "notifications", "notes", "calendar_notes"] as const;
  const backup: Record<string, unknown> = {
    created_at: new Date().toISOString(),
    app: "PrintPilot AI CRM"
  };
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*");
    backup[table] = error ? { error: error.message } : data ?? [];
  }
  return backup;
}

export async function GET(request: Request) {
  if (!(await isAllowed(request))) {
    return NextResponse.json({ error: "Не си влязъл в системата." }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase не е настроен." }, { status: 400 });
  }

  const backup = await collectData(supabase);
  const url = new URL(request.url);

  if (url.searchParams.get("download") === "1") {
    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="printpilot-backup-${new Date().toISOString().slice(0, 10)}.json"`
      }
    });
  }

  await supabase.storage.createBucket(BACKUP_BUCKET, { public: false }).catch(() => undefined);

  const fileName = `backup-${new Date().toISOString().slice(0, 10)}.json`;
  const { error: uploadError } = await supabase.storage
    .from(BACKUP_BUCKET)
    .upload(fileName, JSON.stringify(backup, null, 2), {
      contentType: "application/json",
      upsert: true
    });

  if (uploadError) {
    return NextResponse.json({ error: `Бекъпът не можа да се запише: ${uploadError.message}` }, { status: 500 });
  }

  const { data: files } = await supabase.storage.from(BACKUP_BUCKET).list("", { limit: 200 });
  if (files && files.length > KEEP_BACKUPS) {
    const sorted = files
      .filter((file) => file.name.startsWith("backup-"))
      .sort((a, b) => a.name.localeCompare(b.name));
    const toDelete = sorted.slice(0, Math.max(0, sorted.length - KEEP_BACKUPS)).map((file) => file.name);
    if (toDelete.length) {
      await supabase.storage.from(BACKUP_BUCKET).remove(toDelete).catch(() => undefined);
    }
  }

  return NextResponse.json({ ok: true, file: fileName, kept: KEEP_BACKUPS });
}
