import { uid } from "./appUtils";

export function createSheet(name) {
  return {
    id: uid(),
    name,
    metrics: [
      {
        id: uid(),
        name: "Std",
        ct: 10,
      },
    ],
  };
}

export function addSheetToDb(db, sheet) {
  return {
    ...db,
    sheets: [...db.sheets, sheet],
  };
}

export function removeSheetFromDb(db, sheetId) {
  return {
    ...db,
    sheets: db.sheets.filter((s) => s.id !== sheetId),
  };
}

export function updateSheetNameInDb(db, sheetId, name) {
  return {
    ...db,
    sheets: db.sheets.map((s) =>
      s.id === sheetId ? { ...s, name } : s
    ),
  };
}

export function addMetricToDb(db, sheetId) {
  return {
    ...db,
    sheets: db.sheets.map((s) =>
      s.id === sheetId
        ? {
            ...s,
            metrics: [
              ...s.metrics,
              {
                id: uid(),
                name: "Baru",
                ct: 10,
              },
            ],
          }
        : s
    ),
  };
}

export function updateMetricInDb(
  db,
  sheetId,
  metricId,
  field,
  value
) {
  return {
    ...db,
    sheets: db.sheets.map((s) => {
      if (s.id !== sheetId) return s;

      return {
        ...s,
        metrics: s.metrics.map((m) =>
          m.id === metricId
            ? {
                ...m,
                [field]:
                  field === "ct"
                    ? Number(value) || 0
                    : value,
              }
            : m
        ),
      };
    }),
  };
}

export function removeMetricFromDb(db, sheetId, metricId) {
  return {
    ...db,
    sheets: db.sheets.map((s) =>
      s.id === sheetId
        ? {
            ...s,
            metrics: s.metrics.filter(
              (m) => m.id !== metricId
            ),
          }
        : s
    ),
  };
}

export function moveSheetInDb(db, sheetId, direction) {
  const arr = [...db.sheets];
  const idx = arr.findIndex((s) => s.id === sheetId);
  const swapWith = idx + direction;

  if (
    idx === -1 ||
    swapWith < 0 ||
    swapWith >= arr.length
  ) {
    return db;
  }

  [arr[idx], arr[swapWith]] = [
    arr[swapWith],
    arr[idx],
  ];

  return {
    ...db,
    sheets: arr,
  };
}
