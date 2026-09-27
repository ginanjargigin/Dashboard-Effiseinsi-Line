import { supabase } from "./supabaseClient";

const CHUNK_SIZE = 500;

async function upsertChunks(table, rows, onConflict) {
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);

    const { error } = await supabase
      .from(table)
      .upsert(chunk, {
        onConflict,
      });

    if (error) {
      throw new Error(
        `Gagal menyimpan ${table}: ${error.message}`
      );
    }
  }
}

function buildSheets(db) {
  return (db.sheets || []).map((sheet) => ({
    id: sheet.id,
    name: sheet.name,
  }));
}

function buildMetrics(db) {
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

  return rows;
}

function buildNgTypes(db) {
  const rows = [];

  for (const sheet of db.sheets || []) {
    for (const ngType of sheet.ngTypes || []) {
      rows.push({
        id: ngType.id,
        sheet_id: sheet.id,
        name: ngType.name,
      });
    }
  }

  return rows;
}

function buildDays(db) {
  const rows = [];

  for (const [monthKey, monthObj] of Object.entries(
    db.months || {}
  )) {
    for (const [sheetId, dates] of Object.entries(
      monthObj || {}
    )) {
      for (const [tanggal, dayObj] of Object.entries(
        dates || {}
      )) {
        rows.push({
          sheet_id: sheetId,
          tanggal,
          note: dayObj?.note || null,
        });
      }
    }
  }

  return rows;
}

export async function saveDbToSupabase(db) {
  /*
   * 1. Master sheets
   */
  const sheets = buildSheets(db);

  await upsertChunks(
    "production_sheets",
    sheets,
    "id"
  );

  /*
   * 2. Master metrics
   */
  const metrics = buildMetrics(db);

  await upsertChunks(
    "production_metrics",
    metrics,
    "id"
  );

  /*
   * 3. NG types
   */
  const ngTypes = buildNgTypes(db);

  await upsertChunks(
    "production_ng_types",
    ngTypes,
    "id"
  );

  /*
   * 4. Production days
   */
  const days = buildDays(db);

  await upsertChunks(
    "production_days",
    days,
    "sheet_id,tanggal"
  );

  /*
   * 5. Ambil kembali day_id
   *
   * production_days.id dibuat oleh PostgreSQL,
   * sedangkan struktur legacy db hanya mengenal
   * sheet_id + tanggal.
   */
  const { data: dayRows, error: dayError } =
    await supabase
      .from("production_days")
      .select("id, sheet_id, tanggal");

  if (dayError) {
    throw new Error(
      `Gagal membaca production_days: ${dayError.message}`
    );
  }

  const dayIdMap = new Map();

  for (const day of dayRows || []) {
    dayIdMap.set(
      `${day.sheet_id}|${day.tanggal}`,
      day.id
    );
  }

  /*
   * 6. Production entries
   */
  const entries = [];

  for (const [monthKey, monthObj] of Object.entries(
    db.months || {}
  )) {
    for (const [sheetId, dates] of Object.entries(
      monthObj || {}
    )) {
      for (const [tanggal, dayObj] of Object.entries(
        dates || {}
      )) {
        const dayId = dayIdMap.get(
          `${sheetId}|${tanggal}`
        );

        if (!dayId) continue;

        for (const [metricId, value] of Object.entries(
          dayObj || {}
        )) {
          if (
            metricId === "note" ||
            metricId === "ng"
          ) {
            continue;
          }

          if (
            !value ||
            typeof value !== "object"
          ) {
            continue;
          }

          if (
            !Object.prototype.hasOwnProperty.call(
              value,
              "pcs"
            ) &&
            !Object.prototype.hasOwnProperty.call(
              value,
              "menit"
            )
          ) {
            continue;
          }

          entries.push({
            day_id: dayId,
            metric_id: metricId,
            pcs: Number(value.pcs || 0),
            menit: Number(value.menit || 0),
          });
        }
      }
    }
  }

  await upsertChunks(
    "production_entries",
    entries,
    "day_id,metric_id"
  );

  /*
   * 7. NG entries
   */
  const ngEntries = [];

  for (const [monthKey, monthObj] of Object.entries(
    db.months || {}
  )) {
    for (const [sheetId, dates] of Object.entries(
      monthObj || {}
    )) {
      for (const [tanggal, dayObj] of Object.entries(
        dates || {}
      )) {
        if (!dayObj?.ng) continue;

        const dayId = dayIdMap.get(
          `${sheetId}|${tanggal}`
        );

        if (!dayId) continue;

        for (const [ngTypeId, quantity] of Object.entries(
          dayObj.ng
        )) {
          ngEntries.push({
            day_id: dayId,
            ng_type_id: ngTypeId,
            quantity: Number(quantity || 0),
          });
        }
      }
    }
  }

  await upsertChunks(
    "production_ng_entries",
    ngEntries,
    "day_id,ng_type_id"
  );

  console.log(
    "=== SUPABASE FULL SHADOW WRITE ==="
  );

  console.log({
    sheets: sheets.length,
    metrics: metrics.length,
    ngTypes: ngTypes.length,
    days: days.length,
    entries: entries.length,
    ngEntries: ngEntries.length,
  });
}
