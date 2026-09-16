import { C } from "../../constants/appConstants";

export default function MetricCard({
  sheetId,
  date,
  metric,
  updateEntry,
}) {
  const actualCt =
    Number(metric.pcs) > 0
      ? Number(metric.menit || 0) / Number(metric.pcs)
      : null;

  /* ----------------------------------
     KEYBOARD NAVIGATION
     ---------------------------------- */

  const handleArrowNavigation = (event) => {
    const navigationKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
    ];

    if (!navigationKeys.includes(event.key)) return;

    // Urutan input:
    // PCS 1 → Menit 1 → PCS 2 → Menit 2 → PCS 3 → Menit 3 → ...

    const inputs = Array.from(
      document.querySelectorAll(".num-field-input")
    );

    const currentInput = event.currentTarget;
    const currentIndex = inputs.indexOf(currentInput);

    if (currentIndex === -1) return;

    let targetIndex;

    if (event.key === "ArrowLeft") {
      targetIndex = currentIndex - 1;
    } else if (event.key === "ArrowRight") {
      targetIndex = currentIndex + 1;
    } else if (event.key === "ArrowUp") {
      targetIndex = currentIndex - 2;
    } else if (event.key === "ArrowDown") {
      targetIndex = currentIndex + 2;
    }

    if (
      targetIndex < 0 ||
      targetIndex >= inputs.length ||
      !inputs[targetIndex]
    ) {
      return;
    }

    event.preventDefault();

    const target = inputs[targetIndex];

    target.focus();
    target.select();
  };

  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.amber}`,
        borderRadius: 12,

        /*
         * COMPACT:
         * Sebelumnya:
         * padding: "22px 26px 24px"
         *
         * Sekarang lebih kecil agar nyaman di HP.
         */
        padding: "12px 14px",

        boxShadow: "0 2px 8px rgba(0,0,0,.10)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* ==================================
          HEADER KARTU
          ================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 8,
          minWidth: 0,
        }}
      >
        {/* Nama Metric + CT */}

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 5,
            minWidth: 0,
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: C.text,
              lineHeight: 1.1,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {metric.name}
          </span>

          <span
            style={{
              color: C.muted,
              fontSize: 11,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            • CT {Number(metric.ct || 0).toFixed(2)}s
          </span>
        </div>

        {/* Actual CT */}

        <div
          className="num-field"
          style={{
            color: C.steel,
            fontSize: 11.5,
            fontWeight: 700,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {actualCt !== null
            ? `${actualCt.toFixed(3)} min/pcs`
            : "—"}
        </div>
      </div>

      {/* ==================================
          INPUT GRID
          ================================== */}

      <div
        style={{
          display: "grid",

          /*
           * PCS sedikit lebih lebar.
           * Menit cukup untuk angka.
           * STD Pcs dibuat fixed supaya
           * tidak memakan ruang berlebihan.
           */
          gridTemplateColumns:
            "minmax(0, 1.15fr) minmax(0, 0.85fr) 62px",

          gap: 7,

          alignItems: "end",

          width: "100%",
        }}
      >
        {/* ==================================
            ACT PCS
            ================================== */}

        <div
          style={{
            minWidth: 0,
          }}
        >
          <label
            style={{
              display: "block",
              color: C.muted,
              fontSize: 10.5,
              lineHeight: 1.2,
              marginBottom: 4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            ACT Pcs (Total)
          </label>

          <input
            className="num-field num-field-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={metric.pcs}
            onChange={(e) =>
              updateEntry(
                sheetId,
                date,
                metric.id,
                "pcs",
                e.target.value
              )
            }
            onKeyDown={handleArrowNavigation}
            style={{
              width: "100%",
              height: 42,

              background: C.panel2,
              border: `1px solid ${C.line}`,
              borderRadius: 8,

              padding: "0 10px",

              color: C.text,

              fontSize: 16,
              fontWeight: 600,

              outline: "none",

              boxSizing: "border-box",
            }}
          />
        </div>

        {/* ==================================
            ACT MIN
            ================================== */}

        <div
          style={{
            minWidth: 0,
          }}
        >
          <label
            style={{
              display: "block",
              color: C.muted,
              fontSize: 10.5,
              lineHeight: 1.2,
              marginBottom: 4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            ACT Min (Menit)
          </label>

          <input
            className="num-field num-field-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={metric.menit}
            onChange={(e) =>
              updateEntry(
                sheetId,
                date,
                metric.id,
                "menit",
                e.target.value
              )
            }
            onKeyDown={handleArrowNavigation}
            style={{
              width: "100%",
              height: 42,

              background: C.panel2,
              border: `1px solid ${C.line}`,
              borderRadius: 8,

              padding: "0 10px",

              color: C.text,

              fontSize: 16,
              fontWeight: 600,

              outline: "none",

              boxSizing: "border-box",
            }}
          />
        </div>

        {/* ==================================
            STD PCS
            ================================== */}

        <div
          style={{
            minWidth: 0,
            textAlign: "right",
          }}
        >
          <label
            style={{
              display: "block",
              color: C.muted,
              fontSize: 10.5,
              lineHeight: 1.2,
              marginBottom: 4,
              whiteSpace: "nowrap",
            }}
          >
            STD Pcs
          </label>

          <div
            className="num-field"
            style={{
              height: 42,

              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",

              color: metric.qs
                ? C.text
                : C.muted,

              fontSize: 16,
              fontWeight: 700,

              padding: "0 2px",

              boxSizing: "border-box",

              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {metric.qs || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
