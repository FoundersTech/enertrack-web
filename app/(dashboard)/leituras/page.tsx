"use client";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useDevices } from "@/hooks/use-devices";
import { useReadings } from "@/hooks/use-readings";
import { buildChartData, formatAmps, formatWatts } from "@/lib/energy";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Activity, Zap, Radio, Gauge } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
        <div style={{ color: "var(--text-secondary)" }}>{label}</div>
        <div style={{ color: "var(--accent)", fontWeight: 600 }}>{payload[0].value} W</div>
      </div>
    );
  }
  return null;
};

export default function Leituras() {
  const { devices } = useDevices();
  const selectedDevice = devices[0] ?? null;
  const { readings, latestReading, avgWatts, maxWatts } = useReadings({
    deviceId: selectedDevice?.id ?? null,
    interval: 5000,
    limit: 120,
  });
  const minWatts = readings.length ? Math.min(...readings.map((reading) => reading.watts)) : 0;
  const chartData = buildChartData(readings);

  const metrics = [
    { label: "Potência", current: formatWatts(latestReading?.watts), min: formatWatts(minWatts), max: formatWatts(maxWatts), color: "var(--accent)", icon: Zap },
    { label: "Corrente", current: formatAmps(latestReading?.irms), min: readings.length ? formatAmps(Math.min(...readings.map((reading) => reading.irms))) : "0.00 A", max: readings.length ? formatAmps(Math.max(...readings.map((reading) => reading.irms))) : "0.00 A", color: "#e3b341", icon: Radio },
    { label: "Média", current: formatWatts(avgWatts), min: "Amostras", max: String(readings.length), color: "#58a6ff", icon: Activity },
    { label: "Frequência", current: "—", min: "Não salvo", max: "no D1", color: "#bc8cff", icon: Gauge },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar title="Leituras" subtitle="Acompanhe suas leituras em tempo real." />
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
            {metrics.slice(0,4).map((m, i) => (
              <div key={i} style={{
                flex: 1, background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "16px 20px", textAlign: "center",
              }}>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: m.color }}>{m.current}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Potência em tempo real</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 3 }}>{selectedDevice?.name ?? "Nenhum dispositivo selecionado"}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["Ao vivo", "1H", "6H", "24H", "7D", "30D"].map((t, i) => (
                  <button key={t} style={{
                    background: i === 0 ? "var(--accent-dim)" : "transparent",
                    color: i === 0 ? "var(--accent)" : "var(--text-secondary)",
                    border: `1px solid ${i === 0 ? "var(--border-accent)" : "var(--border)"}`,
                    borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer",
                  }}>{t}</button>
                ))}
              </div>
            </div>
            {chartData.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5a0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="power" stroke="#00e5a0" strokeWidth={2} fill="url(#powerGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: 13 }}>
                Nenhuma leitura encontrada no D1.
              </div>
            )}
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Métrica", "Valor atual", "Mínimo", "Máximo"].map(h => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, i) => (
                  <tr key={i} style={{ borderBottom: i < metrics.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td style={{ padding: "14px 20px", fontSize: 14, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.color }} />
                      {m.label}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 14, color: m.color, fontWeight: 700 }}>{m.current}</td>
                    <td style={{ padding: "14px 20px", fontSize: 14, color: "var(--text-secondary)" }}>{m.min}</td>
                    <td style={{ padding: "14px 20px", fontSize: 14, color: "var(--text-secondary)" }}>{m.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
