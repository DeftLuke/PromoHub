'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

export default function HeroSection() {
  const handleScrollToJoin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const targetElement = document.getElementById('how-to-join');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative bg-gradient-to-br from-primary/10 via-background to-background pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        {/* Decorative background pattern or subtle image */}
        {/* Example: <Image src="/placeholder-bg.jpg" layout="fill" objectFit="cover" alt="Background" /> */}
      </div>
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Bajibuz এ স্বাগতম!
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
              বাংলাদেশের সেরা অনলাইন গেমিং প্ল্যাটফর্মে যোগ দিন এবং উপভোগ করুন হাজারো রকমের গেম আর আকর্ষণীয় সব বোনাস। আপনার ভাগ্য পরীক্ষা করার এটাই সেরা সময়!
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transform hover:scale-105 transition-transform duration-300"
                onClick={handleScrollToJoin}
                aria-label="এখনি জয়েন করুন"
              >
                এখনি জয়েন করুন
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-primary border-primary hover:bg-primary/10 shadow-lg transform hover:scale-105 transition-transform duration-300"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    const targetElement = document.getElementById('promotions');
                    if (targetElement) {
                      targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                aria-label="প্রোমোশন দেখুন"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                প্রোমোশন দেখুন
              </Button>
            </div>
          </div>
          <div className="mt-12 md:mt-0 animate-fade-in-right">
            <Image
              src="https://picsum.photos/seed/sohoz88hero/600/400"
              alt="সোহজ৮৮ গেমিং প্ল্যাটফর্ম"
              width={600}
              height={400}
              className="rounded-xl shadow-2xl object-cover mx-auto"
              data-ai-hint="casino excitement online game"
              priority
            />
          </div>
        </div>
      </div>
       {/* Subtle animated shapes for decoration */}
       <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-primary/20 rounded-full filter blur-xl animate-pulse-slow opacity-50"></div>
       <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-accent/20 rounded-lg filter blur-xl animate-pulse-slower opacity-50 transform rotate-45"></div>
    </section>
  );
}

// Add these keyframes to your globals.css or a style tag if not already present through Tailwind
// For animate-fade-in-up, animate-fade-in-right, animate-pulse-slow, animate-pulse-slower
// For simplicity, using Tailwind's built-in animation if available, or assuming these would be custom.
// Example for globals.css:
/*
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-fade-in-right { animation: fadeInRight 0.8s ease-out forwards; }

@keyframes pulseSlow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}
.animate-pulse-slow { animation: pulseSlow 5s infinite ease-in-out; }

@keyframes pulseSlower {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}
.animate-pulse-slower { animation: pulseSlower 8s infinite ease-in-out; }
*/

// For Tailwind CSS, you might define these in tailwind.config.js if not standard
// For this example, I assume these classes are available or custom CSS is added.
// Using simple opacity and transform for demonstration if custom animations are not set up.
// A better approach for production would be to use Framer Motion or Tailwind animation utilities.
// For now, the animation classes are placeholders for their intended effects.
