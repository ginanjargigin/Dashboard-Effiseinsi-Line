import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import { saveDb } from "./src/services/jsonbinService";
import { initializeDb } from "./src/services/dbService";
import { createSaveScheduler } from "./src/services/saveService";

import { C } from "./src/constants/appConstants";

import {
  todayISO,
  monthKeyOf,
} from "./src/utils/appUtils";

import { exportDbCsv as createCsvExport } from "./src/utils/csvUtils";
import { useAppActions } from "./src/hooks/useAppActions";
import SheetTabs from "./src/components/layout/SheetTabs";
import InputView from "./src/components/input/InputView";
import SettingsView from "./src/components/settings/SettingsView";
import TopBar from "./src/components/layout/TopBar";
import DashboardView from "./src/components/dashboard/DashboardView";
import GlobalStyle from "./src/components/layout/GlobalStyle";

import {
  AlertTriangle,
} from "lucide-react";


/* ----------------------------------- App ------------------------------------- */

export default function App() {
  const [db, setDb] = useState(null);
  const [sheetId, setSheetId] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [view, setView] = useState("input");
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveState, setSaveState] = useState("idle");

  const mk = monthKeyOf(date);

  useEffect(() => {
    (async () => {
      try {
        const remote = await initializeDb();

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

  const saveSchedulerRef = useRef(null);

  if (!saveSchedulerRef.current) {
    saveSchedulerRef.current = createSaveScheduler({
      saveDb,
      setSaveState,
      delay: 600,
    });
  }

  const scheduleSave = (nextDb) => {
    saveSchedulerRef.current.schedule(nextDb);
  };

  useEffect(() => {
    return () => {
      saveSchedulerRef.current?.cancel();
    };
  }, []);

  const exportDbCsv = () => {
    createCsvExport(db, todayISO());
  };

  const monthData = (db && db.months[mk]) || {};
 const {
  updateEntry,
  updateNote,
  clearEntry,
  addSheet,
  removeSheet,
  updateSheetName,
  addMetric,
  updateMetric,
  removeMetric,
  moveSheet,
} = useAppActions({
  setDb,
  setSheetId,
  sheetId,
  mk,
  scheduleSave,
});
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
        <AlertTriangle
          color={C.bad}
          size={28}
        />

        <div>{loadError}</div>
      </div>
    );
  }

  const sheets = db.sheets;

  const currentSheet =
    sheets.find((s) => s.id === sheetId) ||
    sheets[0];

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
