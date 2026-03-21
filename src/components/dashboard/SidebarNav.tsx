
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  PhoneCall, 
  UploadCloud, 
  LogOut,
  Mic2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
} from '@/components/ui/sidebar';

export function SidebarNav() {
  const pathname = usePathname();

  // Menu simplificado para a V1: Apenas o núcleo do produto
  const menuItems = [
    { name: 'Chamadas', href: '/dashboard', icon: PhoneCall },
    { name: 'Upload Manual', href: '/dashboard/upload', icon: UploadCloud },
  ];

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-slate-100 bg-white">
      <SidebarHeader className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 text-slate-900">
          <div className="p-1.5 bg-slate-900 rounded-lg text-white">
            <Mic2 className="w-4 h-4 shrink-0" />
          </div>
          <span className="font-headline font-bold text-sm tracking-tight group-data-[collapsible=icon]:hidden">
            VoiceInsights
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    tooltip={item.name}
                    className={cn(
                      "transition-all duration-200 rounded-lg h-9 px-3",
                      pathname === item.href 
                        ? "bg-slate-50 text-slate-900 font-medium" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className={cn("w-4 h-4", pathname === item.href ? "text-slate-900" : "text-slate-400")} />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6 border-t border-slate-50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-slate-400 hover:text-red-500 transition-colors" tooltip="Sair">
              <Link href="/">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sair</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
