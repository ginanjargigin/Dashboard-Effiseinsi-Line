import { useMemo } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

import {
  Printer,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";

import { C } from "../../constants/appConstants";

import {
  pad2,
  daysInMonth,
  monthLabel,
  qtyStd,
  pctAct,
  statusColor,
} from "../../utils/appUtils";
import StatCard from "./StatCard";

const dashTh = {
  padding: "9px 14px",
  fontSize: 11,
  color: C.muted,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  fontWeight: 600,
};

const dashTd = {
  padding: "8px 14px",
};

/* -------------------------------- dashboard view -------------------------------- */
export default function DashboardView({
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

