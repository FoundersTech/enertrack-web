"use client";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { getInitials, useUser } from "@/hooks/use-user";
import { User, Shield, Cpu, ArrowLeft, CheckCircle, Eye, EyeOff, Trash2 } from "lucide-react";
import Link from "next/link";

export default function MinhaConta() {
  const [activeTab, setActiveTab] = useState("Perfil");
  const [showPw, setShowPw] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { user } = useUser();
  const initials = getInitials(user?.name, user?.email);
  const tabs = [
    { label: "Perfil", icon: User },
    { label: "Segurança", icon: Shield },
    { label: "Dispositivos", icon: Cpu },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/dashboard" style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
              <ArrowLeft size={18} />
            </Link>
            <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>Dashboard</span>
            <span style={{ color: "var(--text-muted)" }}>/</span>
            <span style={{ fontWeight: 600, fontSize: 16 }}>Minha conta</span>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#0d1117" }}>
            {initials}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            
            {/* Informações pessoais */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>Informações pessoais</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 3 }}>Gerencie seus dados pessoais e de acesso.</div>
              </div>
              <div style={{ display: "flex" }}>
                {/* Sidebar tabs */}
                <div style={{ width: 160, padding: 16, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 4 }}>
                  {tabs.map(({ label, icon: Icon }) => (
                    <div key={label} onClick={() => setActiveTab(label)} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8,
                      background: activeTab === label ? "var(--accent-dim)" : "transparent",
                      color: activeTab === label ? "var(--accent)" : "var(--text-secondary)",
                      fontWeight: activeTab === label ? 600 : 400, fontSize: 13, cursor: "pointer",
                    }}>
                      <Icon size={15} />
                      {label}
                    </div>
                  ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: 24 }}>
                  {activeTab === "Perfil" && (
                    <>
                      {[
                        { label: "NOME", value: user?.name ?? "Carregando...", icon: User },
                        { label: "EMAIL", value: user?.email ?? "Carregando...", verified: true, icon: User },
                      ].map(field => (
                        <div key={field.label} style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{field.label}</div>
                          <div style={{ display: "flex", alignItems: "center", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: "11px 14px" }}>
                            <field.icon size={14} color="var(--text-muted)" style={{ marginRight: 10 }} />
                            <span style={{ flex: 1, fontSize: 14, color: "var(--text-primary)" }}>{field.value}</span>
                            {field.verified && <CheckCircle size={16} color="var(--accent)" />}
                          </div>
                        </div>
                      ))}

                      <div style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>SENHA ATUAL</div>
                        <div style={{ display: "flex", alignItems: "center", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: "11px 14px" }}>
                          <input type={showPw ? "text" : "password"} defaultValue="senhaforte123" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 14 }} />
                          <button onClick={() => setShowPw(!showPw)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>Preencha os campos abaixo apenas se quiser alterar a senha.</div>

                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>NOVA SENHA</div>
                        <div style={{ display: "flex", alignItems: "center", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: "11px 14px" }}>
                          <input type={showNew ? "text" : "password"} defaultValue="novasenhaforte" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 14 }} />
                          <button onClick={() => setShowNew(!showNew)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                            {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                          <div style={{ flex: 1, display: "flex", gap: 3 }}>
                            {[1,2,3,4].map(j => (
                              <div key={j} style={{ flex: 1, height: 3, borderRadius: 2, background: "var(--accent)" }} />
                            ))}
                          </div>
                          <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>Forte</span>
                        </div>
                      </div>

                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>CONFIRMAR NOVA SENHA</div>
                        <div style={{ display: "flex", alignItems: "center", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: "11px 14px" }}>
                          <input type={showConfirm ? "text" : "password"} defaultValue="novasenhaforte" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 14 }} />
                          <CheckCircle size={15} color="var(--accent)" />
                        </div>
                      </div>

                      <button style={{ width: "100%", padding: 13, background: "var(--accent)", color: "#0d1117", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                        Salvar alterações
                      </button>
                    </>
                  )}

                  {activeTab === "Segurança" && (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Sessões ativas</div>
                      <div style={{
                        background: "var(--bg-secondary)", border: "1px solid var(--border)",
                        borderRadius: 10, padding: "14px 16px", display: "flex",
                        alignItems: "center", justifyContent: "space-between",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Shield size={18} color="var(--accent)" />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>Windows • Chrome</div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>São Paulo, Brasil</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 12, color: "var(--accent)" }}>Ativa agora</span>
                          <button style={{ background: "var(--red)", color: "white", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Encerrar</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "Dispositivos" && (
                    <div style={{ color: "var(--text-secondary)", fontSize: 14, textAlign: "center", padding: 40 }}>
                      Nenhum dispositivo confiável cadastrado.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div style={{ marginTop: 24, border: "1px solid rgba(248,81,73,0.3)", borderRadius: 16, padding: 24 }}>
              <div style={{ color: "var(--red)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Zona de perigo</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>Delete sua conta e remova permanentemente todos os dados, dispositivos e leituras.</div>
              <button style={{
                width: "100%", padding: 13, background: "transparent",
                color: "var(--red)", border: "1px solid rgba(248,81,73,0.4)",
                borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                <Trash2 size={16} /> Deletar minha conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
