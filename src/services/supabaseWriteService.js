import { supabase } from "./supabaseClient";

async function upsertSheets(db) {
  const rows = (db.sheets || []).map((sheet) => ({
    id: sheet.id,
    name: sheet.name,
  }));

  if (!rows.length) return;

  const { error } = await supabase
    .from("production_sheets")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    throw new Error(`Gagal menyimpan sheets: ${error.message}`);
  }
}

async function upsertMetrics(db) {
  const rows = [];

  for (const sheet of db.sheets || []) {
    for (const metric of sheet.metrics || []) {
      rows.push({
        id: metric.id,
        sheet_id: sheet.id,
        name: metric.name,
        ct: Number(metric.ct) || 0,
      });
    }
  }

  if (!rows.length) return;

  const { error } = await supabase
    .from("production_metrics")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    throw new Error(`Gagal menyimpan metrics: ${error.message}`);
  }
}

export async function saveDbToSupabase(db) {
  await upsertSheets(db);
  await upsertMetrics(db);

  console.log("SUPABASE SHADOW WRITE: sheets + metrics OK");
}
