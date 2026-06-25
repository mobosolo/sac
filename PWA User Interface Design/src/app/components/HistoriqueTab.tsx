import { Trash2, Briefcase, Package, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface TransportEntry {
  id: string;
  name: string;
  low: number;
  high: number;
  timestamp: Date;
}

interface HistoriqueTabProps {
  entries: TransportEntry[];
  onDelete: (id: string) => void;
  onExport: () => void;
}

export function HistoriqueTab({ entries, onDelete, onExport }: HistoriqueTabProps) {
  const grouped = groupByDay(entries);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-8">
        <div
          className="rounded-full flex items-center justify-center"
          style={{ width: 80, height: 80, background: "#1E293B" }}
        >
          <Briefcase size={36} style={{ color: "#334155" }} />
        </div>
        <p className="text-center text-slate-500" style={{ fontSize: 16 }}>
          Aucun transport enregistré.{"\n"}Commencez par la saisie !
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-14 pb-5 flex items-start justify-between">
        <div>
          <h2 className="text-white" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px" }}>
            Historique
          </h2>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: 13 }}>
            {entries.length} transport{entries.length > 1 ? "s" : ""} enregistré{entries.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Bouton Export */}
        <button
          onClick={onExport}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 12,
            background: "rgba(16,185,129,0.12)",
            border: "1.5px solid rgba(16,185,129,0.3)",
            color: "#10B981",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Download size={15} />
          Sauvegarder
        </button>
      </div>

      <div className="px-5 flex flex-col gap-6 pb-6">
        {grouped.map(({ label, items }) => (
          <div key={label}>
            <div
              className="mb-3 px-1"
              style={{
                color: "#64748B",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {label}
            </div>
            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {items.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} onDelete={onDelete} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntryCard({
  entry,
  onDelete,
}: {
  entry: TransportEntry;
  onDelete: (id: string) => void;
}) {
  const total = entry.low * 250 + entry.high * 500;
  const time = entry.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
      className="rounded-2xl px-4 py-4 flex items-center gap-3"
      style={{
        background: "#1E293B",
        border: "1.5px solid rgba(148,163,184,0.1)",
      }}
    >
      {/* Avatar */}
      <div
        className="rounded-xl flex items-center justify-center shrink-0"
        style={{
          width: 46,
          height: 46,
          background: "rgba(16,185,129,0.15)",
          color: "#10B981",
          fontSize: 18,
          fontWeight: 800,
        }}
      >
        {entry.name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-white truncate" style={{ fontSize: 16, fontWeight: 700 }}>
            {entry.name}
          </span>
          <span className="text-slate-500 shrink-0" style={{ fontSize: 12 }}>
            {time}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          {entry.low > 0 && (
            <span className="flex items-center gap-1" style={{ color: "#60A5FA", fontSize: 13, fontWeight: 600 }}>
              <Briefcase size={12} />
              {entry.low}B
            </span>
          )}
          {entry.high > 0 && (
            <span className="flex items-center gap-1" style={{ color: "#A78BFA", fontSize: 13, fontWeight: 600 }}>
              <Package size={12} />
              {entry.high}H
            </span>
          )}
          {entry.low === 0 && entry.high === 0 && (
            <span className="text-slate-500" style={{ fontSize: 13 }}>—</span>
          )}
        </div>
      </div>

      {/* Montant + Supprimer */}
      <div className="flex items-center gap-3 shrink-0">
        <span style={{ color: "#10B981", fontSize: 17, fontWeight: 800, letterSpacing: "-0.5px" }}>
          {total.toLocaleString("fr-FR")}
          <span style={{ fontSize: 11, fontWeight: 600 }}> F</span>
        </span>
        <button
          onClick={() => onDelete(entry.id)}
          className="flex items-center justify-center rounded-xl transition-all active:scale-90"
          style={{
            width: 36,
            height: 36,
            background: "rgba(239,68,68,0.1)",
            color: "#EF4444",
            border: "none",
          }}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  );
}

function groupByDay(entries: TransportEntry[]) {
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const map = new Map<string, TransportEntry[]>();

  for (const entry of [...entries].reverse()) {
    const ds = entry.timestamp.toDateString();
    let label: string;
    if (ds === todayStr) label = "Aujourd'hui";
    else if (ds === yesterdayStr) label = "Hier";
    else
      label = entry.timestamp.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });

    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(entry);
  }

  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}
