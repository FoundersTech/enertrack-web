"use client";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useDevices } from "@/hooks/use-devices";
import { useReadings } from "@/hooks/use-readings";
import { useUser } from "@/hooks/use-user";
import { buildChartData, formatReadingDate, formatWatts } from "@/lib/energy";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, Flame, Activity, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";

function StatCard({ label, value, unit, icon: Icon, iconColor }: any) {
  return (
    <div style={{
      background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border)",
      padding: "18px 20px", flex: 1,
    }}>
      <div style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <Icon size={13} color={iconColor} />
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: iconColor || "var(--text-primary)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{unit}</div>
    </div>
  );
}

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

export default function Dashboard() {
  const { user } = useUser();
  const { devices, isLoading: devicesLoading } = useDevices();
  const selectedDevice = devices[0] ?? null;
  const { readings, latestReading, avgWatts, maxWatts, estimatedDailyKwh, estimatedDailyCost, isLoading: readingsLoading } = useReadings({
    deviceId: selectedDevice?.id ?? null,
    interval: 5000,
    limit: 60,
  });

  const chartData = buildChartData(readings);
  const recentReadings = readings.slice(-3).reverse();
  const isLoading = devicesLoading || readingsLoading;
  const hasDevice = devices.length > 0;
  const systemStatus = hasDevice ? "Sistema online" : "Nenhum dispositivo cadastrado";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar title="Dashboard" subtitle="Visão geral da sua energia" />
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{
            background: "linear-gradient(135deg, var(--bg-card) 0%, #1a2535 100%)",
            border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 4 }}>Olá, {user?.name?.split(" ")[0] ?? "usuário"}</div>
              <div style={{ fontWeight: 700, fontSize: 24, color: "var(--text-primary)" }}>Visão geral da sua energia</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: hasDevice ? "var(--accent)" : "var(--yellow)" }} />
                <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{systemStatus}</span>
              </div>
            </div>
            <div style={{
              width: 120,
              height: 80,
              background: "radial-gradient(circle at 50% 50%, rgba(0,229,160,0.15) 0%, transparent 70%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
            }}>
              <img
                src="/favicon.ico"
                alt="EnerTrack"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                }}
              />
            </div>
          </div>

          <div style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>POTÊNCIA ATUAL</div>
                <div style={{ fontSize: 52, fontWeight: 800, color: "var(--accent)", lineHeight: 1.1, marginTop: 4 }}>
                  {isLoading ? "..." : Number(latestReading?.watts ?? 0).toFixed(1)} <span style={{ fontSize: 22, fontWeight: 500 }}>W</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{selectedDevice?.name ?? "Sem dispositivo selecionado"}</div>
              </div>
              <div style={{
                background: "var(--accent-dim)", color: "var(--accent)", borderRadius: 20,
                padding: "4px 12px", fontSize: 12, fontWeight: 600, border: "1px solid var(--border-accent)"
              }}>● Ao vivo</div>
            </div>
            {chartData.length ? (
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartData}>
                  <XAxis dataKey="time" tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="value" stroke="#00e5a0" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: 13 }}>
                Nenhuma leitura encontrada no D1 para este dispositivo.
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 14 }}>
            <StatCard label="Média" value={formatWatts(avgWatts)} unit="Amostras carregadas" icon={TrendingUp} iconColor="#00e5a0" />
            <StatCard label="Pico" value={formatWatts(maxWatts)} unit="Maior valor registrado" icon={Flame} iconColor="#e3b341" />
            <StatCard label="Est. Diária" value={`${estimatedDailyKwh.toFixed(2)} kWh`} unit="Energia estimada" icon={Activity} iconColor="#58a6ff" />
            <StatCard label="Custo/Dia" value={estimatedDailyCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} unit="Estimativa de custo" icon={DollarSign} iconColor="#3fb950" />
          </div>

          <div style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>
                HISTÓRICO — ÚLTIMAS 3 LEITURAS
              </div>
              <Link href="/leituras" style={{
                display: "flex", alignItems: "center", gap: 4,
                color: "var(--accent)", textDecoration: "none", fontSize: 13,
              }}>
                Ver todas as leituras <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {recentReadings.length ? recentReadings.map((reading, i) => (
                  <div key={`${reading.recorded_at}-${i}`} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: 10,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 13 }}>
                      <span>🕐</span>{formatReadingDate(reading.recorded_at)}
                    </div>
                    <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: 15 }}>{formatWatts(reading.watts)}</div>
                  </div>
                )) : (
                  <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Nenhuma leitura registrada.</div>
                )}
              </div>
              <div style={{ width: 220 }}>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={recentReadings.slice().reverse().map((r) => ({ name: formatReadingDate(r.recorded_at), value: r.watts }))}>
                    <Bar dataKey="value" fill="#00e5a0" radius={[4, 4, 0, 0]} opacity={0.85} />
                    <XAxis dataKey="name" tick={{ fill: "#8b949e", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
