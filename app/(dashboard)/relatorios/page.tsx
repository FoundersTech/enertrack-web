"use client";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useDevices } from "@/hooks/use-devices";
import { useReadings } from "@/hooks/use-readings";
import { buildWeeklyData, formatKwh } from "@/lib/energy";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { TrendingUp } from "lucide-react";

export default function Relatorios() {
  const tabs = ["Resumo", "Consumo", "Custo", "Comparativo"];
  const { devices } = useDevices();
  const selectedDevice = devices[0] ?? null;
  const { readings } = useReadings({ deviceId: selectedDevice?.id ?? null, interval: 30000, limit: 500 });
  const weeklyData = buildWeeklyData(readings);
  const totalKwh = weeklyData.reduce((sum, item) => sum + item.value, 0);
  const values = weeklyData.map((item) => item.value);
  const avgDaily = values.length ? totalKwh / values.length : 0;
  const maxConsumption = values.length ? Math.max(...values) : 0;
  const minConsumption = values.length ? Math.min(...values) : 0;
  const previousTotal = weeklyData.slice(0, 3).reduce((sum, item) => sum + item.value, 0);
  const currentTotal = weeklyData.slice(4).reduce((sum, item) => sum + item.value, 0);
  const variation = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar title="Relatórios" subtitle="Gere relatórios e análises detalhadas." />
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "var(--bg-card)", borderRadius: 12, padding: 4, border: "1px solid var(--border)", width: "fit-content" }}>
            {tabs.map((t, i) => (
              <button key={t} style={{
                background: i === 1 ? "var(--accent)" : "transparent",
                color: i === 1 ? "#0d1117" : "var(--text-secondary)",
                border: "none", borderRadius: 8, padding: "7px 18px",
                fontWeight: i === 1 ? 700 : 400, fontSize: 13, cursor: "pointer",
              }}>{t}</button>
            ))}
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>Consumo de energia</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Últimos 7 dias • {selectedDevice?.name ?? "sem dispositivo"}</div>
              </div>
            </div>
            <div style={{ fontSize: 48, fontWeight: 800, color: "var(--accent)", marginBottom: 4 }}>
              {totalKwh.toFixed(2)} <span style={{ fontSize: 20, fontWeight: 500 }}>kWh</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Total no período calculado a partir das leituras no D1</div>
            
            <div style={{ marginTop: 20 }}>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: "var(--accent)" }}
                    labelStyle={{ color: "var(--text-secondary)" }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {weeklyData.map((_, i) => (
                      <Cell key={i} fill={i === 6 ? "#00e5a0" : "#2d3748"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Resumo do período</div>
            <div style={{ display: "flex", gap: 14 }}>
              {[
                { label: "Média diária", value: formatKwh(avgDaily), color: "var(--text-primary)" },
                { label: "Maior consumo", value: formatKwh(maxConsumption), color: "var(--red)" },
                { label: "Menor consumo", value: formatKwh(minConsumption), color: "var(--accent)" },
                { label: "Variação", value: `${variation >= 0 ? "+" : ""}${variation.toFixed(1)}%`, color: variation >= 0 ? "var(--accent)" : "var(--red)", icon: true },
              ].map((s, i) => (
                <div key={i} style={{
                  flex: 1, background: "var(--bg-secondary)", borderRadius: 12,
                  padding: "14px 16px", border: "1px solid var(--border)",
                }}>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.color, display: "flex", alignItems: "center", gap: 4 }}>
                    {s.icon && <TrendingUp size={14} />}
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button style={{
            width: "100%", padding: 14, background: "var(--accent)", color: "#0d1117",
            border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>
            Exportar relatório
          </button>
        </div>
      </div>
    </div>
  );
}
