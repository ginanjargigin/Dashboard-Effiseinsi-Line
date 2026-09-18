import {
  Palette,
  Check,
} from "lucide-react";

const themes = [
  {
    id: "amber",
    name: "Factory Amber",
    description: "Industrial & Production",
    color: "#F2A93B",
  },
  {
    id: "midnight",
    name: "Midnight Cyan",
    description: "Technology & Monitoring",
    color: "#38BDF8",
  },
  {
    id: "light",
    name: "Light Corporate",
    description: "Clean & Formal",
    color: "#2563EB",
  },
];

export default function ThemeSelector({
  theme,
  setTheme,
}) {
  return (
    <div
      style={{
        background: "var(--color-panel)",
        border: "1px solid var(--color-line)",
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          color: "var(--color-text)",
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        <Palette size={16} />
        Tema Tampilan
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {themes.map((item) => {
          const active = theme === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setTheme(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",

                background: active
                  ? "var(--color-accent-soft)"
                  : "transparent",

                border: active
                  ? "1px solid var(--color-accent)"
                  : "1px solid var(--color-line)",

                borderRadius: 9,

                color: "var(--color-text)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: item.color,
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {item.name}
                </div>

                <div
                  style={{
                    fontSize: 10.5,
                    color: "var(--color-muted)",
                    marginTop: 2,
                  }}
                >
                  {item.description}
                </div>
              </div>

              {active && (
                <Check
                  size={16}
                  color="var(--color-accent)"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
