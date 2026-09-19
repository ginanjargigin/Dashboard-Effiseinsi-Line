import { clampInt } from "./appUtils";

export function updateNgEntryInDb(
  db,
  mk,
  sheetId,
  date,
  ngTypeId,
  raw
) {
  const val = clampInt(raw);

  const next = {
    ...db,
    months: {
      ...db.months,
    },
  };

  const monthObj = {
    ...(next.months[mk] || {}),
  };

  monthObj[sheetId] = {
    ...(monthObj[sheetId] || {}),
  };

  monthObj[sheetId][date] = {
    ...(monthObj[sheetId][date] || {}),
  };

  const dayObj = monthObj[sheetId][date];

  const currentNg = {
    ...(dayObj.ng || {}),
  };

  if (val === 0) {
    delete currentNg[ngTypeId];
  } else {
    currentNg[ngTypeId] = val;
  }

  if (Object.keys(currentNg).length === 0) {
    delete dayObj.ng;
  } else {
    dayObj.ng = currentNg;
  }

  monthObj[sheetId][date] = dayObj;
  next.months[mk] = monthObj;

  return next;
}

export function updateNoteInDb(
  db,
  mk,
  sheetId,
  date,
  note
) {
  const next = {
    ...db,
    months: {
      ...db.months,
    },
  };

  const monthObj = {
    ...(next.months[mk] || {}),
  };

  monthObj[sheetId] = {
    ...(monthObj[sheetId] || {}),
  };

  const dayObj = {
    ...(monthObj[sheetId][date] || {}),
  };

  const trimmedNote = String(note ?? "");

  if (trimmedNote.trim() === "") {
    delete dayObj.note;
  } else {
    dayObj.note = trimmedNote;
  }

  if (Object.keys(dayObj).length === 0) {
    delete monthObj[sheetId][date];
  } else {
    monthObj[sheetId][date] = dayObj;
  }

  next.months[mk] = monthObj;

  return next;
}

export function clearEntryInDb(
  db,
  mk,
  sheetId,
  date
) {
  const next = {
    ...db,
    months: {
      ...db.months,
    },
  };

  const monthObj = {
    ...(next.months[mk] || {}),
  };

  if (monthObj[sheetId]) {
    monthObj[sheetId] = {
      ...monthObj[sheetId],
    };

    delete monthObj[sheetId][date];
  }

  next.months[mk] = monthObj;

  return next;
}
