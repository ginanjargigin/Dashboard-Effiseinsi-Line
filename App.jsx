import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Trash2, Settings, LayoutDashboard, Keyboard, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Calendar, AlertTriangle,
} from "lucide-react";

/* ---------------------------------- tokens ---------------------------------- */
const C = {
  bg: "#1A1D20", panel: "#232729", panel2: "#2B3033", line: "#383E42",
  amber: "#F2A93B", steel: "#6C93B0", text: "#ECEEEF", muted: "#8C949A",
  good: "#49B96B", warn: "#F2A93B", bad: "#E5555C",
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
const clampInt = (raw) => {
  const digits = String(raw).replace(/[^0-9]/g, "");
  return digits === "" ? "" : String(parseInt(digits, 10));
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
  { id: uid(), name: "YTB Staking Ari", metrics: [{ id: uid(), name: "Std", ct: 49.2 }] },
  { id: uid(), name: "Upper Weld", metrics: [{ id: uid(), name: "Std", ct: 10 }] },
];

/* --------------------------------- storage ----------------------------------- */
const JSONBIN_BIN_ID = "6a45ea43da38895dfe201020";
const JSONBIN_ACCESS_KEY = "$2a$10$1tOHMs3rSfnEVLSA9DvzD.nks0s1wKhEXxkoNevO4CvViNr8j4Z7W";
const JSONBIN_BASE = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

async function fetchDb() {
  const res = await fetch(`${JSONBIN_BASE}/latest`, { headers: { "X-Access-Key": JSONBIN_ACCESS_KEY } });
  if (!res.ok) throw new Error(`JSONBin GET failed: ${res.status}`);
  const json = await res.json();
  return json.record || null;
}
async function saveDb(db) {
  await fetch(JSONBIN_BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Access-Key": JSONBIN_ACCESS_KEY },
    body: JSON.stringify(db),
  });
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
        if (!remote || !remote.sheets) {
          remote = { sheets: DEFAULT_SHEETS, months: {} };
          await saveDb(remote);
        }
        setDb(remote);
        setSheetId(remote.sheets[0].id);
        setReady(true);
      } catch (e) {
        setLoadError("Gagal memuat data.");
        setReady(true);
      }
    })();
  }, []);

  const scheduleSave = useCallback((nextDb) => {
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try { await saveDb(nextDb); setSaveState("saved"); } catch { setSaveState("error"); }
      setTimeout(() => setSaveState("idle"), 1500);
    }, 600);
  }, []);

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

  const addSheet = (name) => {
    const s = { id: uid(), name, metrics: [{ id: uid(), name: "Std", ct: 10 }] };
    setDb((prev) => { const next = { ...prev, sheets: [...prev.sheets, s] }; scheduleSave(next); return next; });
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
    setDb((prev) => ({
      ...prev,
      sheets: prev.sheets.map((s) => s.id === sId ? { ...s, metrics: [...s.metrics, { id: uid(), name: "Baru", ct: 10 }] } : s)
    }));
  };

  const updateMetric = (sId, mId, field, value) => {
    setDb((prev) => {
      const next = {
        ...prev,
        sheets: prev.sheets.map((s) => s.id !== sId ? s : { ...s, metrics: s.metrics.map((m) => m.id === mId ? { ...m, [field]: field === "ct" ? Number(value) || 0 : value } : m) })
      };
      scheduleSave(next);
      return next;
    });
  };

  const removeMetric = (sId, mId) => {
    setDb((prev) => {
      const next = { ...prev, sheets: prev.sheets.map((s) => (s.id === sId ? { ...s, metrics: s.metrics.filter((m) => m.id !== mId) } : s)) };
      scheduleSave(next);
      return next;
    });
  };

  if (!ready) return <div style={{ background: C.bg, color: C.text, height: "100vh" }}>Memuat...</div>;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "Inter" }}>
      <div style={{ padding: 20, borderBottom: `1px solid ${C.line}`, display: "flex", gap: 10 }}>
        <button onClick={() => setView("input")} style={{ background: view === "input" ? C.amber : C.panel, border: 0, padding: 8, cursor: "pointer" }}>Input</button>
        <button onClick={() => setView("settings")} style={{ background: view === "settings" ? C.amber : C.panel, border: 0, padding: 8, cursor: "pointer" }}>Settings</button>
      </div>

      {view === "settings" && (
        <div style={{ padding: 20 }}>
          {db.sheets.map((s, idx) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, background: C.panel, padding: 10, marginBottom: 10 }}>
              <button onClick={() => moveSheet(s.id, -1)} disabled={idx === 0}><ChevronUp size={16} /></button>
              <button onClick={() => moveSheet(s.id, 1)} disabled={idx === db.sheets.length - 1}><ChevronDown size={16} /></button>
              <input value={s.name} onChange={(e) => updateSheetName(s.id, e.target.value)} style={{ background: "transparent", color: C.text, border: 0 }} />
              <button onClick={() => removeSheet(s.id)}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
