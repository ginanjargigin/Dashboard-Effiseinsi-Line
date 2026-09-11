import {
  Trash2,
  CalendarCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { C } from "../../constants/appConstants";

import {
  pad2,
  todayISO,
  monthKeyOf,
  daysInMonth,
  qtyStd,
  pctAct,
  statusColor,
} from "../../utils/appUtils";

import MetricCard from "./MetricCard";

const inputIconBtnStyle = {
  background: C.amber,
  border: "none",
  borderRadius: 10,
  width: 44,
  height: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#1A1D20",
  cursor: "pointer",
  fontWeight: 700,
  transition: "all .2s ease",
  boxShadow: "0 3px 10px rgba(242,169,59,.30)",
};

const inputSummaryCardStyle = {
  flex: 1,
  background: C.panel,
  border: `1px solid ${C.line}`,
  borderRadius: 10,
  padding: "10px 14px",
};

const inputSummaryLabelStyle = {
  fontSize: 10.5,
  color: C.muted,
  textTransform: "uppercase",
  letterSpacing: 0.6,
};

export default function InputView({
  sheet,
  date,
  setDate,
  monthData,
  updateEntry,
  updateNote,
  clearEntry,
}) {
  const mk = monthKeyOf(date);
  const dim = daysInMonth(mk);

  const entry =
    (monthData[sheet.id] && monthData[sheet.id][date]) || {};

  const note =
    typeof entry.note === "string" ? entry.note : "";

  const rows = sheet.metrics.map((m) => {
    const v = entry[m.id] || {};
    const qs = qtyStd(v.menit, m.ct);
    const pct = pctAct(v.pcs, qs);

    return {
      ...m,
      pcs: v.pcs || "",
      menit: v.menit || "",
      qs,
      pct,
    };
  });

  const totalMenitHariIni = rows.reduce(
    (a, r) => a + (Number(r.menit) || 0),
    0
  );

  const validRows = rows.filter((r) => r.pct !== null);

  const avgPct = validRows.length
    ? validRows.reduce((a, r) => a + r.pct, 0) /
      validRows.length
    : null;

  const filledDays = Object.keys(
    monthData[sheet.id] || {}
  )
    .filter((d) => {
      const dayEntry = monthData[sheet.id][d] || {};

      return sheet.metrics.some((m) => {
        const value = dayEntry[m.id];

        return (
          value &&
          (value.pcs !== undefined ||
            value.menit !== undefined)
        );
      });
    })
    .sort();

  const shiftDate = (delta) => {
    const d = new Date(date + "T00:00:00");

    d.setDate(d.getDate() + delta);

    setDate(
      `${d.getFullYear()}-${pad2(
        d.getMonth() + 1
      )}-${pad2(d.getDate())}`
    );
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      {/* DATE NAVIGATION */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <button
          title="Tanggal Sebelumnya"
          onClick={() => shiftDate(-1)}
          style={inputIconBtnStyle}
        >
          <ChevronLeft size={18} />
        </button>

        <div
          style={{
            flex: 1,
            position: "relative",
          }}
        >
          <Calendar
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: C.muted,
            }}
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: "100%",
              background: C.panel,
              border: `1px solid ${C.amber}`,
              borderRadius: 10,
              padding: "10px 12px 10px 34px",
              color: C.text,
              fontSize: 14,
              fontFamily:
                "'IBM Plex Mono', monospace",
            }}
          />
        </div>

        <button
          title="Tanggal Berikutnya"
          onClick={() => shiftDate(1)}
          style={inputIconBtnStyle}
        >
          <ChevronRight size={18} />
        </button>

        <button
          onClick={() => setDate(todayISO())}
          title="Hari Ini"
          style={{
            background: C.panel,
            border: `1px solid ${C.amber}`,
            color: C.text,
            borderRadius: 10,
            minWidth: 105,
            height: 44,
            padding: "0 14px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all .2s ease",
          }}
        >
          <CalendarCheck
            size={18}
            color={C.amber}
            strokeWidth={2.2}
          />

          <span>Hari Ini</span>
        </button>
      </div>

      {/* CATATAN HARIAN */}
      <div
        style={{
          background: C.panel,
          border: `1px solid ${C.line}`,
          borderRadius: 12,
          padding: 14,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: C.muted,
            textTransform: "uppercase",
            letterSpacing: 0.6,
            marginBottom: 7,
            fontWeight: 600,
          }}
        >
          Catatan Hari Ini
        </div>

        <textarea
          className="note-field"
          value={note}
          onChange={(e) =>
            updateNote(sheet.id, date, e.target.value)
          }
          placeholder="Tulis problem, kendala, downtime, atau kejadian penting hari ini..."
          rows={4}
          style={{
            width: "100%",
            resize: "vertical",
            minHeight: 92,
            background: C.panel2,
            border: `1px solid ${C.line}`,
            borderRadius: 8,
            padding: "10px 12px",
            color: C.text,
            fontSize: 13,
            lineHeight: 1.5,
            fontFamily: "'Inter', sans-serif",
            outline: "none",
          }}
        />

        <div
          style={{
            marginTop: 6,
            fontSize: 10.5,
            color: C.muted,
          }}
        >
          Tersimpan otomatis setelah perubahan.
        </div>
      </div>

      {/* SUMMARY */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <div style={inputSummaryCardStyle}>
          <div style={inputSummaryLabelStyle}>
            Rata-rata %
          </div>

          <div
            className="num-field"
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: statusColor(avgPct),
            }}
          >
            {avgPct === null
              ? "—"
              : `${avgPct.toFixed(0)}%`}
          </div>
        </div>

        <div style={inputSummaryCardStyle}>
          <div style={inputSummaryLabelStyle}>
            Total Menit
          </div>

          <div
            className="num-field"
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: C.steel,
            }}
          >
            {totalMenitHariIni.toLocaleString(
              "id-ID"
            )}{" "}
            m
          </div>
        </div>

        <button
          onClick={() => {
            if (
              Object.keys(entry).length &&
              confirm(
                "Hapus semua data tanggal ini untuk line ini?"
              )
            ) {
              clearEntry(sheet.id, date);
            }
          }}
          style={{
            background: "transparent",
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            padding: "0 14px",
            color: C.muted,
            cursor: "pointer",
            fontSize: 12.5,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Trash2 size={13} />
          Bersihkan
        </button>
      </div>

      {/* METRIC CARDS */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {rows.map((r) => (
          <MetricCard
            key={r.id}
            sheetId={sheet.id}
            date={date}
            metric={r}
            updateEntry={updateEntry}
          />
        ))}
      </div>

      {/* FILLED DAYS */}
      {filledDays.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <div
            style={{
              fontSize: 11.5,
              color: C.muted,
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            Tanggal terisi bulan ini
          </div>

          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {filledDays.map((d) => {
              const dayEntry =
                monthData[sheet.id][d];

              const pcts = sheet.metrics
                .map((m) => {
                  const v = dayEntry[m.id];

                  if (!v) return null;

                  return pctAct(
                    v.pcs,
                    qtyStd(v.menit, m.ct)
                  );
                })
                .filter((p) => p !== null);

              const avg = pcts.length
                ? pcts.reduce(
                    (a, b) => a + b,
                    0
                  ) / pcts.length
                : null;

              return (
                <button
                  key={d}
                  onClick={() => setDate(d)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    fontSize: 12,
                    cursor: "pointer",
                    border: `1px solid ${
                      d === date ? C.amber : C.line
                    }`,
                    background:
                      d === date
                        ? "rgba(242,169,59,0.12)"
                        : C.panel,
                    color: C.text,
                    fontFamily:
                      "'IBM Plex Mono', monospace",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {d.slice(8)}

                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: statusColor(avg),
                      display: "inline-block",
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
