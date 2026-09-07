'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home, MapPin, Cpu, Layers, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
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
  { href: '/alertas', icon: Bell, labelKey: 'alerts' },
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
    <div className="min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:fixed md:inset-y-0 md:left-0 md:flex md:flex-col transition-all duration-300 ease-in-out',
          isCollapsed ? 'md:w-20' : 'md:w-64'
        )}
      >
        <div className="flex flex-col flex-grow border-r border-line bg-surface-dark pt-5">
          {/* Logo container */}
          <div className="flex flex-col w-full px-4">
            {/* Both logos in same position, conditionally rendered */}
            <div className={cn(
              'relative h-[48px] flex items-center justify-center mx-auto transition-all duration-300',
              isCollapsed ? 'w-[48px]' : 'w-45'
            )}>
              <Image
                src="/logo.webp"
                alt="Logo"
                width={180}
                height={48}
                className={cn(
                  'absolute object-contain transition-opacity duration-300',
                  isCollapsed ? 'opacity-0' : 'opacity-100'
                )}
                unoptimized
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
                unoptimized
              />
            </div>
            
            {/* Spacer */}
            <div className="h-[22px]" />
            
            {/* Collapse toggle button - below logos */}
            <div className={cn('w-full', isCollapsed ? 'flex justify-center' : 'flex justify-end')}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-6 w-6 rounded-md bg-transparent hover:bg-dark-canvas-neutral-hover-bg text-fg-on-dark"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="h-[22px]" />

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
                      ? 'bg-dark-canvas-neutral-hover-bg text-dark-canvas-accent-bg'
                      : 'text-fg-on-dark/80 hover:bg-dark-canvas-neutral-hover-bg hover:text-fg-on-dark'
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
              className="text-fg-on-dark hover:text-fg-on-dark hover:bg-dark-canvas-neutral-hover-bg"
              iconOnly={isCollapsed}
            />
            <ThemeToggle
              className="text-fg-on-dark hover:text-fg-on-dark hover:bg-dark-canvas-neutral-hover-bg"
            />
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-surface border-b border-line">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-bold text-brand-primary">Asimetrix</h1>
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
        <div className="pt-16 pb-20 md:pt-6 md:pb-6 px-4 md:px-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
