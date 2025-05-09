'use client';

import Link from 'next/link';
import SiteLogo from './site-logo';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useState, useEffect } from 'react';

const footerLinks = [
  { href: '#', label: 'শর্তাবলী' },
  { href: '#', label: 'গোপনীয়তা নীতি' },
  { href: '#', label: 'দায়িত্বশীল গেমিং' },
];

const socialLinks = [
  { Icon: Facebook, href: '#', label: 'Facebook' },
  { Icon: Twitter, href: '#', label: 'Twitter' },
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Youtube, href: '#', label: 'Youtube' },
];

export default function SiteFooter() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-muted/50 text-muted-foreground py-8 md:py-12 border-t">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <SiteLogo />
            <p className="mt-2 text-sm">
              সোহজ৮৮ - আপনার বিশ্বস্ত অনলাইন গেমিং এবং বেটিং পার্টনার। সেরা অভিজ্ঞতা পেতে আজই যোগ দিন!
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">গুরুত্বপূর্ণ লিংক</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-primary hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">আমাদের অনুসরণ করুন</h3>
            <div className="flex space-x-4">
              {socialLinks.map(({ Icon, href, label }) => (
                <Link key={label} href={href} aria-label={label} className="text-muted-foreground hover:text-primary transition-colors">
                  <Icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
            <p className="mt-4 text-sm">সাহায্যের জন্য যোগাযোগ করুন: support@sohoz88.com</p>
          </div>
        </div>
        
        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm">
            © {currentYear !== null ? currentYear : new Date().getFullYear()} সোহজ৮৮। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p className="text-xs mt-1">
            অনুগ্রহ করে মনে রাখবেন যে জুয়া আসক্তি তৈরি করতে পারে। দায়িত্বের সাথে খেলুন। ১৮+
          </p>
        </div>
      </div>
    </footer>
  );
}