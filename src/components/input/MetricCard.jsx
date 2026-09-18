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

    inputs[targetIndex].focus();
    inputs[targetIndex].select();
  };

  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.amber}`,
        borderRadius: 10,

        /*
         * ULTRA COMPACT
         */
        padding: "8px 10px",

        width: "100%",
        boxSizing: "border-box",

        boxShadow: "0 2px 8px var(--color-card-shadow)",
      }}
    >
      {/* ==================================
          HEADER
          ================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          gap: 6,

          marginBottom: 5,

          minWidth: 0,
        }}
      >
        {/* NAME + CT */}

        <div
          style={{
            display: "flex",
            alignItems: "baseline",

            gap: 4,

            minWidth: 0,

            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              color: C.text,

              fontSize: 15,
              fontWeight: 700,

              lineHeight: 1,
            }}
          >
            {metric.name}
          </span>

          <span
            style={{
              color: C.muted,

              fontSize: 9.5,
              fontWeight: 500,

              whiteSpace: "nowrap",
            }}
          >
            • CT {Number(metric.ct || 0).toFixed(2)}s
          </span>
        </div>

        {/* ACTUAL CT */}

        <div
          className="num-field"
          style={{
            color: C.steel,

            fontSize: 10,
            fontWeight: 700,

            lineHeight: 1,

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
           * PCS  : 1.1
           * MIN  : 0.9
           * STD  : 56px
           */
          gridTemplateColumns:
            "minmax(0, 1.1fr) minmax(0, 0.9fr) 56px",

          gap: 6,

          alignItems: "end",

          width: "100%",
        }}
      >
        {/* ==================================
            PCS
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

              fontSize: 9,

              lineHeight: 1,

              marginBottom: 3,

              whiteSpace: "nowrap",

              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            ACT Pcs
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

              height: 38,

              background: "var(--color-input)",

              border: `1px solid ${C.line}`,

              borderRadius: 7,

              padding: "0 8px",

              color: C.text,

              fontSize: 15,

              fontWeight: 600,

              lineHeight: 1,

              outline: "none",

              boxSizing: "border-box",
            }}
          />
        </div>

        {/* ==================================
            MENIT
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

              fontSize: 9,

              lineHeight: 1,

              marginBottom: 3,

              whiteSpace: "nowrap",

              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            ACT Min
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

              height: 38,

              background: "var(--color-input)",

              border: `1px solid ${C.line}`,

              borderRadius: 7,

              padding: "0 8px",

              color: C.text,

              fontSize: 15,

              fontWeight: 600,

              lineHeight: 1,

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

              fontSize: 9,

              lineHeight: 1,

              marginBottom: 3,

              whiteSpace: "nowrap",
            }}
          >
            STD Pcs
          </label>

          <div
            className="num-field"
            style={{
              height: 38,

              display: "flex",

              alignItems: "center",

              justifyContent: "flex-end",

              color: metric.qs
                ? C.text
                : C.muted,

              fontSize: 15,

              fontWeight: 700,

              lineHeight: 1,

              padding: "0 1px",

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
