import { useState } from "react";
import { Plus, Minus, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SaisieTabProps {
  onSave: (entry: { name: string; low: number; high: number }) => void;
}

export function SaisieTab({ onSave }: SaisieTabProps) {
  const [name, setName] = useState("");
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);
  const [saved, setSaved] = useState(false);

  const total = low * 250 + high * 500;

  const adjust = (type: "low" | "high", delta: number) => {
    if (type === "low") setLow((v) => Math.max(0, v + delta));
    else setHigh((v) => Math.max(0, v + delta));
  };

  const handleSave = () => {
    if (!name.trim() || (low === 0 && high === 0)) return;
    onSave({ name: name.trim(), low, high });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setName("");
      setLow(0);
      setHigh(0);
    }, 1200);
  };

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-4">
      {/* Header */}
      <div
        className="px-5 pt-14 pb-5 flex items-start justify-between"
        style={{ background: "linear-gradient(180deg, #0F172A 70%, transparent)" }}
      >
        <div>
          <h1
            className="text-white tracking-tight"
            style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px" }}
          >
            Saisie des Sacs
          </h1>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: 13 }}>
            Enregistrement quotidien
          </p>
        </div>
        <div
          className="px-3 py-1.5 rounded-full"
          style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}
        >
          <span style={{ color: "#10B981", fontSize: 12, fontWeight: 600 }}>
            {today.charAt(0).toUpperCase() + today.slice(1)}
          </span>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Name input */}
        <div>
          <label className="text-slate-400 mb-2 block" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Nom du porteur
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Malien, Lau, Cha..."
            className="w-full rounded-2xl px-5 text-white placeholder-slate-500 outline-none transition-all"
            style={{
              background: "#1E293B",
              border: "1.5px solid rgba(148,163,184,0.12)",
              height: 56,
              fontSize: 17,
              fontWeight: 500,
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(16,185,129,0.5)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(148,163,184,0.12)")}
          />
        </div>

        {/* Sac BAS */}
        <CounterCard
          label="Sac BAS"
          sublabel="250 FCFA / unité"
          value={low}
          onAdjust={(d) => adjust("low", d)}
          color="#60A5FA"
        />

        {/* Sac HAUT */}
        <CounterCard
          label="Sac HAUT"
          sublabel="500 FCFA / unité"
          value={high}
          onAdjust={(d) => adjust("high", d)}
          color="#A78BFA"
        />

        {/* Total banner */}
        <div
          className="rounded-2xl px-5 py-4 flex items-center justify-between"
          style={{
            background: total > 0 ? "rgba(16,185,129,0.12)" : "#1E293B",
            border: `1.5px solid ${total > 0 ? "rgba(16,185,129,0.35)" : "rgba(148,163,184,0.12)"}`,
            transition: "all 0.3s",
          }}
        >
          <span className="text-slate-400" style={{ fontSize: 14, fontWeight: 500 }}>
            Montant estimé
          </span>
          <motion.span
            key={total}
            initial={{ scale: 0.85, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              color: total > 0 ? "#10B981" : "#94A3B8",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            {total.toLocaleString("fr-FR")} FCFA
          </motion.span>
        </div>

        {/* CTA */}
        <button
          onClick={handleSave}
          disabled={!name.trim() || (low === 0 && high === 0)}
          className="w-full rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
          style={{
            height: 64,
            background:
              !name.trim() || (low === 0 && high === 0)
                ? "#1E293B"
                : saved
                ? "#059669"
                : "#10B981",
            color:
              !name.trim() || (low === 0 && high === 0) ? "#475569" : "#ffffff",
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: "-0.2px",
            cursor: !name.trim() || (low === 0 && high === 0) ? "not-allowed" : "pointer",
            transition: "all 0.25s",
            border: "none",
          }}
        >
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.span
                key="saved"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2"
              >
                <CheckCircle size={20} />
                Enregistré !
              </motion.span>
            ) : (
              <motion.span
                key="save"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                Enregistrer le transport
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}

function CounterCard({
  label,
  sublabel,
  value,
  onAdjust,
  color,
}: {
  label: string;
  sublabel: string;
  value: number;
  onAdjust: (d: number) => void;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl px-5 py-4"
      style={{
        background: "#1E293B",
        border: "1.5px solid rgba(148,163,184,0.12)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-white" style={{ fontSize: 17, fontWeight: 700 }}>
            {label}
          </div>
          <div className="text-slate-500" style={{ fontSize: 13 }}>
            {sublabel}
          </div>
        </div>
        <div
          className="px-3 py-1 rounded-full"
          style={{ background: `${color}20`, color, fontSize: 13, fontWeight: 700 }}
        >
          {value > 0 ? `${value} sac${value > 1 ? "s" : ""}` : "—"}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onPointerDown={() => onAdjust(-1)}
          className="flex items-center justify-center rounded-xl transition-all active:scale-90"
          style={{
            width: 60,
            height: 60,
            background: value === 0 ? "#0F172A" : "#334155",
            color: value === 0 ? "#334155" : "#F1F5F9",
            border: "none",
            fontSize: 24,
            flex: "0 0 auto",
          }}
        >
          <Minus size={22} strokeWidth={2.5} />
        </button>
        <motion.div
          key={value}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex-1 text-center text-white"
          style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-2px", lineHeight: 1 }}
        >
          {value}
        </motion.div>
        <button
          onPointerDown={() => onAdjust(1)}
          className="flex items-center justify-center rounded-xl transition-all active:scale-90"
          style={{
            width: 60,
            height: 60,
            background: color + "22",
            color: color,
            border: `1.5px solid ${color}44`,
            fontSize: 24,
            flex: "0 0 auto",
          }}
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
