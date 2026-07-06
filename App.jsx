import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import {
  Plus, Trash2, Settings, LayoutDashboard, Keyboard, Printer, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Check, X, AlertTriangle, TrendingUp, TrendingDown, Calendar,
} from "lucide-react";

/* ---------------------------------- tokens ---------------------------------- */
const C = {
  bg: "#1A1D20",
  panel: "#232729",
  panel2: "#2B3033",
  line: "#383E42",
  amber: "#F2A93B",
  steel: "#6C93B0",
  text: "#ECEEEF",
  muted: "#8C949A",
  good: "#49B96B",
  warn: "#F2A93B",
  bad: "#E5555C",
};

const uid = () => Math.random().toString(36).slice(2, 10);
const pad2 = (n) => String(n).padStart(2, "0");
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const monthKeyOf = (iso) => iso.slice(0, 7);
const daysInMonth = (yyyyMM) => {
  const [y, m] = yyyyMM.split("-").map(Number);
  return new Date(y, m, 0).getDate();
};
const monthLabel = (yyyyMM) => {
  const [y, m] = yyyyMM.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};
const clampInt = (raw) => {
  const digits = String(raw).replace(/[^0-9]/g, "");
  if (digits === "") return "";
  return String(parseInt(digits, 10));
};
const qtyStd = (menit, ct) => {
  const m = Number(menit) || 0;
  if (!ct || !m) return 0;
  return Math.round((m * 60) / ct);
};
const pctAct = (pcs, qs) => {
  const p = Number(pcs) || 0;
  if (!qs) return null;
  return (p / qs) * 100;
};
const statusColor = (pct) => {
  if (pct === null) return C.muted;
  if (pct >= 100) return C.good;
  if (pct >= 85) return C.warn;
  return C.bad;
};

/* ------------------------------ default sheets ------------------------------ */
const DEFAULT_SHEETS = [
  { id: uid(), name: "PSV 60", metrics: [{ id: uid(), name: "Std", ct: 13.4 }] },
  { id: uid(), name: "PSV Bintang 60", metrics: [{ id: uid(), name: "Std", ct: 13.4 }] },
  { id: uid(), name: "Ballguide Merah", metrics: [{ id: uid(), name: "Std", ct: 2.64 }] },
  { id: uid(), name: "Ballguide Putih", metrics: [{ id: uid(), name: "Std", ct: 2.64 }] },
  { id: uid(), name: "Reinforce Merah", metrics: [{ id: uid(), name: "Std", ct: 14.4 }] },
  { id: uid(), name: "Reinforce Putih", metrics: [{ id: uid(), name: "Std", ct: 14.4 }] },
  {
    id: uid(), name: "Machining Merah",
    metrics: [{ id: uid(), name: "LA", ct: 15 }, { id: uid(), name: "LA14", ct: 25.8 }, { id: uid(), name: "RT", ct: 13.8 }],
  },
  {
    id: uid(), name: "Machining Putih",
    metrics: [{ id: uid(), name: "LA", ct: 15 }, { id: uid(), name: "LA14", ct: 25.8 }, { id: uid(), name: "RT", ct: 13.8 }],
  },
  { id: uid(), name: "YTB Staking Ari", metrics: [{ id: uid(), name: "Std", ct: 49.2 }] },
  { id: uid(), name: "Passthrough 4L45W", metrics: [{ id: uid(), name: "Std", ct: 9.6 }] },
  { id: uid(), name: "Passthrough 4L45W Merah", metrics: [{ id: uid(), name: "Std", ct: 9.6 }] },
  { id: uid(), name: "T862", metrics: [{ id: uid(), name: "Std", ct: 18.72 }] },
  { id: uid(), name: "Lever Staking", metrics: [{ id: uid(), name: "Std", ct: 14.4 }] },
  { id: uid(), name: "TSAA", metrics: [{ id: uid(), name: "Std", ct: 96 }] },
  { id: uid(), name: "DO1N 1", metrics: [{ id: uid(), name: "Std", ct: 17.4 }] },
  { id: uid(), name: "DO1N 2", metrics: [{ id: uid(), name: "Std", ct: 17.4 }] },
];

/* --------------------------------- storage (JSONBin.io) ----------------------------------- */
const JSONBIN_BIN_ID = "6a45ea43da38895dfe201020";
const JSONBIN_ACCESS_KEY = "$2a$10$1tOHMs3rSfnEVLSA9DvzD.nks0s1wKhEXxkoNevO4CvViNr8j4Z7W";
const JSONBIN_BASE = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

async function fetchDb() {
  const res = await fetch(`${JSONBIN_BASE}/latest`, {
    headers: { "X-Access-Key": JSONBIN_ACCESS_KEY },
  });
  if (!res.ok) throw new Error(`JSONBin GET failed: ${res.status}`);
  const json = await res.json();
  return json.record || null;
}
async function saveDb(db) {
  const res = await fetch(JSONBIN_BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Access-Key": JSONBIN_ACCESS_KEY },
    body: JSON.stringify(db),
  });
  if (!res.ok) throw new Error(`JSONBin PUT failed: ${res.status}`);
}

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
        setLoadError("Tidak bisa terhubung ke JSONBin. Periksa Bin ID / Access Key, lalu muat ulang.");
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

  const monthData = (db && db.months[mk]) || {};

  const updateEntry = (sId, d, metricId, field, raw) => {
    const val = clampInt(raw);
    setDb((prev) => {
      const next = { ...prev, months: { ...prev.months } };
      const monthObj = { ...(next.months[mk] || {}) };
      monthObj[sId] = { ...(monthObj[sId] || {}) };
      monthObj[sId][d] = { ...(monthObj[sId][d] || {}) };
      monthObj[sId][d][metricId] = { ...(monthObj[sId][d][metricId] || {}), [field]: val };
      next.months[mk] = monthObj;
      scheduleSave(next);
      return next;
    });
  };

  const clearEntry = (sId, d) => {
    setDb((prev) => {
      const next = { ...prev, months: { ...prev.months } };
      const monthObj = { ...(next.months[mk] || {}) };
      if (monthObj[sId]) {
        monthObj[sId] = { ...monthObj[sId] };
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
          clearEntry={clearEntry}
        />
      )}
      {view === "dashboard" && (
        <DashboardView sheets={sheets} sheetId={sheetId} setSheetId={setSheetId} mk={mk} setDate={setDate} monthData={monthData} />
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
      ::-webkit-scrollbar { height: 6px; width: 6px; }
      ::-webkit-scrollbar-thumb { background: ${C.line}; border-radius: 4px; }
      @media print {
        .no-print { display: none !important; }
        body, .print-area { background: #fff !important; color: #111 !important; }
        .print-area * { color: #111 !important; }
        .print-card { border: 1px solid #ccc !important; background: #fff !important; }
      }
    `}</style>
  );
}

/* ---------------------------------- top bar ----------------------------------- */
function TopBar({ view, setView, saveState }) {
  const items = [
    { id: "input", label: "Input", icon: Keyboard },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];
  return (
    <div className="no-print" style={{ borderBottom: `1px solid ${C.line}`, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: 0.5 }}>
          PAPAN <span style={{ color: C.amber }}>EFISIENSI</span>
        </span>
        <span style={{ fontSize: 12, color: saveState === "error" ? C.bad : C.muted, fontFamily: "'IBM Plex Mono', monospace", minWidth: 60 }}>
          {saveState === "saving" ? "menyimpan…" : saveState === "saved" ? "tersimpan ✓" : saveState === "error" ? "gagal simpan ⚠" : ""}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, background: C.panel, padding: 4, borderRadius: 10, border: `1px solid ${C.line}` }}>
        {items.map((it) => {
          const Icon = it.icon;
          const active = view === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 7,
                border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600,
                background: active ? C.amber : "transparent",
                color: active ? "#1A1D20" : C.muted,
                transition: "all .15s",
              }}
            >
              <Icon size={15} /> {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------- sheet tabs ---------------------------------- */
function SheetTabs({ sheets, sheetId, setSheetId }) {
  return (
    <div className="no-print" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 20px", borderBottom: `1px solid ${C.line}` }}>
      {sheets.map((s) => {
        const active = s.id === sheetId;
        return (
          <button
            key={s.id}
            onClick={() => setSheetId(s.id)}
            style={{
              flexShrink: 0, padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600,
              border: `1px solid ${active ? C.amber : C.line}`,
              background: active ? "rgba(242,169,59,0.12)" : C.panel,
              color: active ? C.amber : C.text,
              cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            {s.name}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------- input view --------------------------------- */
function InputView({ sheet, date, setDate, monthData, updateEntry, clearEntry }) {
  const mk = monthKeyOf(date);
  const dim = daysInMonth(mk);
  const entry = (monthData[sheet.id] && monthData[sheet.id][date]) || {};

  const rows = sheet.metrics.map((m) => {
    const v = entry[m.id] || {};
    const qs = qtyStd(v.menit, m.ct);
    const pct = pctAct(v.pcs, qs);
    return { ...m, pcs: v.pcs || "", menit: v.menit || "", qs, pct };
  });

  const totalPcs = rows.reduce((a, r) => a + (Number(r.pcs) || 0), 0);
  const validRows = rows.filter((r) => r.pct !== null);
  const avgPct = validRows.length ? validRows.reduce((a, r) => a + r.pct, 0) / validRows.length : null;

  const filledDays = Object.keys(monthData[sheet.id] || {}).sort();

  const shiftDate = (delta) => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + delta);
    setDate(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`);
  };

  return (
    <div style={{ padding: "20px", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <IconBtn onClick={() => shiftDate(-1)}><ChevronLeft size={18} /></IconBtn>
        <div style={{ flex: 1, position: "relative" }}>
          <Calendar size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }} />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: "100%", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10,
              padding: "10px 12px 10px 34px", color: C.text, fontSize: 14, fontFamily: "'IBM Plex Mono', monospace",
            }}
          />
        </div>
        <IconBtn onClick={() => shiftDate(1)}><ChevronRight size={18} /></IconBtn>
        <IconBtn onClick={() => setDate(todayISO())} title="Hari ini">
          <span style={{ fontSize: 11, fontWeight: 700 }}>HI</span>
        </IconBtn>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <SummaryCard label="Total PCS" value={totalPcs.toLocaleString("id-ID")} />
        <SummaryCard label="Rata-rata %" value={avgPct === null ? "—" : `${avgPct.toFixed(0)}%`} color={statusColor(avgPct)} />
        <button
          onClick={() => { if (Object.keys(entry).length && confirm("Hapus semua data tanggal ini untuk line ini?")) clearEntry(sheet.id, date); }}
          style={{ background: "transparent", border: `1px solid ${C.line}`, borderRadius: 10, padding: "0 14px", color: C.muted, cursor: "pointer", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}
        >
          <Trash2 size={13} /> Bersihkan
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map((r) => (
          <MetricCard key={r.id} sheetId={sheet.id} date={date} metric={r} updateEntry={updateEntry} />
        ))}
      </div>

      {filledDays.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>
            Tanggal terisi bulan ini
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {filledDays.map((d) => {
              const dayEntry = monthData[sheet.id][d];
              const pcts = sheet.metrics.map((m) => {
                const v = dayEntry[m.id];
                if (!v) return null;
                return pctAct(v.pcs, qtyStd(v.menit, m.ct));
              }).filter((p) => p !== null);
              const avg = pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null;
              return (
                <button
                  key={d}
                  onClick={() => setDate(d)}
                  style={{
                    padding: "6px 10px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                    border: `1px solid ${d === date ? C.amber : C.line}`,
                    background: d === date ? "rgba(242,169,59,0.12)" : C.panel,
                    color: C.text, fontFamily: "'IBM Plex Mono', monospace", display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  {d.slice(8)}
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor(avg), display: "inline-block" }} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, onClick, title }) {
  return (
    <button onClick={onClick} title={title} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: C.text, cursor: "pointer" }}>
      {children}
    </button>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{ flex: 1, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 14px" }}>
      <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color || C.text }}>{value}</div>
    </div>
  );
}

function MetricCard({ sheetId, date, metric, updateEntry }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontWeight: 600, fontSize: 14.5 }}>{metric.name} <span style={{ color: C.muted, fontSize: 12, fontWeight: 400 }}>• CT {metric.ct}s</span></span>
        {metric.pct !== null && (
          <span style={{ fontSize: 13, fontWeight: 600, color: statusColor(metric.pct), fontFamily: "'IBM Plex Mono', monospace" }}>
            {metric.pct.toFixed(1)}% ACT
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>ACT Min (Menit)</div>
          <input
            className="num-field"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={metric.menit}
            onChange={(e) => updateEntry(sheetId, date, metric.id, "menit", e.target.value)}
            style={{ width: "100%", background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, padding: "8px 10px", color: C.text, fontSize: 14 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>ACT Pcs (Total)</div>
          <input
            className="num-field"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={metric.pcs}
            onChange={(e) => updateEntry(sheetId, date, metric.id, "pcs", e.target.value)}
            style={{ width: "100%", background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, padding: "8px 10px", color: C.text, fontSize: 14 }}
          />
        </div>
        <div style={{ width: 70, textAlign: "right" }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>STD Pcs</div>
          <div className="num-field" style={{ padding: "8px 0", fontSize: 14, fontWeight: 600, color: metric.pct !== null ? C.text : C.muted }}>
            {metric.qs || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- settings view -------------------------------- */
function SettingsView({ sheets, addSheet, removeSheet, updateSheetName, addMetric, updateMetric, removeMetric, moveSheet }) {
  const [newSheetName, setNewSheetName] = useState("");
  return (
    <div style={{ padding: "20px", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          placeholder="Nama line baru..."
          value={newSheetName}
          onChange={(e) => setNewSheetName(e.target.value)}
          style={{ flex: 1, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 14px", color: C.text, fontSize: 14 }}
        />
        <button
          onClick={() => { if (newSheetName.trim()) { addSheet(newSheetName.trim()); setNewSheetName(""); } }}
          style={{ background: C.amber, color: "#1A1D20", border: "none", borderRadius: 10, padding: "0 16px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        >
          <Plus size={16} /> Tambah
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {sheets.map((s, idx) => (
          <div key={s.id} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              {/* Reordering buttons built inside the line configuration card */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button
                  disabled={idx === 0}
                  onClick={() => moveSheet(s.id, -1)}
                  style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 4, width: 28, height: 24, display: "flex", alignItems: "center", justifyContent: "center", color: idx === 0 ? C.muted : C.text, cursor: idx === 0 ? "not-allowed" : "pointer" }}
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  disabled={idx === sheets.length - 1}
                  onClick={() => moveSheet(s.id, 1)}
                  style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 4, width: 28, height: 24, display: "flex", alignItems: "center", justifyContent: "center", color: idx === sheets.length - 1 ? C.muted : C.text, cursor: idx === sheets.length - 1 ? "not-allowed" : "pointer" }}
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <input
                value={s.name}
                onChange={(e) => updateSheetName(s.id, e.target.value)}
                style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1px dashed ${C.line}`, color: C.text, fontSize: 15, fontWeight: 600, padding: "4px 0" }}
              />
              <button
                onClick={() => { if (confirm(`Hapus line "${s.name}" beserta semua datanya secara permanen?`)) removeSheet(s.id); }}
                style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", padding: 6 }}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 36 }}>
              {s.metrics.map((m) => (
                <div key={m.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    value={m.name}
                    onChange={(e) => updateMetric(s.id, m.id, "name", e.target.value)}
                    style={{ flex: 2, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 6, padding: "6px 10px", color: C.text, fontSize: 13 }}
                  />
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
                    <input
                      type="number"
                      step="0.01"
                      value={m.ct}
                      onChange={(e) => updateMetric(s.id, m.id, "ct", e.target.value)}
                      style={{ width: "100%", background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 6, padding: "6px 10px", color: C.text, fontSize: 13, textAlign: "right" }}
                    />
                    <span style={{ fontSize: 12, color: C.muted }}>s</span>
                  </div>
                  {s.metrics.length > 1 && (
                    <button
                      onClick={() => removeMetric(s.id, m.id)}
                      style={{ background: "transparent", border: "none", color: C.bad, cursor: "pointer", padding: 4 }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addMetric(s.id)}
                style={{ alignSelf: "flex-start", background: "transparent", border: `1px dashed ${C.line}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}
              >
                <Plus size={12} /> Tambah Jenis/Varian (CT)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- dashboard view --------------------------------- */
function DashboardView({ sheets, sheetId, mk, monthData }) {
  const currentSheet = sheets.find((s) => s.id === sheetId) || sheets[0];
  const totalDays = daysInMonth(mk);
  
  const { chartData, historyData } = useMemo(() => {
    const data = [];
    const history = [];
    const sheetEntries = monthData[currentSheet.id] || {};
    
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${mk}-${pad2(day)}`;
      const dayEntry = sheetEntries[dateStr] || {};
      
      let totalMenitHariIni = 0;
      let adaData = false;

      const metricsResults = currentSheet.metrics.map((m) => {
        const v = dayEntry[m.id];
        if (!v || !v.menit || !v.pcs) return null;
        adaData = true;
        const menitVal = Number(v.menit) || 0;
        totalMenitHariIni += menitVal;
        return { name: m.name, menit: menitVal, pct: pctAct(v.pcs, qtyStd(v.menit, m.ct)) };
      }).filter(p => p !== null);
      
      const avgPct = metricsResults.length ? metricsResults.reduce((a, b) => a + b.pct, 0) / metricsResults.length : null;
      
      data.push({ 
        tgl: pad2(day), 
        efisiensi: avgPct ? Math.round(avgPct) : null,
        menit: adaData ? totalMenitHariIni : null
      });
      
      if (avgPct !== null) {
        history.push({ date: dateStr.slice(8), metrics: metricsResults });
      }
    }
    return { chartData: data, historyData: history.reverse().slice(0, 5) };
  }, [currentSheet, mk, monthData, totalDays]);

  return (
    <div style={{ padding: "20px", maxWidth: 800, margin: "0 auto" }}>
      {/* Grafik Kombinasi: Efisiensi & Menit */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "20px 14px", height: 350, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
          <span>Tren Efisiensi & Durasi Kerja Line {currentSheet.name}</span>
          <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
            <span style={{ color: C.amber }}>■ % ACT</span>
            <span style={{ color: C.steel }}>■ Durasi (Menit)</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartData} margin={{ top: 5, right: -20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
            <XAxis dataKey="tgl" stroke={C.muted} fontSize={10} tickLine={false} />
            
            {/* Sumbu Y Kiri untuk Efisiensi % */}
            <YAxis yAxisId="left" domain={[0, 120]} stroke={C.amber} fontSize={10} tickLine={false} />
            {/* Sumbu Y Kanan untuk Jumlah Menit */}
            <YAxis yAxisId="right" orientation="right" domain={[0, 'dataMax + 100']} stroke={C.steel} fontSize={10} tickLine={false} />
            
            <Tooltip 
              contentStyle={{ background: C.panel2, borderRadius: 8, borderColor: C.line, fontSize: 12 }}
              formatter={(value, name) => {
                if (name === "efisiensi") return [`${value}%`, "Efisiensi (% ACT)"];
                if (name === "menit") return [`${value} m`, "Total Kerja (Menit)"];
                return [value, name];
              }}
            />
            
            {/* Bar 1: Efisiensi */}
            <Bar yAxisId="left" dataKey="efisiensi" name="efisiensi" radius={[3, 3, 0, 0]}>
              {chartData.map((e, i) => <Cell key={i} fill={e.efisiensi ? statusColor(e.efisiensi) : "transparent"} />)}
            </Bar>
            
            {/* Bar 2: Menit Kerja */}
            <Bar yAxisId="right" dataKey="menit" name="menit" fill={C.steel} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Riwayat Bagian Bawah */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12 }}>Riwayat Performa Terakhir</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {historyData.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>Belum ada data history bulan ini.</div>}
          {historyData.map((h, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${C.line}`, paddingBottom: 8 }}>
              <div style={{ width: 45, fontWeight: 700, color: C.amber, fontSize: 12.5 }}>Tgl {h.date}</div>
              <div style={{ flex: 1, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {h.metrics.map((m, idx) => (
                  <div key={idx} style={{ background: C.panel2, padding: "4px 8px", borderRadius: 6, fontSize: 12 }}>
                    <span style={{ color: C.muted }}>{m.name}: </span>
                    <span style={{ fontWeight: 600, color: C.text }}>{m.menit}m</span> / 
                    <span style={{ color: statusColor(m.pct), marginLeft: 4, fontWeight: 600 }}>{m.pct.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
