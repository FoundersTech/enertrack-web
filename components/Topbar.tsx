"use client";
import { Bell, Plus } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";

export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { initials } = useUser();

  return (
    <div style={{
      height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px", borderBottom: "1px solid var(--border)",
      background: "var(--bg-secondary)", flexShrink: 0,
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 16, color: "var(--text-primary)" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 1 }}>{subtitle}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/onboarding" style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "var(--accent)", color: "#0d1117", border: "none",
          borderRadius: 8, padding: "7px 14px", cursor: "pointer",
          fontWeight: 600, fontSize: 13, textDecoration: "none",
        }}>
          <Plus size={15} /> Dispositivo
        </Link>
        <button style={{
          background: "transparent", border: "1px solid var(--border)",
          borderRadius: 8, padding: "7px 10px", cursor: "pointer", color: "var(--text-secondary)",
          display: "flex", alignItems: "center",
        }}>
          <Bell size={16} />
        </button>
        <Link href="/minha-conta" style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "var(--accent)", display: "flex", alignItems: "center",
          justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#0d1117", cursor: "pointer",
          textDecoration: "none",
        }}>
          {initials}
        </Link>
      </div>
    </div>
  );
}
