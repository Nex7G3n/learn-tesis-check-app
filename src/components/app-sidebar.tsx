import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  Upload,
  GraduationCap,
  KeyRound,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/src/components/ui/sidebar";
import { Separator } from "@/src/components/ui/separator";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { createSupabaseBrowserClient } from "@/src/shared/infrastructure/supabase/client";
import { Button } from "@/src/components/ui/button";

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
    {
      title: "Alumnos",
      url: "/tesistas",
      icon: GraduationCap,
    },
  {
    title: "Revisor IA",
    url: "/cargar-tesis",
    icon: FileText,
  },
  {
    title: "Tesis revisadas",
    url: "/registros-respuesta",
    icon: CheckCircle,
  },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <SidebarProvider>
      <Sidebar className="glass-panel border-r border-(--line)">
        <SidebarHeader className="px-5 py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--brand) text-[#06101d] shadow-lg shadow-(--brand)/20">
              <Upload className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold leading-none tracking-tight">
                Tesis IQ
              </span>
              <span className="text-[11px] text-(--ink-soft) leading-none mt-1">
                Sistema de revisión
              </span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-widest text-(--ink-soft)/70 px-5 mb-2">
              Módulos
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-3">
              <SidebarMenu className="gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Link href={item.url} className="w-full">
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.title}
                          className={`h-10 rounded-xl transition-all duration-200 ${
                            isActive
                              ? "bg-(--brand)/15 text-(--brand) shadow-sm"
                              : "text-(--ink-soft) hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <item.icon className="h-4.5 w-4.5" />
                          <span className="text-sm font-medium">{item.title}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="mt-auto pb-3">
            <SidebarGroupContent className="px-3">
              <SidebarMenu className="gap-1">
                <SidebarMenuItem>
                  <Link href="/configuracion/api-key" className="w-full">
                    <SidebarMenuButton
                      isActive={pathname === "/configuracion/api-key"}
                      tooltip="Configurar API key"
                      className={`h-10 rounded-xl transition-all duration-200 ${
                        pathname === "/configuracion/api-key"
                          ? "bg-(--brand)/15 text-(--brand) shadow-sm"
                          : "text-(--ink-soft) hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <KeyRound className="h-4.5 w-4.5" />
                      <span className="text-sm font-medium">Configurar API key</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-(--line)/60 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-white/3 border border-(--line)/40 p-3">
              <Avatar className="h-8 w-8 ring-2 ring-(--brand)/20">
                <AvatarFallback className="bg-linear-to-br from-(--brand) to-(--brand-strong) text-[#06101d] text-xs font-bold">
                  IQ
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none">Admin</span>
                <span className="text-xs text-(--ink-soft) leading-none mt-1">
                  Sesión activa
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 flex flex-col min-h-screen">
        <header className="flex h-16 items-center gap-4 glass-panel border-b border-(--line) px-6 sticky top-0 z-10">
          <SidebarTrigger className="-ml-1 text-(--ink-soft) hover:text-white hover:bg-white/5" />
          <Separator orientation="vertical" className="h-6 bg-(--line)" />
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-white/80">
              {navItems.find((i) => i.url === pathname)?.title ?? "Dashboard"}
            </h1>
          </div>
        </header>
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
}
