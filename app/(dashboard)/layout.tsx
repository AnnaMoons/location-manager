'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home, MapPin, Cpu, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileNav } from '@/components/shared/MobileNav';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', icon: Home, labelKey: 'dashboard' },
  { href: '/ubicaciones', icon: MapPin, labelKey: 'locations' },
  { href: '/lotes', icon: Layers, labelKey: 'batches' },
  { href: '/dispositivos', icon: Cpu, labelKey: 'devices' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:fixed md:inset-y-0 md:flex md:flex-col transition-all duration-300 ease-in-out',
          isCollapsed ? 'md:w-20' : 'md:w-64'
        )}
      >
        <div className="flex flex-col flex-grow border-r bg-primary dark:bg-card pt-5">
          {/* Logo container - fixed size to maintain position */}
          <div className="flex flex-col items-center px-4 relative">
            {/* Both logos in same position, conditionally rendered */}
            <div className="relative w-[180px] h-[48px] flex items-center justify-center">
              <Image
                src="/logo.webp"
                alt="Logo"
                width={180}
                height={48}
                className={cn(
                  'absolute object-contain transition-opacity duration-300',
                  isCollapsed ? 'opacity-0' : 'opacity-100'
                )}
              />
              <Image
                src="/Vector.png"
                alt="Logo"
                width={48}
                height={48}
                className={cn(
                  'absolute object-contain transition-opacity duration-300',
                  isCollapsed ? 'opacity-100' : 'opacity-0'
                )}
              />
            </div>
            
            {/* Collapse toggle button - below logos */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                'h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 text-white mt-4',
                isCollapsed ? 'mx-auto' : 'absolute right-4'
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center py-3 text-sm font-medium rounded-md transition-all duration-300',
                    isCollapsed ? 'justify-center px-2' : 'px-4',
                    isActive
                      ? 'bg-white/20 text-white dark:bg-primary/20 dark:text-primary'
                      : 'text-white/80 hover:bg-white/10 hover:text-white dark:text-foreground/80 dark:hover:bg-muted dark:hover:text-foreground'
                  )}
                  title={isCollapsed ? t(item.labelKey) : undefined}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0 transition-all duration-300',
                      isCollapsed ? 'mr-0' : 'mr-3'
                    )}
                  />
                  <span
                    className={cn(
                      'whitespace-nowrap transition-all duration-300',
                      isCollapsed
                        ? 'w-0 opacity-0 overflow-hidden'
                        : 'w-auto opacity-100'
                    )}
                  >
                    {t(item.labelKey)}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div
            className={cn(
              'py-4 flex items-center transition-all duration-300',
              isCollapsed ? 'flex-col gap-2 px-2' : 'gap-2 px-4'
            )}
          >
            <LanguageSwitcher
              className="text-white hover:text-white hover:bg-white/10 dark:text-foreground dark:hover:text-foreground dark:hover:bg-muted"
              iconOnly={isCollapsed}
            />
            <ThemeToggle
              className="text-white hover:text-white hover:bg-white/10 dark:text-foreground dark:hover:text-foreground dark:hover:bg-muted"
            />
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-bold text-primary">Asimetrix</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main
        className={cn(
          'transition-all duration-300 ease-in-out',
          isCollapsed ? 'md:pl-20' : 'md:pl-64'
        )}
      >
        <div className="pt-16 pb-20 md:pt-6 md:pb-6 px-4 md:px-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
