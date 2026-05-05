import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  Upload,
  GraduationCap,
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

  return (
    <SidebarProvider>
      <Sidebar className="glass-panel border-r border-[var(--line)]">
        <SidebarHeader className="px-5 py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand)] text-[#06101d] shadow-lg shadow-[var(--brand)]/20">
              <Upload className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold leading-none tracking-tight">
                Tesis IQ
              </span>
              <span className="text-[11px] text-[var(--ink-soft)] leading-none mt-1">
                Sistema de revisión
              </span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-widest text-[var(--ink-soft)]/70 px-5 mb-2">
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
                              ? "bg-[var(--brand)]/15 text-[var(--brand)] shadow-sm"
                              : "text-[var(--ink-soft)] hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <item.icon className="h-[18px] w-[18px]" />
                          <span className="text-sm font-medium">{item.title}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-[var(--line)]/60 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-[var(--line)]/40 p-3">
            <Avatar className="h-8 w-8 ring-2 ring-[var(--brand)]/20">
              <AvatarFallback className="bg-gradient-to-br from-[var(--brand)] to-[var(--brand-strong)] text-[#06101d] text-xs font-bold">
                IQ
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">Admin</span>
              <span className="text-xs text-[var(--ink-soft)] leading-none mt-1">
                admin@tesis-iq.com
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 flex flex-col min-h-screen">
        <header className="flex h-16 items-center gap-4 glass-panel border-b border-[var(--line)] px-6 sticky top-0 z-10">
          <SidebarTrigger className="-ml-1 text-[var(--ink-soft)] hover:text-white hover:bg-white/5" />
          <Separator orientation="vertical" className="h-6 bg-[var(--line)]" />
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
