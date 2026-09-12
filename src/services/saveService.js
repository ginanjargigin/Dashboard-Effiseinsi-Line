export function createSaveScheduler({
  saveDb,
  setSaveState,
  delay = 600,
}) {
  let timer = null;

  return {
    schedule(nextDb) {
      setSaveState("saving");

      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(async () => {
        try {
          await saveDb(nextDb);
          setSaveState("saved");
        } catch {
          setSaveState("error");
        }

        setTimeout(() => {
          setSaveState("idle");
        }, 1500);
      }, delay);
    },

    cancel() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}
