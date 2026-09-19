import { fetchDb, saveDb } from "./jsonbinService";
import { DEFAULT_SHEETS } from "../data/defaultSheets";
import { migrateDbForNg } from "../utils/ngUtils";

export async function initializeDb() {
  let remote = await fetchDb();

  if (!remote || !remote.sheets || remote.sheets.length === 0) {
    remote = {
      sheets: DEFAULT_SHEETS,
      months: {},
    };

    await saveDb(remote);
  }

  if (!remote.months) {
    remote.months = {};
  }
const migration = migrateDbForNg(remote);

if (migration.changed) {
  remote = migration.db;
  await saveDb(remote);
}
  return remote;
}
