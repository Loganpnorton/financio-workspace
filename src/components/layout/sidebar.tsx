"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, NotebookText, WalletCards, LifeBuoy, Settings, Bot } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"

const menuItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/finances", label: "Finances", icon: WalletCards },
  { href: "/notes", label: "Notes & To-Do", icon: NotebookText },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <Bot className="w-8 h-8 text-primary" />
            <span className="text-xl font-semibold font-headline">Financio</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton tooltip={{ children: "Help" }}>
                <LifeBuoy />
                <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <SidebarMenuButton asChild isActive={pathname === '/settings'} tooltip={{ children: "Settings" }}>
                <Link href="/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
             </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
