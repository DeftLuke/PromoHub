'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SiteLogo from './site-logo';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '#home', label: 'হোম' },
  { href: '#promotions', label: 'প্রোমোশন' },
  { href: '#how-to-join', label: 'কিভাবে জয়েন করবেন' },
  { href: '#contact', label: 'যোগাযোগ' },
];

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(href.substring(1));
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled ? 'bg-background/80 shadow-md backdrop-blur-md' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <SiteLogo />
        <nav className="hidden items-center space-x-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary hover:underline underline-offset-4"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            size="lg"
            className="hidden bg-accent text-accent-foreground hover:bg-accent/90 md:flex"
            onClick={(e) => handleLinkClick(e as any, '#how-to-join')}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            এখনি জয়েন করুন
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute left-0 top-20 w-full bg-background shadow-xl md:hidden">
          <nav className="flex flex-col space-y-2 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <Button 
              variant="default" 
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={(e) => {
                handleLinkClick(e as any, '#how-to-join');
                setIsMenuOpen(false);
              }}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              এখনি জয়েন করুন
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
