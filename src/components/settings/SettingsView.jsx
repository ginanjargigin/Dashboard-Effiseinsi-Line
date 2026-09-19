import { useState } from "react";

import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";

import ThemeSelector from "./ThemeSelector";

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
  theme,
  setTheme,
  addNgType,
  updateNgType,
  removeNgType,
}) {
  const [newSheetName, setNewSheetName] = useState("");
  const [newNgNames, setNewNgNames] = useState({});
  const [ngFeedback, setNgFeedback] = useState({});

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <ThemeSelector
        theme={theme}
        setTheme={setTheme}
      />

      {/* KODE SETTINGS YANG SUDAH ADA */}
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
          onChange={(e) =>
            setNewSheetName(e.target.value)
          }
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
            color: "var(--color-accent-text)",
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
                  onClick={() =>
                    moveSheet(s.id, -1)
                  }
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
                      idx === 0
                        ? C.muted
                        : C.text,
                    cursor:
                      idx === 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  <ChevronUp size={14} />
                </button>

                <button
                  disabled={
                    idx === sheets.length - 1
                  }
                  onClick={() =>
                    moveSheet(s.id, 1)
                  }
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
                  updateSheetName(
                    s.id,
                    e.target.value
                  )
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
                        removeMetric(
                          s.id,
                          m.id
                        )
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

              {/* NG CHARACTERISTICS */}
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: `1px solid ${C.line}`,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.muted,
                    marginBottom: 10,
                    letterSpacing: "0.04em",
                  }}
                >
                  NG CHARACTERISTICS
                </div>

                {(Array.isArray(s.ngTypes)
                  ? s.ngTypes
                  : []
                ).map((ng) => (
                  <div
                    key={ng.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <input
                      value={ng.name}
                      onChange={(e) =>
                        updateNgType(
                          s.id,
                          ng.id,
                          e.target.value
                        )
                      }
                      style={{
                        flex: 1,
                        minWidth: 0,
                        background: C.panel2,
                        border: `1px solid ${C.line}`,
                        borderRadius: 6,
                        padding: "6px 10px",
                        color: C.text,
                        fontSize: 13,
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const confirmed =
                          window.confirm(
                            `Yakin ingin menghapus karakteristik NG "${ng.name}"?`
                          );

                        if (!confirmed) return;

                        removeNgType(
                          s.id,
                          ng.id
                        );
                      }}
                      title="Hapus NG"
                      style={{
                        background:
                          "transparent",
                        border: "none",
                        color: C.bad,
                        cursor: "pointer",
                        padding: 4,
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {/* INPUT TAMBAH NG */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  <input
                    value={
                      newNgNames[s.id] || ""
                    }
                    onChange={(e) => {
                      const value =
                        e.target.value;

                      setNewNgNames(
                        (prev) => ({
                          ...prev,
                          [s.id]: value,
                        })
                      );

                      const normalized =
                        value
                          .trim()
                          .toLowerCase();

                      const duplicate =
                        normalized &&
                        (
                          Array.isArray(
                            s.ngTypes
                          )
                            ? s.ngTypes
                            : []
                        ).some(
                          (ng) =>
                            ng.name
                              .trim()
                              .toLowerCase() ===
                            normalized
                        );

                      setNgFeedback(
                        (prev) => ({
                          ...prev,
                          [s.id]:
                            duplicate
                              ? "Karakteristik NG tersebut sudah ada."
                              : "",
                        })
                      );
                    }}
                    placeholder="Nama karakteristik NG..."
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background:
                        C.panel2,
                      border: `1px solid ${
                        ngFeedback[s.id]
                          ? C.bad
                          : C.line
                      }`,
                      borderRadius: 6,
                      padding:
                        "6px 10px",
                      color: C.text,
                      fontSize: 13,
                      outline: "none",
                    }}
                  />

                  <button
                    type="button"
                    disabled={
                      !newNgNames[
                        s.id
                      ]?.trim() ||
                      Boolean(
                        ngFeedback[s.id]
                      )
                    }
                    onClick={() => {
                      const name = (
                        newNgNames[
                          s.id
                        ] || ""
                      ).trim();

                      if (!name) return;

                      const duplicate = (
                        Array.isArray(
                          s.ngTypes
                        )
                          ? s.ngTypes
                          : []
                      ).some(
                        (ng) =>
                          ng.name
                            .trim()
                            .toLowerCase() ===
                          name.toLowerCase()
                      );

                      if (duplicate) {
                        setNgFeedback(
                          (prev) => ({
                            ...prev,
                            [s.id]:
                              "Karakteristik NG tersebut sudah ada.",
                          })
                        );

                        return;
                      }

                      addNgType(
                        s.id,
                        name
                      );

                      setNewNgNames(
                        (prev) => ({
                          ...prev,
                          [s.id]: "",
                        })
                      );

                      setNgFeedback(
                        (prev) => ({
                          ...prev,
                          [s.id]: "",
                        })
                      );
                    }}
                    style={{
                      background:
                        newNgNames[
                          s.id
                        ]?.trim() &&
                        !ngFeedback[
                          s.id
                        ]
                          ? C.amber
                          : "var(--color-accent-soft)",
                      border: `1px solid ${C.line}`,
                      borderRadius: 6,
                      padding:
                        "6px 10px",
                      color:
                        newNgNames[
                          s.id
                        ]?.trim() &&
                        !ngFeedback[
                          s.id
                        ]
                          ? "var(--color-accent-text)"
                          : C.muted,
                      cursor:
                        newNgNames[
                          s.id
                        ]?.trim() &&
                        !ngFeedback[
                          s.id
                        ]
                          ? "pointer"
                          : "not-allowed",
                      opacity:
                        newNgNames[
                          s.id
                        ]?.trim() &&
                        !ngFeedback[
                          s.id
                        ]
                          ? 1
                          : 0.6,
                      display: "flex",
                      alignItems:
                        "center",
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    <Plus size={12} />
                    Tambah NG
                  </button>
                </div>

                {/* FEEDBACK DUPLICATE */}
                {ngFeedback[s.id] && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 11,
                      color: C.bad,
                      display: "flex",
                      alignItems:
                        "center",
                      gap: 5,
                    }}
                  >
                    <span>⚠</span>
                    {ngFeedback[s.id]}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
