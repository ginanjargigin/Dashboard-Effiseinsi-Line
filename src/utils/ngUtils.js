import { uid } from "./appUtils";

export const NG_TARGET_RATE = 0.02;

export function createNgType(name) {
  return {
    id: uid(),
    name: String(name ?? "").trim(),
  };
}

export function addNgTypeToDb(db, sheetId, name) {
  const trimmed = String(name ?? "").trim();

  if (!trimmed) return db;

  return {
    ...db,
    sheets: db.sheets.map((sheet) => {
      if (sheet.id !== sheetId) return sheet;

      const ngTypes = Array.isArray(sheet.ngTypes)
        ? sheet.ngTypes
        : [];

      const duplicate = ngTypes.some(
        (item) =>
          item.name.trim().toLowerCase() ===
          trimmed.toLowerCase()
      );

      if (duplicate) return sheet;

      return {
        ...sheet,
        ngTypes: [
          ...ngTypes,
          createNgType(trimmed),
        ],
      };
    }),
  };
}

export function updateNgTypeInDb(
  db,
  sheetId,
  ngTypeId,
  name
) {
  const trimmed = String(name ?? "").trim();

  return {
    ...db,
    sheets: db.sheets.map((sheet) => {
      if (sheet.id !== sheetId) return sheet;

      const ngTypes = Array.isArray(sheet.ngTypes)
        ? sheet.ngTypes
        : [];

      return {
        ...sheet,
        ngTypes: ngTypes.map((item) =>
          item.id === ngTypeId
            ? {
                ...item,
                name: trimmed,
              }
            : item
        ),
      };
    }),
  };
}

export function removeNgTypeFromDb(
  db,
  sheetId,
  ngTypeId
) {
  return {
    ...db,
    sheets: db.sheets.map((sheet) => {
      if (sheet.id !== sheetId) return sheet;

      const ngTypes = Array.isArray(sheet.ngTypes)
        ? sheet.ngTypes
        : [];

      return {
        ...sheet,
        ngTypes: ngTypes.filter(
          (item) => item.id !== ngTypeId
        ),
      };
    }),
  };
}

/*
 * Migration database lama.
 *
 * Jika line lama belum mempunyai ngTypes,
 * tambahkan ngTypes: [] tanpa mengubah
 * data production yang sudah ada.
 */
export function migrateDbForNg(db) {
  if (!db || !Array.isArray(db.sheets)) {
    return {
      db,
      changed: false,
    };
  }

  let changed = false;

  const sheets = db.sheets.map((sheet) => {
    if (Array.isArray(sheet.ngTypes)) {
      return sheet;
    }

    changed = true;

    return {
      ...sheet,
      ngTypes: [],
    };
  });

  return {
    db: changed
      ? {
          ...db,
          sheets,
        }
      : db,
    changed,
  };
}
