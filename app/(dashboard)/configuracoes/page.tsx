"use client";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useState } from "react";
import { User, Bell, Ruler, AlertTriangle, Link, Sliders, ChevronRight, Shield, Smartphone, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useUser } from "@/hooks/use-user";

const configItems = [
  { icon: User, label: "Perfil da conta", desc: "Edite suas informações pessoais" },
  { icon: Bell, label: "Notificações", desc: "Configure alertas e notificações" },
  { icon: Ruler, label: "Unidades", desc: "Configure unidades de medida" },
  { icon: AlertTriangle, label: "Limites e alertas", desc: "Configure limites de segurança" },
  { icon: Link, label: "Integrações", desc: "Gerencie integrações e APIs" },
  { icon: Sliders, label: "Preferências", desc: "Ajustes gerais de aplicação" },
];

export default function Configuracoes() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const { user } = useUser();

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar title="Configurações" subtitle="Personalize sua experiência." />
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", gap: 20 }}>

          {/* Main settings list */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            {configItems.map(({ icon: Icon, label, desc }) => (
              <div key={label} onClick={() => setActiveSection(label)} style={{
                background: activeSection === label ? "rgba(0,229,160,0.08)" : "var(--bg-card)",
                border: `1px solid ${activeSection === label ? "var(--border-accent)" : "var(--border)"}`,
                borderRadius: 12, padding: "16px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: activeSection === label ? "var(--accent-dim)" : "var(--bg-secondary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={17} color={activeSection === label ? "var(--accent)" : "var(--text-secondary)"} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 1 }}>{desc}</div>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            ))}
          </div>

          {/* Detail panel - Segurança / 2FA */}
          {activeSection === "Perfil da conta" && (
            <div style={{
              width: 380, background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 16, padding: 24, flexShrink: 0,
            }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Perfil da conta</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 20 }}>Edite suas informações pessoais e de acesso.</div>

              {[
                { label: "NOME", value: user?.name ?? "Carregando...", type: "text" },
                { label: "EMAIL", value: user?.email ?? "Carregando...", type: "email", verified: true },
              ].map(field => (
                <div key={field.label} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{field.label}</div>
                  <div style={{
                    display: "flex", alignItems: "center",
                    background: "var(--bg-secondary)", border: "1px solid var(--border)",
                    borderRadius: 10, padding: "10px 14px",
                  }}>
                    <User size={14} color="var(--text-muted)" style={{ marginRight: 8 }} />
                    <span style={{ flex: 1, fontSize: 14, color: "var(--text-primary)" }}>{field.value}</span>
                    {field.verified && <CheckCircle size={16} color="var(--accent)" />}
                  </div>
                </div>
              ))}

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>SENHA ATUAL</div>
                <div style={{ display: "flex", alignItems: "center", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px" }}>
                  <input type={showPw ? "text" : "password"} defaultValue="••••••••••••" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 14 }} />
                  <button onClick={() => setShowPw(!showPw)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Preencha os campos abaixo apenas se quiser alterar a senha.</div>

              {["NOVA SENHA", "CONFIRMAR NOVA SENHA"].map((label, i) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
                  <div style={{ display: "flex", alignItems: "center", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px" }}>
                    <input type={showNewPw ? "text" : "password"} defaultValue="••••••••••••" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 14 }} />
                    {i === 0 && (
                      <button onClick={() => setShowNewPw(!showNewPw)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                        {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                    {i === 1 && <CheckCircle size={15} color="var(--accent)" />}
                  </div>
                  {i === 0 && (
                    <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                      {[1,2,3,4].map(j => (
                        <div key={j} style={{ flex: 1, height: 3, borderRadius: 2, background: j <= 4 ? "var(--accent)" : "var(--border)" }} />
                      ))}
                      <span style={{ fontSize: 11, color: "var(--accent)", marginLeft: 4 }}>Forte</span>
                    </div>
                  )}
                </div>
              ))}

              <button style={{
                width: "100%", padding: 13, background: "var(--accent)", color: "#0d1117",
                border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 8,
              }}>
                Salvar alterações
              </button>
            </div>
          )}

          {activeSection === "Limites e alertas" && (
            <div style={{
              width: 380, background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 16, padding: 24, flexShrink: 0,
            }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Autenticação de dois fatores</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 20 }}>Adicione uma camada extra de segurança à sua conta.</div>

              <div style={{
                background: "rgba(0,229,160,0.08)", border: "1px solid var(--border-accent)",
                borderRadius: 12, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Shield size={20} color="var(--accent)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--accent)" }}>2FA Ativado</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Sua conta está protegida com autenticação de dois fatores.</div>
                  </div>
                </div>
                <button style={{
                  background: "var(--red)", color: "white", border: "none",
                  borderRadius: 8, padding: "6px 14px", fontWeight: 600, fontSize: 12, cursor: "pointer",
                }}>Desativar</button>
              </div>

              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Método de autenticação</div>
              {[
                { icon: Smartphone, label: "Aplicativo autenticador", desc: "Google Authenticator, Authy, etc." },
                { icon: Shield, label: "Códigos de backup", desc: "10 códigos disponíveis" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "var(--bg-secondary)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: "14px 16px", marginBottom: 8,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Icon size={18} color="var(--text-secondary)" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{desc}</div>
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
