'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, Gift, Settings, LogOut, Menu, X } from 'lucide-react';
import SiteLogo from '@/components/layout/site-logo';
import { logout } from '@/app/admin/login/_actions';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/bonuses', label: 'Bonuses', icon: Gift },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  if (!isMounted) {
    return null; // Avoid rendering on server to prevent hydration mismatch for mobile menu
  }

  return (
    <aside className="w-full md:w-64 flex-shrink-0 border-r border-border bg-card text-card-foreground flex flex-col">
      <div className="h-20 flex items-center justify-between px-4 md:px-6 border-b border-border">
        <SiteLogo />
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <nav
        className={cn(
          'flex-grow flex-col gap-2 p-4 md:flex',
          isMobileMenuOpen ? 'flex absolute top-20 left-0 right-0 bg-card z-40 shadow-lg' : 'hidden'
        )}
      >
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? 'default' : 'ghost'}
            className="w-full justify-start"
            asChild
            onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        ))}
        <Button variant="ghost" className="w-full justify-start mt-auto md:mt-4" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </nav>
      
      {/* Desktop-only logout button for when mobile menu is closed */}
      <div className="hidden md:flex flex-col p-4 mt-auto border-t border-border">
         <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
