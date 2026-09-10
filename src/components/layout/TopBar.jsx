import {
  Keyboard,
  LayoutDashboard,
  Settings,
} from "lucide-react";

export default function TopBar({ view, setView, saveState }) {
  /* ---------------------------------- top bar ----------------------------------- */
function TopBar({ view, setView, saveState }) {
  const items = [
    { id: "input", label: "Input", icon: Keyboard },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <div
      className="no-print"
      style={{
        borderBottom: `1px solid ${C.line}`,
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
        }}
      >
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: 0.5,
          }}
        >
          PAPAN <span style={{ color: C.amber }}>EFISIENSI</span>
        </span>

        <span
          style={{
            fontSize: 12,
            color: saveState === "error" ? C.bad : C.muted,
            fontFamily: "'IBM Plex Mono', monospace",
            minWidth: 60,
          }}
        >
          {saveState === "saving"
            ? "menyimpan..."
            : saveState === "saved"
            ? "tersimpan ✓"
            : saveState === "error"
            ? "gagal ⚠"
            : ""}
        </span>
      </div>

      {/* Menu */}
      <div
        style={{
          display: "flex",
          gap: 6,
          background: C.panel,
          padding: 4,
          borderRadius: 10,
          border: `1px solid ${C.line}`,
        }}
      >
        {items.map((it) => {
          const Icon = it.icon;
          const active = view === it.id;

          return (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                background: active ? C.amber : "transparent",
                color: active ? "#1A1D20" : C.muted,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              <Icon size={15} />
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
}
