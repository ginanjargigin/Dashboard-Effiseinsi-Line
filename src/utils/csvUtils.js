import { qtyStd, pctAct } from "./appUtils";

export function exportDbCsv(db, today) {
  if (!db) {
    alert("Data belum tersedia");
    return;
  }

  const months = db.months || {};
  const rows = [];

  rows.push([
    "sheetName",
    "date",
    "metricName",
    "ct_s",
    "pcs",
    "menit",
    "std_pcs",
    "pct_act",
    "note",
  ]);

  db.sheets.forEach((sheet) => {
    Object.keys(months)
      .sort()
      .forEach((monthKey) => {
        const monthObj = months[monthKey] || {};
        const sheetObj = monthObj[sheet.id] || {};

        Object.keys(sheetObj)
          .sort()
          .forEach((dateKey) => {
            const day = sheetObj[dateKey] || {};
            const note = day.note || "";

            sheet.metrics.forEach((m) => {
              const value = day[m.id] || {};

              const pcs = value.pcs || "";
              const menit = value.menit || "";

              const stdPcs = qtyStd(menit, m.ct);
              const pct = pctAct(pcs, stdPcs);

              rows.push([
                sheet.name,
                dateKey,
                m.name,
                m.ct,
                pcs,
                menit,
                stdPcs || "",
                pct === null ? "" : pct.toFixed(2),
                note,
              ]);
            });
          });
      });
  });

  const csv = rows
    .map((cols) =>
      cols
        .map((field) => {
          if (field === null || field === undefined) return "";

          const s = String(field);

          if (
            s.includes('"') ||
            s.includes(",") ||
            s.includes("\n")
          ) {
            return `"${s.replace(/"/g, '""')}"`;
          }

          return s;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob(
    ["\ufeff", csv],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `efisiensi_export_${today}.csv`;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
