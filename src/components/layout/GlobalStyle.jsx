import { C } from "../../constants/appConstants";
export default function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
            :root {
        --color-bg: #1A1D20;
        --color-panel: #232729;
        --color-panel-2: #2B3033;
        --color-line: #383E42;
      
        --color-accent: #F2A93B;
        --color-accent-soft: rgba(242, 169, 59, 0.12);
        --color-accent-focus: rgba(242, 169, 59, 0.18);
        --color-accent-shadow: rgba(242, 169, 59, 0.30);
      
        --color-steel: #6C93B0;
      
        --color-text: #ECEEEF;
        --color-muted: #8C949A;
}
      * { box-sizing: border-box; }
      body { margin:0; }
      input[type=date] { color-scheme: dark; }
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
