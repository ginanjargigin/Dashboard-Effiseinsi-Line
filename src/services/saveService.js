export function createSaveScheduler({
  saveDb,
  setSaveState,
  delay = 600,
}) {
  let timer = null;
  let pendingDb = null;
  let saving = false;

  const runSave = async (db) => {
    saving = true;

    try {
      await saveDb(db);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    } finally {
      saving = false;

      /*
       * Jika ada perubahan baru saat proses save berlangsung,
       * jalankan hanya snapshot terbaru.
       */
      if (pendingDb) {
        const nextDb = pendingDb;
        pendingDb = null;

        await runSave(nextDb);
        return;
      }

      setTimeout(() => {
        setSaveState("idle");
      }, 1500);
    }
  };

  return {
    schedule(nextDb) {
      setSaveState("saving");

      /*
       * Selalu simpan snapshot terbaru.
       * Snapshot lama tidak perlu dikirim lagi.
       */
      pendingDb = nextDb;

      if (saving) {
        return;
      }

      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        timer = null;

        const dbToSave = pendingDb;
        pendingDb = null;

        if (!dbToSave) return;

        runSave(dbToSave);
      }, delay);
    },

    cancel() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      pendingDb = null;
    },
  };
}
