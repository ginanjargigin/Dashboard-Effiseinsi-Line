  /* ---------------------------------- metric card --------------------------------- */
import { C } from "../../constants/appConstants";
export default function MetricCard({ sheetId, date, metric, updateEntry }) {
  const actualCt =
    Number(metric.pcs) > 0
      ? Number(metric.menit || 0) / Number(metric.pcs)
      : null;

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
        borderRadius: 16,
        padding: "22px 26px 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,.10)",
      }}
    >
      {/* HEADER KARTU */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: C.text,
            lineHeight: 1.1,
          }}
        >
          {metric.name}
          <span
            style={{
              color: C.muted,
              fontSize: 14,
              fontWeight: 500,
              marginLeft: 7,
            }}
          >
            • CT {Number(metric.ct || 0).toFixed(2)}s
          </span>
        </div>

        <div
          className="num-field"
          style={{
            color: C.steel,
            fontSize: 14,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {actualCt !== null ? `${actualCt.toFixed(3)} min/pcs` : "—"}
        </div>
      </div>

      {/* INPUT + STD PCS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr 0.65fr",
          gap: 12,
          alignItems: "end",
        }}
      >
        {/* PCS */}
        <div>
          <label
            style={{
              display: "block",
              color: C.muted,
              fontSize: 14,
              marginBottom: 8,
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
              height: 52,
              background: C.panel2,
              border: `1px solid ${C.line}`,
              borderRadius: 12,
              padding: "0 16px",
              color: C.text,
              fontSize: 18,
              fontWeight: 600,
              outline: "none",
            }}
          />
        </div>

        {/* MENIT */}
        <div>
          <label
            style={{
              display: "block",
              color: C.muted,
              fontSize: 14,
              marginBottom: 8,
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
              height: 52,
              background: C.panel2,
              border: `1px solid ${C.line}`,
              borderRadius: 12,
              padding: "0 16px",
              color: C.text,
              fontSize: 18,
              fontWeight: 600,
              outline: "none",
            }}
          />
        </div>

        {/* STD PCS */}
        <div>
          <label
            style={{
              display: "block",
              color: C.muted,
              fontSize: 14,
              marginBottom: 8,
            }}
          >
            STD Pcs
          </label>

          <div
            className="num-field"
            style={{
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              color: metric.qs ? C.text : C.muted,
              fontSize: 18,
              fontWeight: 700,
              padding: "0 8px",
            }}
          >
            {metric.qs || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}



