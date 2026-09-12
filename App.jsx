import {
  fetchDb,
  saveDb,
} from "./src/services/jsonbinService";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import { C } from "./src/constants/appConstants";
import SheetTabs from "./src/components/layout/SheetTabs";
import InputView from "./src/components/input/InputView";
import SettingsView from "./src/components/settings/SettingsView";
import TopBar from "./src/components/layout/TopBar";
import DashboardView from "./src/components/dashboard/DashboardView";
import GlobalStyle from "./src/components/layout/GlobalStyle";

import {
  uid,
  todayISO,
  monthKeyOf,
  qtyStd,
  pctAct,
} from "./src/utils/appUtils";

import {
  updateEntryInDb,
  updateNoteInDb,
  clearEntryInDb,
} from "./src/utils/monthDataUtils";

import { DEFAULT_SHEETS } from "./src/data/defaultSheets";

import {
  AlertTriangle,
} from "lucide-react";

import { exportDbCsv as createCsvExport } from "./src/utils/csvUtils";

import {
  createSheet,
  addSheetToDb,
  removeSheetFromDb,
  updateSheetNameInDb,
  addMetricToDb,
  updateMetricInDb,
  removeMetricFromDb,
  moveSheetInDb,
} from "./src/utils/sheetUtils";



/* ----------------------------------- App ------------------------------------- */
export default function App() {
  const [db, setDb] = useState(null);
  const [sheetId, setSheetId] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [view, setView] = useState("input");
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveState, setSaveState] = useState("idle");
  const saveTimer = useRef(null);
  const mk = monthKeyOf(date);

   useEffect(() => {
    (async () => {
      try {
        let remote = await fetchDb();

        if (!remote || !remote.sheets || remote.sheets.length === 0) {
          remote = { sheets: DEFAULT_SHEETS, months: {} };
          await saveDb(remote);
        }

        if (!remote.months) remote.months = {};

        setDb(remote);
        setSheetId(remote.sheets[0].id);
        setReady(true);

      } catch (e) {
        console.error("JSONBin connection error:", e);

        let message =
          "Tidak dapat terhubung ke server JSONBin. Periksa koneksi internet.";

        if (e?.type === "ACCESS_KEY_INVALID") {
          message =
            "Access Key JSONBin tidak valid. Periksa Access Key yang digunakan aplikasi.";
        } else if (e?.type === "ACCESS_DENIED") {
          message =
            "Akses ke Bin JSONBin ditolak. Periksa izin Access Key.";
        } else if (e?.type === "BIN_NOT_FOUND") {
          message =
            "Bin JSONBin tidak ditemukan. Periksa Bin ID.";
        } else if (e?.type === "RATE_LIMIT") {
          message =
            "Terlalu banyak permintaan ke JSONBin. Silakan coba lagi beberapa saat.";
        } else if (e?.type === "SERVER_ERROR") {
          message =
            `JSONBin sedang mengalami gangguan (HTTP ${e.status}). Data kamu tidak hilang. Silakan coba lagi beberapa saat.`;
        } else if (e?.type === "INVALID_RESPONSE") {
          message =
            "JSONBin memberikan respons yang tidak valid. Silakan coba lagi.";
        }

        setLoadError(message);
        setReady(true);
      }
    })();
  }, []);

  const scheduleSave = useCallback((nextDb) => {
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveDb(nextDb);
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
      setTimeout(() => setSaveState("idle"), 1500);
    }, 600);
  }, []);

const exportDbCsv = () => {
  createCsvExport(db, todayISO());
};

    const monthData = (db && db.months[mk]) || {};

 const updateEntry = (sId, d, metricId, field, raw) => {
  setDb((prev) => {
    const next = updateEntryInDb(
      prev,
      mk,
      sId,
      d,
      metricId,
      field,
      raw
    );

    scheduleSave(next);

    return next;
  });
};

 const updateNote = (sId, d, note) => {
  setDb((prev) => {
    const next = updateNoteInDb(
      prev,
      mk,
      sId,
      d,
      note
    );

    scheduleSave(next);

    return next;
  });
};

     const clearEntry = (sId, d) => {
  setDb((prev) => {
    const next = clearEntryInDb(
      prev,
      mk,
      sId,
      d
    );

    scheduleSave(next);

    return next;
  });
};

const addSheet = (name) => {
  const s = createSheet(name);

  setDb((prev) => {
    const next = addSheetToDb(prev, s);

    scheduleSave(next);

    return next;
  });

  setSheetId(s.id);
};

 const removeSheet = (sId) => {
  setDb((prev) => {
    const next = removeSheetFromDb(prev, sId);

    scheduleSave(next);

    if (sheetId === sId && next.sheets.length) {
      setSheetId(next.sheets[0].id);
    }

    return next;
  });
};

 const updateSheetName = (sId, name) => {
  setDb((prev) => {
    const next = updateSheetNameInDb(prev, sId, name);

    scheduleSave(next);

    return next;
  });
};

    const addMetric = (sId) => {
  setDb((prev) => {
    const next = addMetricToDb(prev, sId);

    scheduleSave(next);

    return next;
  });
};

    const updateMetric = (sId, mId, field, value) => {
  setDb((prev) => {
    const next = updateMetricInDb(
      prev,
      sId,
      mId,
      field,
      value
    );

    scheduleSave(next);

    return next;
  });
};
  
  const removeMetric = (sId, mId) => {
  setDb((prev) => {
    const next = removeMetricFromDb(prev, sId, mId);

    scheduleSave(next);

    return next;
  });
};
  
   const moveSheet = (sId, direction) => {
  setDb((prev) => {
    const next = moveSheetInDb(
      prev,
      sId,
      direction
    );

    scheduleSave(next);

    return next;
  });
};

  if (!ready || (!db && !loadError)) {
    return (
      <div
        style={{
          background: C.bg,
          color: C.text,
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Memuat papan efisiensi…
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        style={{
          background: C.bg,
          color: C.text,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
          padding: 24,
          textAlign: "center",
        }}
      >
        <AlertTriangle color={C.bad} size={28} />
        <div>{loadError}</div>
      </div>
    );
  }

  const sheets = db.sheets;
  const currentSheet =
    sheets.find((s) => s.id === sheetId) || sheets[0];

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        color: C.text,
        fontFamily: "'Inter', sans-serif",
        paddingBottom: 24,
      }}
    >
      <GlobalStyle />

      <TopBar
        view={view}
        setView={setView}
        saveState={saveState}
      />

      <SheetTabs
        sheets={sheets}
        sheetId={sheetId}
        setSheetId={setSheetId}
      />

      {view === "input" && (
        <InputView
          sheet={currentSheet}
          date={date}
          setDate={setDate}
          monthData={monthData}
          updateEntry={updateEntry}
          updateNote={updateNote}
          clearEntry={clearEntry}
        />
      )}

      {view === "dashboard" && (
        <DashboardView
          sheets={sheets}
          sheetId={sheetId}
          setSheetId={setSheetId}
          mk={mk}
          setDate={setDate}
          monthData={monthData}
          exportDbCsv={exportDbCsv}
        />
      )}

      {view === "settings" && (
        <SettingsView
          sheets={sheets}
          addSheet={addSheet}
          removeSheet={removeSheet}
          updateSheetName={updateSheetName}
          addMetric={addMetric}
          updateMetric={updateMetric}
          removeMetric={removeMetric}
          moveSheet={moveSheet}
        />
      )}
    </div>
  );
}

