import { supabase } from "./supabaseClient";

const PAGE_SIZE = 1000;

async function fetchAll(table, columns = "*") {
  let from = 0;
  const rows = [];

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(
        `Gagal membaca ${table}: ${error.message}`
      );
    }

    const batch = data ?? [];
    rows.push(...batch);

    if (batch.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return rows;
}

/**
 * Membaca database Supabase dan membentuk kembali
 * struktur legacy aplikasi:
 *
 * {
 *   sheets: [],
 *   months: {}
 * }
 *
 * READ ONLY.
 */
export async function initializeDbFromSupabase() {
  const [
    sheetsRows,
    metricsRows,
    daysRows,
    entriesRows,
    ngTypesRows,
    ngEntriesRows,
  ] = await Promise.all([
    fetchAll(
      "production_sheets",
      "id, name"
    ),

    fetchAll(
      "production_metrics",
      "id, sheet_id, name, ct"
    ),

    fetchAll(
      "production_days",
      "id, sheet_id, tanggal, note"
    ),

    fetchAll(
      "production_entries",
      "day_id, metric_id, pcs, menit"
    ),

    fetchAll(
      "production_ng_types",
      "id, sheet_id, name"
    ),

    fetchAll(
      "production_ng_entries",
      "day_id, ng_type_id, quantity"
    ),
  ]);

  /*
   * --------------------------------------------------
   * 1. Bentuk sheets + metrics
   * --------------------------------------------------
   */

  const sheets = sheetsRows.map((sheet) => ({
    id: sheet.id,
    name: sheet.name,
    metrics: metricsRows
      .filter((metric) => metric.sheet_id === sheet.id)
      .map((metric) => ({
        id: metric.id,
        name: metric.name,
        ct: Number(metric.ct),
      })),
    ngTypes: ngTypesRows
      .filter((ngType) => ngType.sheet_id === sheet.id)
      .map((ngType) => ({
        id: ngType.id,
        name: ngType.name,
      })),
  }));

  /*
   * --------------------------------------------------
   * 2. Index production days
   * --------------------------------------------------
   */

  const daysById = new Map();

  for (const day of daysRows) {
    daysById.set(day.id, day);
  }

  /*
   * --------------------------------------------------
   * 3. Bentuk months
   * --------------------------------------------------
   */

  const months = {};

  for (const day of daysRows) {
    const date = day.tanggal;

    if (!date) continue;

    const mk = date.slice(0, 7);

    if (!months[mk]) {
      months[mk] = {};
    }

    if (!months[mk][day.sheet_id]) {
      months[mk][day.sheet_id] = {};
    }

    const dayObj = {};

    if (day.note !== null && day.note !== "") {
      dayObj.note = day.note;
    }

    months[mk][day.sheet_id][date] = dayObj;
  }

  /*
   * --------------------------------------------------
   * 4. Masukkan production entries
   * --------------------------------------------------
   */

  for (const entry of entriesRows) {
    const day = daysById.get(entry.day_id);

    if (!day || !day.tanggal) continue;

    const mk = day.tanggal.slice(0, 7);

    if (!months[mk]) {
      months[mk] = {};
    }

    if (!months[mk][day.sheet_id]) {
      months[mk][day.sheet_id] = {};
    }

    if (!months[mk][day.sheet_id][day.tanggal]) {
      months[mk][day.sheet_id][day.tanggal] = {};
    }

    months[mk][day.sheet_id][day.tanggal][entry.metric_id] = {
      pcs: Number(entry.pcs ?? 0),
      menit: Number(entry.menit ?? 0),
    };
  }

  /*
   * --------------------------------------------------
   * 5. Masukkan NG entries
   * --------------------------------------------------
   */

  for (const entry of ngEntriesRows) {
    const day = daysById.get(entry.day_id);

    if (!day || !day.tanggal) continue;

    const mk = day.tanggal.slice(0, 7);

    if (!months[mk]) {
      months[mk] = {};
    }

    if (!months[mk][day.sheet_id]) {
      months[mk][day.sheet_id] = {};
    }

    if (!months[mk][day.sheet_id][day.tanggal]) {
      months[mk][day.sheet_id][day.tanggal] = {};
    }

    const dayObj =
      months[mk][day.sheet_id][day.tanggal];

    if (!dayObj.ng) {
      dayObj.ng = {};
    }

    const quantity = Number(entry.quantity ?? 0);

    if (quantity > 0) {
      dayObj.ng[entry.ng_type_id] = quantity;
    }
  }

  /*
   * --------------------------------------------------
   * 6. Hasil akhir
   * --------------------------------------------------
   */

  const db = {
    sheets,
    months,
  };

  console.log("=== SUPABASE ADAPTER READ ===");
  console.log("Sheets:", sheets.length);
  console.log(
    "Metrics:",
    sheets.reduce(
      (sum, sheet) => sum + sheet.metrics.length,
      0
    )
  );
  console.log(
    "NG Types:",
    sheets.reduce(
      (sum, sheet) => sum + sheet.ngTypes.length,
      0
    )
  );
  console.log(
    "Months:",
    Object.keys(months).length
  );

  return db;
}
