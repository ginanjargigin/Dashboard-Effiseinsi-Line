
export default function SheetTabs({ sheets, sheetId, setSheetId }) {
/* --------------------------------- sheet tabs ---------------------------------- */

  return (
    <div
      className="no-print sheet-tabs-scroll"
      style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        padding: "12px 20px",
        borderBottom: `1px solid ${C.line}`,
      }}
    >
      {sheets.map((s) => {
        const active = s.id === sheetId;

        return (
          <button
            key={s.id}
            onClick={() => setSheetId(s.id)}
            style={{
              flexShrink: 0,
              padding: "7px 14px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              border: `1px solid ${active ? C.amber : C.line}`,
              background: active
                ? "rgba(242,169,59,0.12)"
                : C.panel,
              color: active ? C.amber : C.text,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {s.name}
          </button>
        );
      })}
    </div>
  );
}
