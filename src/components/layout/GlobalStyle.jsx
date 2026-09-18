import { C } from "../../constants/appConstants";
export default function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
            :root {
            
  /* =========================================
   THEME: FACTORY AMBER
   Default theme
   ========================================= */

:root {
  --color-bg: #1A1D20;
  --color-panel: #232729;
  --color-panel-2: #2B3033;
  --color-line: #383E42;

  --color-accent: #F2A93B;
  --color-accent-soft: rgba(242, 169, 59, 0.12);
  --color-accent-focus: rgba(242, 169, 59, 0.18);
  --color-accent-shadow: rgba(242, 169, 59, 0.30);

  --color-input: #2B3033;
  --color-card-shadow: rgba(0, 0, 0, 0.20);
  --color-accent-text: #1A1D20;
  --color-hover: rgba(255, 255, 255, 0.04);

  --color-steel: #6C93B0;

  --color-text: #ECEEEF;
  --color-muted: #8C949A;
}


/* =========================================
   THEME: MIDNIGHT CYAN
   ========================================= */

[data-theme="midnight"] {
  --color-bg: #0B1220;
  --color-panel: #111B2D;
  --color-panel-2: #17243A;
  --color-line: #2B3B50;

  --color-accent: #38BDF8;
  --color-accent-soft: rgba(56, 189, 248, 0.12);
  --color-accent-focus: rgba(56, 189, 248, 0.18);
  --color-accent-shadow: rgba(56, 189, 248, 0.30);

  --color-input: #17243A;
  --color-card-shadow: rgba(0, 0, 0, 0.35);
  --color-accent-text: #06131A;
  --color-hover: rgba(125, 211, 252, 0.06);

  --color-steel: #7DD3FC;

  --color-text: #E6F4FF;
  --color-muted: #94A9BD;
}


/* =========================================
   THEME: LIGHT CORPORATE
   ========================================= */

[data-theme="light"] {
  --color-bg: #F3F5F7;
  --color-panel: #FFFFFF;
  --color-panel-2: #EEF1F4;
  --color-line: #D8DEE5;

  --color-accent: #2563EB;
  --color-accent-soft: rgba(37, 99, 235, 0.10);
  --color-accent-focus: rgba(37, 99, 235, 0.16);
  --color-accent-shadow: rgba(37, 99, 235, 0.22);

  --color-input: #F8FAFC;
  --color-card-shadow: rgba(15, 23, 42, 0.08);
  --color-accent-text: #FFFFFF;
  --color-hover: rgba(37, 99, 235, 0.05);

  --color-steel: #47718F;

  --color-text: #18212B;
  --color-muted: #687481;
}
}
      * { box-sizing: border-box; }
            body {
        margin: 0;
        background: var(--color-bg);
        color: var(--color-text);
        transition:
          background-color 0.25s ease,
          color 0.25s ease;
      }
      :root,
      [data-theme="midnight"] {
        color-scheme: dark;
      }
      
      [data-theme="light"] {
        color-scheme: light;
      }
      .num-field {
        font-family: 'IBM Plex Mono', monospace;
        font-variant-numeric: tabular-nums;
      }
      /* ATURAN BARU: Mengubah background menjadi hijau transparan 50% saat input dipilih */
      .num-field-input:focus {
  background-color: var(--color-accent-soft) !important;
  border-color: var(--color-accent) !important;
  box-shadow: 0 0 0 2px var(--color-accent-focus) !important;
}
 .note-field:focus {
  border-color: var(--color-accent) !important;
  background-color: var(--color-accent-soft) !important;
  box-shadow: 0 0 0 2px var(--color-accent-focus) !important;
}
      button:hover{
    transform:translateY(-2px);
    transition:.2s;
}

button:active{
    transform:scale(.96);
}
/* Scrollbar global */
::-webkit-scrollbar {
  height: 6px;
  width: 6px;
  background: transparent;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: ${C.line};
  border-radius: 6px;
}


/* =========================================
   SCROLLBAR KHUSUS KATEGORI / SHEET TABS
   ========================================= */

.sheet-tabs-scroll {
  scrollbar-width: thin;
  scrollbar-color: ${C.line} transparent;
}

/* Chrome / Edge / Safari */
.sheet-tabs-scroll::-webkit-scrollbar {
  height: 6px;
  background: transparent;
}

.sheet-tabs-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.sheet-tabs-scroll::-webkit-scrollbar-thumb {
  background: ${C.line};
  border-radius: 6px;
}

/* Saat pointer masuk ke area kategori */
.sheet-tabs-scroll:hover::-webkit-scrollbar-thumb {
  background: #777;
}

.sheet-tabs-scroll:hover::-webkit-scrollbar {
  height: 12px;
}

.sheet-tabs-scroll:hover::-webkit-scrollbar-track {
  background: transparent;
}

.sheet-tabs-scroll:hover::-webkit-scrollbar-thumb {
  background: #777;
  border-radius: 8px;
}

/* Saat pointer tepat di atas scrollbar */
.sheet-tabs-scroll::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
      @media print {
        .no-print { display: none !important; }
        body, .print-area { background: #fff !important; color: #111 !important; }
        .print-area * { color: #111 !important; }
        .print-card { border: 1px solid #ccc !important; background: #fff !important; }
      }
    `}</style>
  );
}
