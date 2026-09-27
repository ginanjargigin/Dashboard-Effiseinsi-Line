import { supabase } from "./supabaseClient";

async function getExactCount(table) {
  const { count, error } = await supabase
    .from(table)
    .select("*", {
      count: "exact",
      head: true,
    });

  if (error) {
    throw new Error(
      `Gagal menghitung ${table}: ${error.message}`
    );
  }

  return count ?? 0;
}

async function getAllEntries() {
  const pageSize = 1000;
  let from = 0;
  let allRows = [];

  while (true) {
    const { data, error } = await supabase
      .from("production_entries")
      .select("pcs, menit")
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(
        `Gagal membaca production_entries: ${error.message}`
      );
    }

    allRows = allRows.concat(data ?? []);

    if (!data || data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return allRows;
}

async function getAllNgEntries() {
  const { data, error } = await supabase
    .from("production_ng_entries")
    .select("quantity");

  if (error) {
    throw new Error(
      `Gagal membaca production_ng_entries: ${error.message}`
    );
  }

  return data ?? [];
}

export async function testSupabaseConnection() {
  const [
    sheets,
    metrics,
    days,
    entriesCount,
    ngTypes,
    ngEntriesCount,
  ] = await Promise.all([
    getExactCount("production_sheets"),
    getExactCount("production_metrics"),
    getExactCount("production_days"),
    getExactCount("production_entries"),
    getExactCount("production_ng_types"),
    getExactCount("production_ng_entries"),
  ]);

  const entries = await getAllEntries();
  const ngEntries = await getAllNgEntries();

  const pcsSum = entries.reduce(
    (sum, row) => sum + Number(row.pcs || 0),
    0
  );

  const menitSum = entries.reduce(
    (sum, row) => sum + Number(row.menit || 0),
    0
  );

  const totalNg = ngEntries.reduce(
    (sum, row) => sum + Number(row.quantity || 0),
    0
  );

  const result = {
    sheets,
    metrics,
    days,
    entries: entriesCount,
    ngTypes,
    ngEntries: ngEntriesCount,
    pcsSum,
    menitSum,
    totalNg,
  };

  console.log("=== SUPABASE FULL READ TEST ===");
  console.table(result);

  return result;
}
