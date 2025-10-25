import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Landmark,
  MapPin,
  RefreshCcw,
  Download,
} from "lucide-react";

function timeAgo(iso) {
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "hace unos segundos";
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const days = Math.floor(h / 24);
  if (days <= 7) return `hace ${days} día${days > 1 ? "s" : ""}`;
  return d.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
}

export default function Reportes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchHistorial = async () => {
    try {
      setLoading(true);
      setErr("");
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/registros?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setItems(json.items ?? []);
    } catch (e) {
      console.error(e);
      setErr("No se pudo cargar el historial. Revisa tu sesión.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  const rowsForExport = () =>
    (items ?? []).map((it) => ({
      ID: it.id,
      Usuario: it.username,
      Texto: it.texto_busqueda ?? "",
      Tipo: it.tipo ?? "",
      Longitud: Number(it.lng ?? 0),
      Latitud: Number(it.lat ?? 0),
      FechaISO: new Date(it.creado_en).toISOString(),
      FechaLocal: new Date(it.creado_en).toLocaleString("es-ES"),
    }));

  const exportCSV = (rows) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
    ].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `historial_${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = async () => {
    try {
      setExporting(true);
      const rows = rowsForExport();
      if (!rows.length) return;

      // intenta usar XLSX; si no está instalado, cae a CSV
      try {
        const XLSX = await import("xlsx"); // npm i xlsx
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Historial");
        const date = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `historial_${date}.xlsx`);
      } catch (e) {
        console.warn("xlsx no disponible, exportando CSV. Para .xlsx: npm i xlsx");
        exportCSV(rows);
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Header */}
      <header className="h-14 px-4 flex items-center justify-between bg-neutral-900/80 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 rounded-lg hover:bg-white/10">
            <ArrowLeft className="h-5 w-5 text-neutral-300" />
          </Link>
          <h1 className="font-extrabold text-lg tracking-wider">
            Historial de Actividad
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistorial}
            className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 hover:bg-emerald-500/30"
            title="Refrescar"
          >
            <RefreshCcw className="h-4 w-4" /> Refrescar
          </button>
          <button
            onClick={exportExcel}
            disabled={exporting || loading || (items ?? []).length === 0}
            className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-neutral-800/60 border border-white/10 hover:bg-neutral-800/80 disabled:opacity-50"
            title="Descargar Excel"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Descargar Excel
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="flex items-center gap-2 text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando historial...
          </div>
        ) : err ? (
          <p className="text-red-400">{err}</p>
        ) : items.length === 0 ? (
          <p className="text-neutral-400">Aún no hay actividad.</p>
        ) : (
          <div className="space-y-2">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-center justify-between bg-neutral-800/60 border border-white/10 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {it.tipo === "unesco" ? (
                    <Landmark className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <MapPin className="h-5 w-5 text-orange-400" />
                  )}
                  <div className="text-sm">
                    <div className="font-medium">
                      <span className="text-emerald-300">{it.username}</span>{" "}
                      buscó{" "}
                      <span className="text-white">
                        {it.texto_busqueda ||
                          `(${Number(it.lat).toFixed(4)}, ${Number(it.lng).toFixed(4)})`}
                      </span>
                      {it.tipo ? (
                        <span className="text-neutral-400"> · {it.tipo}</span>
                      ) : null}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {timeAgo(it.creado_en)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
