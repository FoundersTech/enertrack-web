"use client";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useDevices } from "@/hooks/use-devices";
import { useReadings } from "@/hooks/use-readings";
import { Cpu, Bell, FileText, Settings, WifiOff, CheckCircle, PlusCircle } from "lucide-react";

const iconMap: Record<string, any> = {
  connect: { Icon: Cpu, color: "var(--accent)", bg: "rgba(0,229,160,0.12)" },
  alert: { Icon: Bell, color: "var(--yellow)", bg: "rgba(227,179,65,0.12)" },
  report: { Icon: FileText, color: "var(--text-secondary)", bg: "var(--bg-secondary)" },
  config: { Icon: Settings, color: "var(--text-secondary)", bg: "var(--bg-secondary)" },
  disconnect: { Icon: WifiOff, color: "var(--red)", bg: "rgba(248,81,73,0.12)" },
  resolve: { Icon: CheckCircle, color: "var(--green)", bg: "rgba(63,185,80,0.12)" },
  add: { Icon: PlusCircle, color: "var(--accent)", bg: "rgba(0,229,160,0.12)" },
};

function formatDate(value: number | string) {
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return "Data inválida";
  return date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function Historico() {
  const { devices } = useDevices();
  const selectedDevice = devices[0] ?? null;
  const { readings } = useReadings({ deviceId: selectedDevice?.id ?? null, interval: 30000, limit: 30 });
  const events = [
    ...devices.map((device) => ({
      type: "add",
      title: `Dispositivo cadastrado: ${device.name}`,
      desc: `MAC ${device.mac_address}${device.location ? ` • ${device.location}` : ""}`,
      time: formatDate(device.registered_at),
      order: new Date(device.registered_at).getTime(),
    })),
    ...readings.slice(-10).map((reading) => ({
      type: "connect",
      title: "Leitura recebida",
      desc: `${Number(reading.watts ?? 0).toFixed(1)} W • ${Number(reading.irms ?? 0).toFixed(2)} A`,
      time: formatDate(reading.recorded_at),
      order: new Date(reading.recorded_at).getTime(),
    })),
  ].sort((a, b) => b.order - a.order);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar title="Histórico" subtitle="Consulte o histórico de eventos e alterações." />
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>Tipo de evento</label>
              <select style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "8px 14px", color: "var(--text-primary)",
                fontSize: 13, cursor: "pointer", outline: "none",
              }}>
                <option>Todos</option>
                <option>Dispositivos</option>
                <option>Leituras</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>Origem</label>
              <select style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "8px 14px", color: "var(--text-primary)",
                fontSize: 13, cursor: "pointer", outline: "none",
              }}>
                <option>{selectedDevice?.name ?? "Todos os dispositivos"}</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {!events.length && (
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, color: "var(--text-secondary)", textAlign: "center" }}>
                Nenhum evento encontrado no D1.
              </div>
            )}
            {events.map((event, i) => {
              const { Icon, color, bg } = iconMap[event.type] || iconMap.config;
              return (
                <div key={i} style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 12, padding: "16px 20px",
                  display: "flex", alignItems: "center", gap: 16,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: bg, display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{event.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{event.desc}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{event.time}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
