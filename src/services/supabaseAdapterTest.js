import { initializeDbFromSupabase } from "./supabaseService";

function analyzeLegacyDb(db) {
  let metricCount = 0;
  let dayCount = 0;
  let entryCount = 0;
  let noteCount = 0;
  let ngEntryCount = 0;
  let pcsSum = 0;
  let menitSum = 0;
  let totalNg = 0;

  for (const sheet of db.sheets ?? []) {
    metricCount += sheet.metrics?.length ?? 0;
  }

  for (const [monthKey, monthObj] of Object.entries(
    db.months ?? {}
  )) {
    for (const [sheetId, sheetDates] of Object.entries(
      monthObj ?? {}
    )) {
      for (const [date, dayObj] of Object.entries(
        sheetDates ?? {}
      )) {
        dayCount++;

        if (dayObj?.note) {
          noteCount++;
        }

        if (dayObj?.ng) {
          for (const quantity of Object.values(dayObj.ng)) {
            ngEntryCount++;
            totalNg += Number(quantity || 0);
          }
        }

        for (const [key, value] of Object.entries(dayObj ?? {})) {
          if (key === "note" || key === "ng") {
            continue;
          }

          if (!value || typeof value !== "object") {
            continue;
          }

          if (
            Object.prototype.hasOwnProperty.call(value, "pcs") ||
            Object.prototype.hasOwnProperty.call(value, "menit")
          ) {
            entryCount++;

            pcsSum += Number(value.pcs || 0);
            menitSum += Number(value.menit || 0);
          }
        }
      }
    }
  }

  return {
    sheets: db.sheets?.length ?? 0,
    metrics: metricCount,
    days: dayCount,
    entries: entryCount,
    notes: noteCount,
    ngTypes: db.sheets.reduce(
      (sum, sheet) => sum + (sheet.ngTypes?.length ?? 0),
      0
    ),
    ngEntries: ngEntryCount,
    pcsSum,
    menitSum,
    totalNg,
    months: Object.keys(db.months ?? {}).length,
  };
}

export async function testSupabaseAdapter() {
  const db = await initializeDbFromSupabase();

  const result = analyzeLegacyDb(db);

  console.log("=== SUPABASE ADAPTER TEST ===");
  console.table(result);

  return {
    db,
    result,
  };
}
