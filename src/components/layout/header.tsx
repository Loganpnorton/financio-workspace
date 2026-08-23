"use client"

import React from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/layout/user-nav';

function getPageTitle(pathname: string) {
  switch (pathname) {
    case '/':
      return 'Dashboard';
    case '/finances':
      return 'Finances';
    case '/notes':
      return 'Notes & To-Do';
    case '/settings':
      return 'Settings';
    default:
      return 'Dashboard';
  }
}

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="hidden md:block">
        <h1 className="text-lg font-semibold font-headline">{title}</h1>
      </div>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] focus:w-full transition-all duration-300"
            />
          </div>
        </form>
        <Button variant="ghost" size="icon" className="rounded-full relative hover:animate-[bell-ring_0.5s_ease-in-out]">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
          <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary/90"></span>
          </span>
        </Button>
        <UserNav />
      </div>
    </header>
  );
}
