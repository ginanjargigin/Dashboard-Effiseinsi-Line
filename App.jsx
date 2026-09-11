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
  clampInt,
  qtyStd,
  pctAct,
} from "./src/utils/appUtils";
import { exportDbCsv as createCsvExport } from "./src/utils/csvUtils";

import { DEFAULT_SHEETS } from "./src/data/defaultSheets";

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


