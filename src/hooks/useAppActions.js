import {
  createSheet,
  addSheetToDb,
  removeSheetFromDb,
  updateSheetNameInDb,
  addMetricToDb,
  updateMetricInDb,
  removeMetricFromDb,
  moveSheetInDb,
} from "../utils/sheetUtils";

import {
  updateEntryInDb,
  updateNgEntryInDb,
  updateNoteInDb,
  clearEntryInDb,
} from "../utils/monthDataUtils";

import {
  addNgTypeToDb,
  updateNgTypeInDb,
  removeNgTypeFromDb,
} from "../utils/ngUtils";

export function useAppActions({
  setDb,
  setSheetId,
  sheetId,
  mk,
  scheduleSave,
}) {
  const addNgType = (sId, name) => {
    setDb((prev) => {
      const next = addNgTypeToDb(
        prev,
        sId,
        name
      );

      scheduleSave(next);

      return next;
    });
  };

  const updateNgType = (
    sId,
    ngTypeId,
    name
  ) => {
    setDb((prev) => {
      const next = updateNgTypeInDb(
        prev,
        sId,
        ngTypeId,
        name
      );

      scheduleSave(next);

      return next;
    });
  };

  const removeNgType = (
    sId,
    ngTypeId
  ) => {
    setDb((prev) => {
      const next = removeNgTypeFromDb(
        prev,
        sId,
        ngTypeId
      );

      scheduleSave(next);

      return next;
    });
  };

  const updateEntry = (
    sId,
    d,
    metricId,
    field,
    raw
  ) => {
    setDb((prev) => {
      const next = updateEntryInDb(
        prev,
        mk,
        sId,
        d,
        metricId,
        field,
        raw
      );

      scheduleSave(next);

      return next;
    });
  };

  const updateNgEntry = (
    sId,
    d,
    ngTypeId,
    raw
  ) => {
    setDb((prev) => {
      const next = updateNgEntryInDb(
        prev,
        mk,
        sId,
        d,
        ngTypeId,
        raw
      );

      scheduleSave(next);

      return next;
    });
  };

  const updateNote = (
    sId,
    d,
    note
  ) => {
    setDb((prev) => {
      const next = updateNoteInDb(
        prev,
        mk,
        sId,
        d,
        note
      );

      scheduleSave(next);

      return next;
    });
  };

  const clearEntry = (
    sId,
    d
  ) => {
    setDb((prev) => {
      const next = clearEntryInDb(
        prev,
        mk,
        sId,
        d
      );

      scheduleSave(next);

      return next;
    });
  };

  const addSheet = (name) => {
    const s = createSheet(name);

    setDb((prev) => {
      const next = addSheetToDb(
        prev,
        s
      );

      scheduleSave(next);

      return next;
    });

    setSheetId(s.id);
  };

  const removeSheet = (sId) => {
    setDb((prev) => {
      const next = removeSheetFromDb(
        prev,
        sId
      );

      scheduleSave(next);

      if (
        sheetId === sId &&
        next.sheets.length
      ) {
        setSheetId(
          next.sheets[0].id
        );
      }

      return next;
    });
  };

  const updateSheetName = (
    sId,
    name
  ) => {
    setDb((prev) => {
      const next = updateSheetNameInDb(
        prev,
        sId,
        name
      );

      scheduleSave(next);

      return next;
    });
  };

  const addMetric = (sId) => {
    setDb((prev) => {
      const next = addMetricToDb(
        prev,
        sId
      );

      scheduleSave(next);

      return next;
    });
  };

  const updateMetric = (
    sId,
    mId,
    field,
    value
  ) => {
    setDb((prev) => {
      const next = updateMetricInDb(
        prev,
        sId,
        mId,
        field,
        value
      );

      scheduleSave(next);

      return next;
    });
  };

  const removeMetric = (
    sId,
    mId
  ) => {
    setDb((prev) => {
      const next = removeMetricFromDb(
        prev,
        sId,
        mId
      );

      scheduleSave(next);

      return next;
    });
  };

  const moveSheet = (
    sId,
    direction
  ) => {
    setDb((prev) => {
      const next = moveSheetInDb(
        prev,
        sId,
        direction
      );

      scheduleSave(next);

      return next;
    });
  };

  return {
    updateEntry,
    updateNgEntry,
    updateNote,
    clearEntry,
    addSheet,
    removeSheet,
    updateSheetName,
    addMetric,
    updateMetric,
    removeMetric,
    moveSheet,
    addNgType,
    updateNgType,
    removeNgType,
  };
}
