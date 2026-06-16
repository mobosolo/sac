import { useState, useMemo } from "react";
import { TrendingUp, Users, Briefcase, Package } from "lucide-react";
import type { TransportEntry } from "./HistoriqueTab";

interface ResumeTabProps {
  entries: TransportEntry[];
}

type Period = "today" | "week" | "month" | "all";

const PERIOD_LABELS: { value: Period; label: string }[] = [
  { value: "today", label: "Auj." },
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
  { value: "all", label: "Tout" },
];

export function ResumeTab({ entries }: ResumeTabProps) {
  const [period, setPeriod] = useState<Period>("today");

  const filtered = useMemo(() => {
    const now = new Date();
    return entries.filter((e) => {
      const d = e.timestamp;
      if (period === "today") {
        return d.toDateString() === now.toDateString();
      }
      if (period === "week") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return d >= startOfWeek;
      }
      if (period === "month") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [entries, period]);

  const byCarrier = useMemo(() => {
    const map = new Map<string, { low: number; high: number; count: number }>();
    for (const e of filtered) {
      const k = e.name;
      if (!map.has(k)) map.set(k, { low: 0, high: 0, count: 0 });
      const v = map.get(k)!;
      v.low += e.low;
      v.high += e.high;
      v.count += 1;
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v, total: v.low * 250 + v.high * 500 }))
      .sort((a, b) => b.total - a.total);
  }, [filtered]);

  const grandTotal = byCarrier.reduce((s, c) => s + c.total, 0);
  const totalLow = byCarrier.reduce((s, c) => s + c.low, 0);
  const totalHigh = byCarrier.reduce((s, c) => s + c.high, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pb-40">
        {/* Header */}
        <div className="px-5 pt-14 pb-4">
          <h2 className="text-white" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px" }}>
            Résumé
          </h2>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: 13 }}>
            Vue consolidée par porteur
          </p>
        </div>

        {/* Period filter */}
        <div className="px-5 mb-5">
          <div
            className="flex rounded-2xl p-1"
            style={{ background: "#1E293B" }}
          >
            {PERIOD_LABELS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className="flex-1 rounded-xl py-2.5 transition-all"
                style={{
                  background: period === value ? "#10B981" : "transparent",
                  color: period === value ? "#ffffff" : "#94A3B8",
                  fontSize: 14,
                  fontWeight: period === value ? 700 : 500,
                  border: "none",
                  transition: "all 0.2s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="px-5 flex gap-3 mb-5">
          <StatPill icon={<Users size={14} />} label="Porteurs" value={byCarrier.length} color="#10B981" />
          <StatPill icon={<Briefcase size={14} />} label="Sac BAS" value={totalLow} color="#60A5FA" />
          <StatPill icon={<Package size={14} />} label="Sac HAUT" value={totalHigh} color="#A78BFA" />
        </div>

        {/* Table */}
        {byCarrier.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 px-8">
            <TrendingUp size={40} style={{ color: "#334155" }} />
            <p className="text-center text-slate-500" style={{ fontSize: 15 }}>
              Aucun transport pour cette période.
            </p>
          </div>
        ) : (
          <div className="px-5 flex flex-col gap-2">
            {/* Table header */}
            <div
              className="flex items-center px-4 py-2 rounded-xl"
              style={{ background: "transparent" }}
            >
              <span className="flex-1 text-slate-500" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Porteur
              </span>
              <span className="w-14 text-center text-slate-500" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Bas
              </span>
              <span className="w-14 text-center text-slate-500" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Haut
              </span>
              <span className="w-24 text-right text-slate-500" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Total
              </span>
            </div>

            {byCarrier.map((carrier, i) => {
              const pct = grandTotal > 0 ? (carrier.total / grandTotal) * 100 : 0;
              return (
                <div
                  key={carrier.name}
                  className="rounded-2xl px-4 py-3"
                  style={{
                    background: "#1E293B",
                    border: "1.5px solid rgba(148,163,184,0.1)",
                  }}
                >
                  <div className="flex items-center">
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                      <div
                        className="rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          width: 34,
                          height: 34,
                          background: `rgba(16,185,129,${0.08 + (0.12 * (byCarrier.length - i)) / byCarrier.length})`,
                          color: "#10B981",
                          fontSize: 14,
                          fontWeight: 800,
                        }}
                      >
                        {carrier.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white truncate" style={{ fontSize: 15, fontWeight: 700 }}>
                          {carrier.name}
                        </div>
                        <div className="text-slate-500" style={{ fontSize: 11 }}>
                          {carrier.count} course{carrier.count > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    <div className="w-14 text-center" style={{ color: "#60A5FA", fontSize: 15, fontWeight: 700 }}>
                      {carrier.low}
                    </div>
                    <div className="w-14 text-center" style={{ color: "#A78BFA", fontSize: 15, fontWeight: 700 }}>
                      {carrier.high}
                    </div>
                    <div className="w-24 text-right" style={{ color: "#10B981", fontSize: 15, fontWeight: 800, letterSpacing: "-0.5px" }}>
                      {carrier.total.toLocaleString("fr-FR")}
                      <span style={{ fontSize: 10, fontWeight: 600 }}> F</span>
                    </div>
                  </div>
                  {/* progress bar */}
                  <div className="mt-2.5 rounded-full overflow-hidden" style={{ height: 3, background: "rgba(148,163,184,0.1)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, #10B981, #34D399)",
                        transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grand total footer */}
      <div
        className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-4"
        style={{
          background: "linear-gradient(0deg, #0F172A 60%, transparent)",
          paddingBottom: "calc(20px + 80px)",
        }}
      >
        <div
          className="rounded-2xl px-5 py-4 flex items-center justify-between"
          style={{
            background: "#1E293B",
            border: "1.5px solid rgba(16,185,129,0.25)",
            boxShadow: "0 0 40px rgba(16,185,129,0.08)",
          }}
        >
          <div>
            <div className="text-slate-400" style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Total période
            </div>
            <div className="text-slate-500 mt-0.5" style={{ fontSize: 12 }}>
              {filtered.length} transport{filtered.length > 1 ? "s" : ""}
            </div>
          </div>
          <div style={{ color: "#10B981", fontSize: 32, fontWeight: 900, letterSpacing: "-1.5px" }}>
            {grandTotal.toLocaleString("fr-FR")}
            <span style={{ fontSize: 16, fontWeight: 700 }}> FCFA</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="flex-1 rounded-xl px-3 py-3 flex flex-col gap-1"
      style={{ background: "#1E293B", border: "1.5px solid rgba(148,163,184,0.08)" }}
    >
      <div className="flex items-center gap-1.5" style={{ color: "#64748B" }}>
        {icon}
        <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ color, fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>
        {value}
      </div>
    </div>
  );
}
