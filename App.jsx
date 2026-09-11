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
import TopBar from "./src/components/layout/TopBar";


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



/* -------------------------------- dashboard view -------------------------------- */
function DashboardView({
  sheets,
  sheetId,
  setSheetId,
  mk,
  setDate,
  monthData,
  exportDbCsv,
}) {
  const sheet = sheets.find((s) => s.id === sheetId) || sheets[0];
  const dim = daysInMonth(mk);
  const sheetData = monthData[sheet.id] || {};

  const dailyRows = [];
  for (let d = 1; d <= dim; d++) {
    const iso = `${mk}-${pad2(d)}`;
    const dayEntry = sheetData[iso];
    if (!dayEntry) { 
      dailyRows.push({ day: d, iso, pcs: 0, menit: 0, pct: null, hasData: false }); 
      continue; 
    }
    
    let pcsSum = 0;
    let menitSum = 0;
    let pctList = [];
    
    sheet.metrics.forEach((m) => {
      const v = dayEntry[m.id];
      if (!v) return;
      pcsSum += Number(v.pcs) || 0;
      menitSum += Number(v.menit) || 0;
      const p = pctAct(v.pcs, qtyStd(v.menit, m.ct));
      if (p !== null) pctList.push(p);
    });
    
    const avg = pctList.length ? pctList.reduce((a, b) => a + b, 0) / pctList.length : null;
    dailyRows.push({ day: d, iso, pcs: pcsSum, menit: menitSum, pct: avg, hasData: true });
  }

  const withData = dailyRows.filter((r) => r.hasData);
  const totalPcs = withData.reduce((a, r) => a + r.pcs, 0);
  const totalMenitAll = withData.reduce((a, r) => a + r.menit, 0);
  const avgPct = withData.length ? withData.reduce((a, r) => a + (r.pct || 0), 0) / withData.length : null;
  const best = withData.length ? withData.reduce((a, r) => (r.pct > a.pct ? r : a)) : null;

  const chartData = dailyRows.map((r) => ({ 
    name: String(r.day), 
    pct: r.pct === null ? 0 : Math.round(r.pct)
  }));

  const monthOptions = useMemo(() => {
    const options = [];
    const current = new Date(mk + "-01T00:00:00");
    for (let i = -4; i <= 2; i++) {
      const d = new Date(current.getFullYear(), current.getMonth() + i, 1);
      const k = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
      options.push({ key: k, label: d.toLocaleDateString("id-ID", { month: "long", year: "numeric" }) });
    }
    return options;
  }, [mk]);

  return (
    <div className="print-area" style={{ padding: 20, maxWidth: 960, margin: "0 auto" }}>
      {/* Kontrol Navigasi Atas */}
      <div className="no-print" style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <select
          value={sheetId}
          onChange={(e) => setSheetId(e.target.value)}
          style={{ background: C.panel, color: C.text, border: `1px solid ${C.line}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }}
        >
          {sheets.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <select
          value={mk}
          onChange={(e) => setDate(`${e.target.value}-01`)}
          style={{ background: C.panel, color: C.amber, border: `1px solid ${C.line}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 600, outline: "none" }}
        >
          {monthOptions.map((opt) => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
        </select>

        <div
    style={{
        marginLeft: "auto",
        display: "flex",
        gap: 10,
        width: "100%",
        justifyContent: "flex-end",
        flexWrap: "wrap",
    }}
>

<button
  onClick={exportDbCsv}
  style={{
    flex: 1,
    maxWidth: 180,
    background: "#16A34A",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  }}
>
  <FileSpreadsheet size={18} />
  <span>Export CSV</span>
</button>

<button
    onClick={() => window.print()}
    style={{
        flex:1,
        maxWidth:180,
        background:C.amber,
        color:"#1A1D20",
        border:"none",
        borderRadius:10,
        padding:"10px 16px",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        gap:8,
        cursor:"pointer",
        fontWeight:700,
        fontSize:14,
    }}
>

<Printer size={18}/>

Cetak

</button>

</div>
      </div>

      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 24, marginBottom: 4 }}>
        {sheet.name}
      </div>
      <div style={{ color: C.muted, fontSize: 13, marginBottom: 18 }}>{monthLabel(mk)} · Rekapitulasi Data harian</div>

      {/* 1. TABEL DETAIL: (Tgl, %ACT, Total Menit, Total PCS) */}
      <div className="print-card" style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.panel2, textAlign: "left" }}>
              <th style={dashTh}>Tgl</th>
              <th style={dashTh}>%ACT</th>
              <th style={dashTh}>Total Menit</th>
              <th style={dashTh}>Total PCS</th>
            </tr>
          </thead>
          <tbody>
            {dailyRows.map((r) => (
              <tr key={r.iso} onClick={() => setDate(r.iso)} style={{ borderTop: `1px solid ${C.line}`, cursor: "pointer" }} className="no-print-hover">
                <td style={dashTd}>{r.day}</td>
                <td style={{ ...dashTd, color: statusColor(r.pct), fontWeight: 600 }} className="num-field">
                  {r.pct === null ? "–" : `${r.pct.toFixed(0)}%`}
                </td>
                <td className="num-field" style={{ ...dashTd, color: r.hasData ? C.steel : C.muted, fontWeight: 600 }}>{r.hasData ? `${r.menit} m` : "–"}</td>
                <td className="num-field" style={{ ...dashTd, color: C.muted }}>{r.hasData ? r.pcs.toLocaleString("id-ID") : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr style={{ border: "none", borderBottom: `1px dashed ${C.line}`, marginBottom: 24 }} className="no-print" />

      {/* 2. KARTU RINGKASAN STATISTIK */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 10, marginBottom: 22 }}>
        <StatCard label="Total PCS" value={totalPcs.toLocaleString("id-ID")} />
        <StatCard label="Total Menit" value={`${totalMenitAll.toLocaleString("id-ID")} m`} color={C.steel} />
        <StatCard label="Rata-rata %ACT" value={avgPct === null ? "—" : `${avgPct.toFixed(1)}%`} color={statusColor(avgPct)} />
        <StatCard label="Hari terbaik" value={best ? `Tgl ${best.day} · ${best.pct.toFixed(0)}%` : "—"} icon={TrendingUp} color={C.good} />
      </div>

      {/* 3. GRAFIK TREN: Hanya menampilkan persentase efisiensi saja */}
      <div className="print-card" style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "16px 10px", height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 10 }} axisLine={{ stroke: C.line }} tickLine={false} />
            <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 120]} />
            <Tooltip 
              contentStyle={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, fontSize: 12 }} 
              labelFormatter={(l) => `Tanggal ${l}`} 
              formatter={(v) => [`${v}%`, "%ACT"]} 
            />
            <ReferenceLine y={100} stroke={C.muted} strokeDasharray="4 4" />
            <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
              {chartData.map((d, i) => <Cell key={i} fill={statusColor(d.pct || null)} opacity={d.pct ? 1 : 0.15} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const dashTh = { padding: "9px 14px", fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 };
const dashTd = { padding: "8px 14px" };

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="print-card" style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 10.5, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
        {Icon && <Icon size={12} />} {label}
      </div>
      <div className="num-field" style={{ fontSize: 18, fontWeight: 700, color: color || C.text }}>{value}</div>
    </div>
  );
}
