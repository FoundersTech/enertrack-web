"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import {
  ArrowLeft,
  Cpu,
  RefreshCw,
  Save,
  Trash2,
  AlertTriangle,
} from "lucide-react";

type Device = {
  id: string;
  mac_address: string;
  name: string;
  location: string | null;
  electrical_config: string;
  registered_at: number | string;
  firmware_version: string | null;
  target_firmware_version: string | null;
  firmware_update_requested: number;
  firmware_update_status: string | null;
  firmware_updated_at: number | null;
  last_seen_at: number | null;
};

type LatestFirmware = {
  version: string;
  binary_url: string;
  changelog: string | null;
  created_at: number | string;
};

const electricalOptions = [
  { value: "127v_monofasico", label: "127V monofásico" },
  { value: "220v_monofasico", label: "220V monofásico" },
  { value: "220v_trifasico", label: "220V trifásico" },
  { value: "380v_trifasico", label: "380V trifásico" },
];

function formatDate(value?: number | string | null) {
  if (!value) return "Indisponível";

  const numeric = Number(value);
  const date = Number.isFinite(numeric) ? new Date(numeric * 1000) : new Date(value);

  if (Number.isNaN(date.getTime())) return "Indisponível";

  return date.toLocaleString("pt-BR");
}

export default function DeviceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [device, setDevice] = useState<Device | null>(null);
  const [latestFirmware, setLatestFirmware] = useState<LatestFirmware | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [electricalConfig, setElectricalConfig] = useState("127v_monofasico");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadDevice() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/devices/${params.id}`);

      if (!response.ok) {
        throw new Error("Não foi possível carregar o dispositivo.");
      }

      const data = await response.json();

      setDevice(data.device);
      setLatestFirmware(data.latest_firmware);
      setName(data.device.name ?? "");
      setLocation(data.device.location ?? "");
      setElectricalConfig(data.device.electrical_config ?? "127v_monofasico");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/devices/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          location: location.trim() || null,
          electrical_config: electricalConfig,
        }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível salvar as alterações.");
      }

      const data = await response.json();

      setDevice(data.device);
      setMessage("Dispositivo atualizado com sucesso.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRequestFirmwareUpdate() {
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/devices/${params.id}/firmware-update`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Não foi possível solicitar atualização.");
      }

      setMessage("Atualização solicitada. O dispositivo atualizará quando consultar a API.");
      await loadDevice();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Remover este dispositivo da sua conta?\n\nIsso não reseta o hardware. Para resetar fisicamente, pressione o botão BOOT do EnerTrack por 5 segundos.",
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/devices/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Não foi possível remover o dispositivo.");
      }

      router.push("/dispositivos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  useEffect(() => {
    void loadDevice();
  }, [params.id]);

  const hasUpdate =
    latestFirmware &&
    device?.firmware_version &&
    latestFirmware.version !== device.firmware_version;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar title="Gerenciar dispositivo" subtitle="Edite dados, firmware e vínculo do dispositivo." />

        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <button
            type="button"
            onClick={() => router.push("/dispositivos")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              marginBottom: 20,
              fontSize: 14,
            }}
          >
            <ArrowLeft size={16} />
            Voltar para dispositivos
          </button>

          {isLoading && (
            <div style={{ color: "var(--text-secondary)" }}>
              Carregando dispositivo...
            </div>
          )}

          {!isLoading && error && (
            <div
              style={{
                color: "var(--red)",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 18,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {!isLoading && message && (
            <div
              style={{
                color: "var(--accent)",
                background: "var(--accent-dim)",
                border: "1px solid rgba(0,229,160,0.35)",
                borderRadius: 12,
                padding: 18,
                marginBottom: 16,
              }}
            >
              {message}
            </div>
          )}

          {!isLoading && device && (
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
              <section
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: "var(--accent-dim)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Cpu size={24} color="var(--accent)" />
                  </div>

                  <div>
                    <h2 style={{ margin: 0, fontSize: 22 }}>{device.name}</h2>
                    <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: 13 }}>
                      MAC: {device.mac_address}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>
                      Nome do dispositivo
                    </span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      style={{
                        background: "var(--bg-input)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: "12px 14px",
                        color: "var(--text-primary)",
                        outline: "none",
                      }}
                    />
                  </label>

                  <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>
                      Localização
                    </span>
                    <input
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="Ex: Sala, quarto, padrão principal"
                      style={{
                        background: "var(--bg-input)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: "12px 14px",
                        color: "var(--text-primary)",
                        outline: "none",
                      }}
                    />
                  </label>

                  <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>
                      Configuração de instalação
                    </span>
                    <select
                      value={electricalConfig}
                      onChange={(event) => setElectricalConfig(event.target.value)}
                      style={{
                        background: "var(--bg-input)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: "12px 14px",
                        color: "var(--text-primary)",
                        outline: "none",
                        colorScheme: "dark",
                      }}
                    >
                      {electricalOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          style={{
                            background: "#111821",
                            color: "#f4f7fb",
                          }}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                      marginTop: 8,
                      background: "var(--accent)",
                      border: "none",
                      color: "#07110f",
                      borderRadius: 10,
                      padding: "12px 16px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Save size={16} />
                    {isSaving ? "Salvando..." : "Salvar alterações"}
                  </button>
                </div>
              </section>

              <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <section
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    padding: 24,
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>Firmware</h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
                    <div style={{ color: "var(--text-secondary)" }}>
                      Atual: <strong style={{ color: "var(--text-primary)" }}>{device.firmware_version ?? "Não informado"}</strong>
                    </div>

                    <div style={{ color: "var(--text-secondary)" }}>
                      Última versão: <strong style={{ color: "var(--text-primary)" }}>{latestFirmware?.version ?? "Não cadastrada"}</strong>
                    </div>

                    <div style={{ color: "var(--text-secondary)" }}>
                      Status: <strong style={{ color: "var(--text-primary)" }}>{device.firmware_update_status ?? "idle"}</strong>
                    </div>

                    <div style={{ color: "var(--text-secondary)" }}>
                      Última atualização: <strong style={{ color: "var(--text-primary)" }}>{formatDate(device.firmware_updated_at)}</strong>
                    </div>
                  </div>

                  {hasUpdate && (
                    <button
                      type="button"
                      onClick={handleRequestFirmwareUpdate}
                      style={{
                        marginTop: 18,
                        width: "100%",
                        background: "var(--accent)",
                        border: "none",
                        color: "#07110f",
                        borderRadius: 10,
                        padding: "12px 16px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <RefreshCw size={16} />
                      Solicitar atualização
                    </button>
                  )}
                </section>

                <section
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid rgba(255,77,79,0.35)",
                    borderRadius: 16,
                    padding: 24,
                  }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <AlertTriangle size={20} color="var(--red)" />

                    <div>
                      <h3 style={{ margin: 0 }}>Remover dispositivo</h3>
                      <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.5 }}>
                        Remove o dispositivo da sua conta. Para resetar o hardware, pressione o botão BOOT do EnerTrack por 5 segundos.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDelete}
                    style={{
                      marginTop: 12,
                      width: "100%",
                      background: "rgba(255,77,79,0.12)",
                      border: "1px solid rgba(255,77,79,0.35)",
                      color: "var(--red)",
                      borderRadius: 10,
                      padding: "12px 16px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Trash2 size={16} />
                    Remover dispositivo
                  </button>
                </section>
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}