"use client";

import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useDevices } from "@/hooks/use-devices";
import { ChevronRight, Search, Cpu } from "lucide-react";

function formatRegisteredAt(value: number | string | null | undefined) {
  if (!value) return "Data indisponível";

  const timestamp = typeof value === "number" ? value * 1000 : Number(value) * 1000;
  const date = Number.isFinite(timestamp) ? new Date(timestamp) : new Date(value);

  if (Number.isNaN(date.getTime())) return "Data indisponível";

  return date.toLocaleDateString("pt-BR");
}

function formatElectricalConfig(value?: string | null) {
  const labels: Record<string, string> = {
    "127v_monofasico": "127V monofásico",
    "220v_monofasico": "220V monofásico",
    "220v_trifasico": "220V trifásico",
    "380v_trifasico": "380V trifásico",
  };

  return value ? labels[value] ?? value : "Configuração não informada";
}

export default function Dispositivos() {
  const { devices, isLoading, isError } = useDevices();

  const online = devices.length;
  const offline = 0;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar title="Dispositivos" subtitle="Gerencie seus dispositivos conectados." />

        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
            {[
              { label: "Total", value: devices.length, sub: "dispositivos", color: "var(--text-primary)" },
              { label: "Online", value: online, sub: "ativos no D1", color: "var(--accent)" },
              { label: "Offline", value: offline, sub: "não monitorados", color: "var(--red)" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "16px 20px",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {s.label}
                </div>

                <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>
                  {isLoading ? "..." : s.value}
                </div>

                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
              />

              <input
                placeholder="Buscar dispositivo..."
                style={{
                  width: "100%",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "11px 14px 11px 40px",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isError && (
              <div
                style={{
                  color: "var(--red)",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 18,
                }}
              >
                Não foi possível carregar os dispositivos do D1.
              </div>
            )}

            {!isLoading && !devices.length && !isError && (
              <div
                style={{
                  color: "var(--text-secondary)",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 24,
                  textAlign: "center",
                }}
              >
                Nenhum dispositivo cadastrado. Use o onboarding para registrar o primeiro dispositivo.
              </div>
            )}

            {devices.map((device) => (
              <Link
                key={device.id}
                href={`/dispositivos/${device.id}`}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: "var(--accent-dim)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Cpu size={22} color="var(--accent)" />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{device.name}</span>

                      <span
                        style={{
                          background: "var(--accent-dim)",
                          color: "var(--accent)",
                          borderRadius: 12,
                          padding: "2px 8px",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        online
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                      MAC: {device.mac_address} • {device.location ?? "Sem localização"} •{" "}
                      {formatElectricalConfig(device.electrical_config)}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginRight: 12 }}>
                    Registrado em {formatRegisteredAt(device.registered_at)}
                  </div>

                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}