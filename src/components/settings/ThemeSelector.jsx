import {
  MoreVertical,
  Palette,
  Check,
} from "lucide-react";
import { useState } from "react";

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
  const [open, setOpen] = useState(false);

  const activeTheme =
    themes.find((item) => item.id === theme) ||
    themes[0];

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
      }}
    >
      {/* TOMBOL TITIK TIGA */}
        <button
        onClick={() => setOpen((prev) => !prev)}
        title="Tema tampilan"
        aria-label="Tema tampilan"
        style={{
          height: 40,
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "0 10px",
          background: "var(--color-panel)",
          border: "1px solid var(--color-line)",
          borderRadius: 9,
          color: "var(--color-text)",
          cursor: "pointer",
          position: "relative",
          fontSize: 12.5,
          fontWeight: 600,
        }}
      >
        <Palette size={16} />
      
        <span>Tema</span>
      
        <MoreVertical size={17} />
      
        <span
          style={{
            position: "absolute",
            right: 5,
            top: 5,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: activeTheme.color,
          }}
        />
      </button>

      {/* MENU TEMA */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: 46,
            left: 0,
            right: "auto",
            width: "min(240px, calc(100vw - 24px))",
            maxWidth: "calc(100vw - 24px)",
   
            padding: 8,
            background: "var(--color-panel)",
            border: `1px solid ${"var(--color-line)"}`,
            borderRadius: 10,
            boxShadow:
              "0 8px 24px var(--color-card-shadow)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 8px 9px",
              color: "var(--color-text)",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <Palette size={15} />
            Tema Tampilan
          </div>

          <div
            style={{
              height: 1,
              background: "var(--color-line)",
              marginBottom: 6,
            }}
          />

          {themes.map((item) => {
            const active = theme === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setTheme(item.id);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "9px 8px",
                  background: active
                    ? "var(--color-accent-soft)"
                    : "transparent",
                  border: active
                    ? "1px solid var(--color-accent)"
                    : "1px solid transparent",
                  borderRadius: 7,
                  color: "var(--color-text)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: "50%",
                    background: item.color,
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}
                  >
                    {item.name}
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--color-muted)",
                      marginTop: 2,
                    }}
                  >
                    {item.description}
                  </div>
                </div>

                {active && (
                  <Check
                    size={15}
                    color="var(--color-accent)"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
