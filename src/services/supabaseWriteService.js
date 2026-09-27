import { supabase } from "./supabaseClient";

export async function saveDbToSupabase(db) {
  const { data, error } = await supabase.rpc(
    "sync_production_snapshot",
    {
      p_db: db,
    }
  );

  if (error) {
    throw new Error(
      `Supabase sync gagal: ${error.message}`
    );
  }

  console.log(
    "SUPABASE RPC SYNC SUCCESS:",
    data
  );

  return data;
}
