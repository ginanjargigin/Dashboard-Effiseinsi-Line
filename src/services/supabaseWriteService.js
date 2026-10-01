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
export async function deleteNgTypeFromSupabase(
  ngTypeId
) {
  const { data, error } = await supabase.rpc(
    "delete_production_ng_type",
    {
      p_ng_type_id: ngTypeId,
    }
  );

  if (error) {
    throw new Error(
      `Gagal menghapus NG characteristic: ${error.message}`
    );
  }

  return data;
}
