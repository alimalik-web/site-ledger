'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  HardHat,
  Package,
  History,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Building2,
  Menu,
  X,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Labor',
    icon: HardHat,
    children: [
      { label: 'All Laborers', href: '/labor' },
      { label: 'Weekly Entries', href: '/labor/weekly' },
    ],
  },
  {
    label: 'Materials',
    icon: Package,
    children: [
      { label: 'All Materials', href: '/materials' },
      { label: 'Bricks', href: '/materials?category=bricks' },
      { label: 'Steel Bars', href: '/materials?category=steel' },
      { label: 'Cement', href: '/materials?category=cement' },
      { label: 'Crush / Aggregate', href: '/materials?category=crush' },
      { label: 'Sand', href: '/materials?category=sand' },
      { label: 'Other', href: '/materials?category=other' },
    ],
  },
  {
    label: 'History',
    href: '/history',
    icon: History,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(['Labor', 'Materials']);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <aside
        className={cn(
          'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out relative z-30',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white tracking-wide">SiteLedger</span>
              <span className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">
                Construction Tracker
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'ml-auto p-1.5 rounded-md text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-accent transition-colors',
              collapsed && 'mx-auto ml-0'
            )}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            // Simple link
            if (item.href) {
              const active = isActive(item.href);
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                        active
                          ? 'bg-sidebar-primary text-white shadow-sm'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white',
                        collapsed && 'justify-center px-2'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  )}
                </Tooltip>
              );
            }

            // Dropdown group
            const isOpen = openGroups.includes(item.label);
            const hasActiveChild = item.children?.some((c) =>
              pathname.startsWith(c.href.split('?')[0])
            );

            return (
              <div key={item.label}>
                <Tooltip>
                  <TooltipTrigger>
                    <button
                      onClick={() => !collapsed && toggleGroup(item.label)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                        hasActiveChild
                          ? 'text-white bg-sidebar-accent'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white',
                        collapsed && 'justify-center px-2'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronDown
                            className={cn(
                              'w-3.5 h-3.5 transition-transform duration-200',
                              isOpen && 'rotate-180'
                            )}
                          />
                        </>
                      )}
                    </button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  )}
                </Tooltip>

                {/* Children (only when expanded) */}
                {!collapsed && isOpen && item.children && (
                  <div className="mt-1 ml-4 pl-3 border-l border-sidebar-border space-y-0.5">
                    {item.children.map((child) => {
                      const childActive = pathname === child.href.split('?')[0];
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150',
                            childActive
                              ? 'text-primary bg-primary/10'
                              : 'text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent'
                          )}
                        >
                          <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* Theme Toggle & Footer */}
        <div className="p-3 space-y-2">
          <Tooltip>
            <TooltipTrigger>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-white transition-colors',
                  collapsed && 'justify-center px-2'
                )}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 shrink-0" />
                ) : (
                  <Moon className="w-4 h-4 shrink-0" />
                )}
                {!collapsed && (
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                )}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">Toggle Theme</TooltipContent>
            )}
          </Tooltip>

          {!collapsed && (
            <p className="text-[10px] text-sidebar-foreground/40 text-center px-2">
              SiteLedger v1.0 • PKR
            </p>
          )}
        </div>
      </aside>
  );
}
