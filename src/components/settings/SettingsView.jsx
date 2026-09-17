import { useState } from "react";

import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";

import { C } from "../../constants/appConstants";

export default function SettingsView({
  sheets,
  addSheet,
  removeSheet,
  updateSheetName,
  addMetric,
  updateMetric,
  removeMetric,
  moveSheet,
}) {
  const [newSheetName, setNewSheetName] = useState("");

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
        }}
      >
        <input
          placeholder="Nama line baru..."
          value={newSheetName}
          onChange={(e) => setNewSheetName(e.target.value)}
          style={{
            flex: 1,
            background: C.panel,
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            padding: "10px 14px",
            color: C.text,
            fontSize: 14,
          }}
        />

        <button
          onClick={() => {
            if (newSheetName.trim()) {
              addSheet(newSheetName.trim());
              setNewSheetName("");
            }
          }}
          style={{
            background: C.amber,
            color: "#1A1D20",
            border: "none",
            borderRadius: 10,
            padding: "0 16px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Plus size={16} />
          Tambah
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {sheets.map((s, idx) => (
          <div
            key={s.id}
            style={{
              background: C.panel,
              border: `1px solid ${C.line}`,
              borderRadius: 12,
              padding: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <button
                  disabled={idx === 0}
                  onClick={() => moveSheet(s.id, -1)}
                  style={{
                    background: C.panel2,
                    border: `1px solid ${C.line}`,
                    borderRadius: 4,
                    width: 28,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: idx === 0 ? C.muted : C.text,
                    cursor:
                      idx === 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  <ChevronUp size={14} />
                </button>

                <button
                  disabled={idx === sheets.length - 1}
                  onClick={() => moveSheet(s.id, 1)}
                  style={{
                    background: C.panel2,
                    border: `1px solid ${C.line}`,
                    borderRadius: 4,
                    width: 28,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color:
                      idx === sheets.length - 1
                        ? C.muted
                        : C.text,
                    cursor:
                      idx === sheets.length - 1
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <input
                value={s.name}
                onChange={(e) =>
                  updateSheetName(s.id, e.target.value)
                }
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  borderBottom: `1px dashed ${C.line}`,
                  color: C.text,
                  fontSize: 15,
                  fontWeight: 600,
                  padding: "4px 0",
                }}
              />

              <button
                onClick={() => {
                  if (
                    confirm(
                      `Hapus line "${s.name}" beserta semua datanya secara permanen?`
                    )
                  ) {
                    removeSheet(s.id);
                  }
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: C.muted,
                  cursor: "pointer",
                  padding: 6,
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                paddingLeft: 36,
              }}
            >
              {s.metrics.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    value={m.name}
                    onChange={(e) =>
                      updateMetric(
                        s.id,
                        m.id,
                        "name",
                        e.target.value
                      )
                    }
                    style={{
                      flex: 2,
                      background: C.panel2,
                      border: `1px solid ${C.line}`,
                      borderRadius: 6,
                      padding: "6px 10px",
                      color: C.text,
                      fontSize: 13,
                    }}
                  />

                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <input
                      type="number"
                      step="0.01"
                      value={m.ct}
                      onChange={(e) =>
                        updateMetric(
                          s.id,
                          m.id,
                          "ct",
                          e.target.value
                        )
                      }
                      style={{
                        width: "100%",
                        background: C.panel2,
                        border: `1px solid ${C.line}`,
                        borderRadius: 6,
                        padding: "6px 10px",
                        color: C.text,
                        fontSize: 13,
                        textAlign: "right",
                      }}
                    />

                    <span
                      style={{
                        fontSize: 12,
                        color: C.muted,
                      }}
                    >
                      s
                    </span>
                  </div>

                  {s.metrics.length > 1 && (
                    <button
                      onClick={() =>
                        removeMetric(s.id, m.id)
                      }
                      style={{
                        background: "transparent",
                        border: "none",
                        color: C.bad,
                        cursor: "pointer",
                        padding: 4,
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={() => addMetric(s.id)}
                style={{
                  alignSelf: "flex-start",
                  background: "transparent",
                  border: `1px dashed ${C.line}`,
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 12,
                  color: C.muted,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 4,
                }}
              >
                <Plus size={12} />
                Tambah Jenis/Varian (CT)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
