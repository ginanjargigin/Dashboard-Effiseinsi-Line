import {
  fetchDb,
  saveDb,
} from "./src/services/jsonbinService";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import { C } from "./src/constants/appConstants";
import SheetTabs from "./src/components/layout/SheetTabs";
import InputView from "./src/components/input/InputView";
import SettingsView from "./src/components/settings/SettingsView";
import TopBar from "./src/components/layout/TopBar";
import DashboardView from "./src/components/dashboard/DashboardView";
import GlobalStyle from "./src/components/layout/GlobalStyle";


import {
  uid,
  todayISO,
  monthKeyOf,
  clampInt,
  qtyStd,
  pctAct,
} from "./src/utils/appUtils";

import { DEFAULT_SHEETS } from "./src/data/defaultSheets";

import {
  AlertTriangle,
} from "lucide-react";



/* ----------------------------------- App ------------------------------------- */
export default function App() {
  const [db, setDb] = useState(null);
  const [sheetId, setSheetId] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [view, setView] = useState("input");
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveState, setSaveState] = useState("idle");
  const saveTimer = useRef(null);
  const mk = monthKeyOf(date);

   useEffect(() => {
    (async () => {
      try {
        let remote = await fetchDb();

        if (!remote || !remote.sheets || remote.sheets.length === 0) {
          remote = { sheets: DEFAULT_SHEETS, months: {} };
          await saveDb(remote);
        }

        if (!remote.months) remote.months = {};

        setDb(remote);
        setSheetId(remote.sheets[0].id);
        setReady(true);

      } catch (e) {
        console.error("JSONBin connection error:", e);

        let message =
          "Tidak dapat terhubung ke server JSONBin. Periksa koneksi internet.";

        if (e?.type === "ACCESS_KEY_INVALID") {
          message =
            "Access Key JSONBin tidak valid. Periksa Access Key yang digunakan aplikasi.";
        } else if (e?.type === "ACCESS_DENIED") {
          message =
            "Akses ke Bin JSONBin ditolak. Periksa izin Access Key.";
        } else if (e?.type === "BIN_NOT_FOUND") {
          message =
            "Bin JSONBin tidak ditemukan. Periksa Bin ID.";
        } else if (e?.type === "RATE_LIMIT") {
          message =
            "Terlalu banyak permintaan ke JSONBin. Silakan coba lagi beberapa saat.";
        } else if (e?.type === "SERVER_ERROR") {
          message =
            `JSONBin sedang mengalami gangguan (HTTP ${e.status}). Data kamu tidak hilang. Silakan coba lagi beberapa saat.`;
        } else if (e?.type === "INVALID_RESPONSE") {
          message =
            "JSONBin memberikan respons yang tidak valid. Silakan coba lagi.";
        }

        setLoadError(message);
        setReady(true);
      }
    })();
  }, []);

  const scheduleSave = useCallback((nextDb) => {
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveDb(nextDb);
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
      setTimeout(() => setSaveState("idle"), 1500);
    }, 600);
  }, []);

  const exportDbCsv = () => {
  if (!db) {
    alert("Data belum tersedia");
    return;
  }

  const months = db.months || {};
  const rows = [];

  rows.push([
    "sheetId",
    "sheetName",
    "date",
    "metricId",
    "metricName",
    "ct_s",
    "pcs",
    "menit",
    "std_pcs",
    "pct_act",
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

            sheet.metrics.forEach((m) => {
              const value = day[m.id] || {};

              const pcs = value.pcs || "";
              const menit = value.menit || "";

              const stdPcs = qtyStd(menit, m.ct);
              const pct = pctAct(pcs, stdPcs);

              rows.push([
                sheet.id,
                sheet.name,
                dateKey,
                m.id,
                m.name,
                m.ct,
                pcs,
                menit,
                stdPcs || "",
                pct === null ? "" : pct.toFixed(2),
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
  a.download = `efisiensi_export_${todayISO()}.csv`;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
};

const monthData = (db && db.months[mk]) || {};

const updateEntry = (sId, d, metricId, field, raw) => {
  const val = clampInt(raw);

  setDb((prev) => {
    const next = {
      ...prev,
      months: {
        ...prev.months,
      },
    };

    const monthObj = {
      ...(next.months[mk] || {}),
    };

    monthObj[sId] = {
      ...(monthObj[sId] || {}),
    };

    monthObj[sId][d] = {
      ...(monthObj[sId][d] || {}),
    };

    monthObj[sId][d][metricId] = {
      ...(monthObj[sId][d][metricId] || {}),
      [field]: val,
    };

    next.months[mk] = monthObj;

    scheduleSave(next);

    return next;
  });
};

const updateNote = (sId, d, note) => {
  setDb((prev) => {
    const next = {
      ...prev,
      months: {
        ...prev.months,
      },
    };

    const monthObj = {
      ...(next.months[mk] || {}),
    };

    monthObj[sId] = {
      ...(monthObj[sId] || {}),
    };

    const dayObj = {
      ...(monthObj[sId][d] || {}),
    };

    const trimmedNote = String(note ?? "");

    if (trimmedNote.trim() === "") {
      delete dayObj.note;
    } else {
      dayObj.note = trimmedNote;
    }

    if (Object.keys(dayObj).length === 0) {
      delete monthObj[sId][d];
    } else {
      monthObj[sId][d] = dayObj;
    }

    next.months[mk] = monthObj;

    scheduleSave(next);

    return next;
  });
};

const clearEntry = (sId, d) => {
  setDb((prev) => {
    const next = {
      ...prev,
      months: {
        ...prev.months,
      },
    };

    const monthObj = {
      ...(next.months[mk] || {}),
    };

    if (monthObj[sId]) {
      monthObj[sId] = {
        ...monthObj[sId],
      };

      delete monthObj[sId][d];
    }

    next.months[mk] = monthObj;

    scheduleSave(next);

    return next;
  });
};

  const addSheet = (name) => {
    const s = { id: uid(), name, metrics: [{ id: uid(), name: "Std", ct: 10 }] };
    setDb((prev) => {
      const next = { ...prev, sheets: [...prev.sheets, s] };
      scheduleSave(next);
      return next;
    });
    setSheetId(s.id);
  };
  const removeSheet = (sId) => {
    setDb((prev) => {
      const next = { ...prev, sheets: prev.sheets.filter((s) => s.id !== sId) };
      scheduleSave(next);
      if (sheetId === sId && next.sheets.length) setSheetId(next.sheets[0].id);
      return next;
    });
  };
  const updateSheetName = (sId, name) => {
    setDb((prev) => {
      const next = { ...prev, sheets: prev.sheets.map((s) => (s.id === sId ? { ...s, name } : s)) };
      scheduleSave(next);
      return next;
    });
  };
  const addMetric = (sId) => {
    setDb((prev) => {
      const next = {
        ...prev,
        sheets: prev.sheets.map((s) =>
          s.id === sId ? { ...s, metrics: [...s.metrics, { id: uid(), name: "Baru", ct: 10 }] } : s
        ),
      };
      scheduleSave(next);
      return next;
    });
  };
  const updateMetric = (sId, mId, field, value) => {
    setDb((prev) => {
      const next = {
        ...prev,
        sheets: prev.sheets.map((s) => {
          if (s.id !== sId) return s;
          return {
            ...s,
            metrics: s.metrics.map((m) => (m.id === mId ? { ...m, [field]: field === "ct" ? Number(value) || 0 : value } : m)),
          };
        }),
      };
      scheduleSave(next);
      return next;
    });
  };
  const removeMetric = (sId, mId) => {
    setDb((prev) => {
      const next = {
        ...prev,
        sheets: prev.sheets.map((s) => (s.id === sId ? { ...s, metrics: s.metrics.filter((m) => m.id !== mId) } : s)),
      };
      scheduleSave(next);
      return next;
    });
  };
  const moveSheet = (sId, direction) => {
    setDb((prev) => {
      const arr = [...prev.sheets];
      const idx = arr.findIndex((s) => s.id === sId);
      const swapWith = idx + direction;
      if (idx === -1 || swapWith < 0 || swapWith >= arr.length) return prev;
      [arr[idx], arr[swapWith]] = [arr[swapWith], arr[idx]];
      const next = { ...prev, sheets: arr };
      scheduleSave(next);
      return next;
    });
  };

  if (!ready || (!db && !loadError)) {
    return (
      <div style={{ background: C.bg, color: C.text, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
        Memuat papan efisiensi…
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ background: C.bg, color: C.text, height: "100vh", display: "flex", flexDirection: "column", gap: 10, alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", padding: 24, textAlign: "center" }}>
        <AlertTriangle color={C.bad} size={28} />
        <div>{loadError}</div>
      </div>
    );
  }

  const sheets = db.sheets;
  const currentSheet = sheets.find((s) => s.id === sheetId) || sheets[0];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'Inter', sans-serif", paddingBottom: 24 }}>
      <GlobalStyle />
      <TopBar view={view} setView={setView} saveState={saveState} />
  
      <SheetTabs sheets={sheets} sheetId={sheetId} setSheetId={setSheetId} />

      {view === "input" && (
        <InputView
          sheet={currentSheet}
          date={date}
          setDate={setDate}
          monthData={monthData}
          updateEntry={updateEntry}
          updateNote={updateNote}
          clearEntry={clearEntry}
        />
      )}
     {view === "dashboard" && (
  <DashboardView
    sheets={sheets}
    sheetId={sheetId}
    setSheetId={setSheetId}
    mk={mk}
    setDate={setDate}
    monthData={monthData}
    exportDbCsv={exportDbCsv}
  />
)}
      )}
      {view === "settings" && (
        <SettingsView
          sheets={sheets}
          addSheet={addSheet}
          removeSheet={removeSheet}
          updateSheetName={updateSheetName}
          addMetric={addMetric}
          updateMetric={updateMetric}
          removeMetric={removeMetric}
          moveSheet={moveSheet}
        />
      )}
    </div>
  );
}





