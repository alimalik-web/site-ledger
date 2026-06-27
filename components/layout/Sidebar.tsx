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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
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
      { label: 'Crush', href: '/materials?category=crush' },
      { label: 'Sand', href: '/materials?category=sand' },
      { label: 'Other', href: '/materials?category=other' },
    ],
  },
  { label: 'History', href: '/history', icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(['Labor', 'Materials']);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo / Brand */}
      <div className={cn('flex items-center p-4', collapsed && !isMobile ? 'justify-center' : 'justify-between')}>
        <div className={cn('flex items-center gap-3', collapsed && !isMobile && 'hidden')}>
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base leading-tight tracking-tight text-sidebar-foreground">SiteLedger</h2>
            <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 font-medium">PKR Tracking</p>
          </div>
        </div>
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'p-1.5 rounded-md text-sidebar-foreground/50 hover:text-foreground hover:bg-sidebar-accent transition-colors',
              collapsed && 'mx-auto ml-0'
            )}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1 scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.href) {
            const active = isActive(item.href);
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                      collapsed && !isMobile && 'justify-center px-2'
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    {!(collapsed && !isMobile) && <span>{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && !isMobile && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>
            );
          }

          const isOpen = openGroups.includes(item.label);
          const hasActiveChild = item.children?.some((c) => pathname.startsWith(c.href.split('?')[0]));

          return (
            <div key={item.label} className="pt-1">
              <Tooltip>
                <TooltipTrigger>
                  <button
                    onClick={() => !(collapsed && !isMobile) && toggleGroup(item.label)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      hasActiveChild && !isOpen
                        ? 'text-primary bg-primary/5'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                      collapsed && !isMobile && 'justify-center px-2'
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    {!(collapsed && !isMobile) && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown className={cn('w-4 h-4 transition-transform duration-200 opacity-50', isOpen && 'rotate-180')} />
                      </>
                    )}
                  </button>
                </TooltipTrigger>
                {collapsed && !isMobile && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>

              {!(collapsed && !isMobile) && isOpen && item.children && (
                <div className="mt-1 mb-2 ml-[22px] pl-4 border-l-2 border-border/40 space-y-1">
                  {item.children.map((child) => {
                    const childActive = pathname === child.href.split('?')[0];
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200',
                          childActive
                            ? 'text-primary bg-primary/10'
                            : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                        )}
                      >
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

      <Separator className="bg-border/50 mx-4 w-auto" />

      {/* Theme Toggle & Footer */}
      <div className="p-4 space-y-2">
        <Tooltip>
          <TooltipTrigger>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200',
                collapsed && !isMobile && 'justify-center px-2'
              )}
            >
              {theme === 'dark' ? <Sun className="w-[18px] h-[18px] shrink-0" /> : <Moon className="w-[18px] h-[18px] shrink-0" />}
              {!(collapsed && !isMobile) && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
          </TooltipTrigger>
          {collapsed && !isMobile && <TooltipContent side="right">Toggle Theme</TooltipContent>}
        </Tooltip>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header (Only visible on md:hidden) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-sidebar border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
            <Building2 className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-sm text-foreground">SiteLedger</h2>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/70">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-sidebar border-r-border/50">
            <SidebarContent isMobile />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar (Only visible on md:flex) */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen bg-sidebar border-r border-border/50 transition-all duration-300 ease-in-out shrink-0 z-30',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
