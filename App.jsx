import {
  fetchDb,
  saveDb,
} from "./src/services/jsonbinService";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

import { C } from "./src/constants/appConstants";
import SheetTabs from "./src/components/layout/SheetTabs";
import MetricCard from "./src/components/input/MetricCard";
import InputView from "./src/components/input/InputView";
import SettingsView from "./src/components/settings/SettingsView";
import StatCard from "./src/components/dashboard/StatCard";
import TopBar from "./src/components/layout/TopBar";
import DashboardView from "./src/components/dashboard/DashboardView";


import {
  uid,
  pad2,
  todayISO,
  monthKeyOf,
  daysInMonth,
  monthLabel,
  clampInt,
  qtyStd,
  pctAct,
  statusColor,
} from "./src/utils/appUtils";

import { DEFAULT_SHEETS } from "./src/data/defaultSheets";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import {
  Plus, Trash2, Settings, LayoutDashboard, Keyboard, Printer, CalendarCheck, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Check, X, AlertTriangle, TrendingUp, TrendingDown, Calendar,FileSpreadsheet,
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

/* -------------------------------- global style -------------------------------- */
function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
      * { box-sizing: border-box; }
      body { margin:0; }
      input[type=date] { color-scheme: dark; }
      .num-field {
        font-family: 'IBM Plex Mono', monospace;
        font-variant-numeric: tabular-nums;
      }
      /* ATURAN BARU: Mengubah background menjadi hijau transparan 50% saat input dipilih */
      .num-field-input:focus {
      
        background-color: rgba(73, 185, 107, 0.5) !important;
        border-color: #49B96B !important;
      }
  .note-field:focus {
  border-color: #49B96B !important;
  background-color: rgba(73, 185, 107, 0.08) !important;
  box-shadow: 0 0 0 2px rgba(73, 185, 107, 0.18) !important;
}
      button:hover{
    transform:translateY(-2px);
    transition:.2s;
}

button:active{
    transform:scale(.96);
}
/* Scrollbar global */
::-webkit-scrollbar {
  height: 6px;
  width: 6px;
  background: transparent;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: ${C.line};
  border-radius: 6px;
}


/* =========================================
   SCROLLBAR KHUSUS KATEGORI / SHEET TABS
   ========================================= */

.sheet-tabs-scroll {
  scrollbar-width: thin;
  scrollbar-color: ${C.line} transparent;
}

/* Chrome / Edge / Safari */
.sheet-tabs-scroll::-webkit-scrollbar {
  height: 6px;
  background: transparent;
}

.sheet-tabs-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.sheet-tabs-scroll::-webkit-scrollbar-thumb {
  background: ${C.line};
  border-radius: 6px;
}

/* Saat pointer masuk ke area kategori */
.sheet-tabs-scroll:hover {
  scrollbar-width: auto;
  scrollbar-color: #777 transparent;
}

.sheet-tabs-scroll:hover::-webkit-scrollbar {
  height: 12px;
}

.sheet-tabs-scroll:hover::-webkit-scrollbar-track {
  background: transparent;
}

.sheet-tabs-scroll:hover::-webkit-scrollbar-thumb {
  background: #777;
  border-radius: 8px;
}

/* Saat pointer tepat di atas scrollbar */
.sheet-tabs-scroll::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
      @media print {
        .no-print { display: none !important; }
        body, .print-area { background: #fff !important; color: #111 !important; }
        .print-area * { color: #111 !important; }
        .print-card { border: 1px solid #ccc !important; background: #fff !important; }
      }
    `}</style>
  );
}



