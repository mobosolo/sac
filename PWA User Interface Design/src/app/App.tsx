import { useState, useEffect } from "react";
import { PenLine, History, BarChart3 } from "lucide-react";
import { SaisieTab } from "./components/SaisieTab";
import { HistoriqueTab, type TransportEntry } from "./components/HistoriqueTab";
import { ResumeTab } from "./components/ResumeTab";

type Tab = "saisie" | "historique" | "resume";

const STORAGE_KEY = "agbant_transport_entries";

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: "saisie", label: "Saisie", icon: <PenLine size={22} strokeWidth={2} /> },
  { value: "historique", label: "Historique", icon: <History size={22} strokeWidth={2} /> },
  { value: "resume", label: "Résumé", icon: <BarChart3 size={22} strokeWidth={2} /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("saisie");
  const [entries, setEntries] = useState<TransportEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp),
      }));
    } catch (e) {
      console.error("Failed to parse saved entries", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleSave = ({ name, low, high }: { name: string; low: number; high: number }) => {
    const entry: TransportEntry = {
      id: crypto.randomUUID(),
      name,
      low,
      high,
      timestamp: new Date(),
    };
    setEntries((prev) => [...prev, entry]);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet enregistrement ?")) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(entries, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div
      style={{
        background: "#0F172A",
        minHeight: "100dvh",
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
        overflow: "hidden",
      }}
    >
      {/* Tab content */}
      <div style={{ paddingBottom: 80, minHeight: "100dvh" }}>
        {activeTab === "saisie" && <SaisieTab onSave={handleSave} />}
        {activeTab === "historique" && (
          <HistoriqueTab entries={entries} onDelete={handleDelete} onExport={handleExport} />
        )}
        {activeTab === "resume" && <ResumeTab entries={entries} />}
      </div>

      {/* Bottom navigation */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          zIndex: 50,
          background: "rgba(15,23,42,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(148,163,184,0.1)",
        }}
      >
        <div style={{ display: "flex", paddingBottom: 8 }}>
          {TABS.map(({ value, label, icon }) => {
            const active = activeTab === value;
            return (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  paddingTop: 12,
                  paddingBottom: 8,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                {active && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      width: 32,
                      height: 2,
                      background: "#10B981",
                      borderRadius: "0 0 4px 4px",
                    }}
                  />
                )}
                <div
                  style={{
                    color: active ? "#10B981" : "#475569",
                    transition: "color 0.2s, transform 0.2s",
                    transform: active ? "scale(1.1)" : "scale(1)",
                    display: "flex",
                  }}
                >
                  {icon}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: active ? 700 : 500,
                    color: active ? "#10B981" : "#475569",
                    transition: "color 0.2s",
                    letterSpacing: "0.02em",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
