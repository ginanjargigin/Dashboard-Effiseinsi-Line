import { supabase } from "./supabaseClient";

export async function testSupabaseConnection() {
  const { data: sheets, error: sheetsError } = await supabase
    .from("production_sheets")
    .select("id, name")
    .order("name");

  if (sheetsError) {
    throw new Error(
      `Gagal membaca production_sheets: ${sheetsError.message}`
    );
  }

  const { data: metrics, error: metricsError } = await supabase
    .from("production_metrics")
    .select("id, sheet_id, name, ct")
    .order("sheet_id")
    .order("name");

  if (metricsError) {
    throw new Error(
      `Gagal membaca production_metrics: ${metricsError.message}`
    );
  }

  console.log("=== SUPABASE READ TEST ===");
  console.log("Sheets:", sheets?.length ?? 0);
  console.log("Metrics:", metrics?.length ?? 0);
  console.log("Sheets data:", sheets);
  console.log("Metrics data:", metrics);

  return {
    sheets: sheets ?? [],
    metrics: metrics ?? [],
  };
}
