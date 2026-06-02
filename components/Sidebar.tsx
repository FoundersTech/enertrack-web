"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  BookOpen,
  BarChart2,
  History,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Dispositivos", href: "/dispositivos", icon: Cpu },
  { label: "Leituras", href: "/leituras", icon: BookOpen },
  { label: "Relatórios", href: "/relatorios", icon: BarChart2 },
  { label: "Histórico", href: "/historico", icon: History },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside
      style={{
        width: 220,
        minHeight: "100vh",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image
            src="/favicon.ico"
            alt="EnerTrack"
            width={34}
            height={34}
            style={{ borderRadius: 8 }}
          />

          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>
            EnerTrack
          </span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href === "/dashboard" && pathname === "/");

          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: active ? "var(--accent-dim)" : "transparent",
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                  transition: "all 0.15s",
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                }}
              >
                <Icon size={17} />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "0 12px" }}>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: 8,
            cursor: "pointer",
            color: "var(--text-secondary)",
            fontSize: 14,
            background: "transparent",
            border: "none",
          }}
        >
          <LogOut size={17} />
          Sair
        </button>
      </div>
    </aside>
  );
}