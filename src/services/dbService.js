import { initializeDbFromSupabase } from "./supabaseService";

export async function initializeDb() {
  const remote = await initializeDbFromSupabase();

  if (!remote || !remote.sheets || remote.sheets.length === 0) {
    throw new Error(
      "Database Supabase kosong atau tidak memiliki production sheets."
    );
  }

  if (!remote.months) {
    remote.months = {};
  }

  return remote;
}
