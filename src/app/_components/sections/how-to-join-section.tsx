'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Landmark, Rocket, Gift } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import React from 'react'; // Import React for type React.MouseEvent

interface Step {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    id: 1,
    icon: UserPlus,
    title: 'রেজিস্টার করুন',
    description: 'আমাদের ওয়েবসাইটে গিয়ে সহজ ফর্মটি পূরণ করে বিনামূল্যে আপনার অ্যাকাউন্ট তৈরি করুন।',
  },
  {
    id: 2,
    icon: Landmark,
    title: 'ডিপোজিট করুন',
    description: 'আপনার পছন্দের পেমেন্ট পদ্ধতি ব্যবহার করে নিরাপদে অ্যাকাউন্টে টাকা জমা দিন।',
  },
  {
    id: 3,
    icon: Gift,
    title: 'বোনাস সংগ্রহ করুন',
    description: 'আপনার প্রথম ডিপোজিটের জন্য স্বাগতম বোনাস এবং অন্যান্য আকর্ষণীয় অফারগুলো লুফে নিন।',
  },
  {
    id: 4,
    icon: Rocket,
    title: 'খেলা শুরু করুন',
    description: 'হাজারো রকমের স্লট, টেবিল গেম এবং লাইভ ক্যাসিনো থেকে আপনার পছন্দের গেম খেলা শুরু করুন।',
  },
];

export default function HowToJoinSection() {
  const handleScrollToJoin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Assuming there's a registration form or link. For now, this is a placeholder.
    alert('নিবন্ধন প্রক্রিয়া শুরু করতে একটি পপ-আপ বা নতুন পেইজ খোলা হবে।');
  };

  return (
    <section id="how-to-join" className="bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            কিভাবে <span className="text-primary">সোহজ৮৮</span> এ জয়েন করবেন?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            মাত্র কয়েকটি সহজ ধাপ অনুসরণ করে সোহজ৮৮ পরিবারে যোগ দিন এবং সীমাহীন বিনোদন উপভোগ করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <Card key={step.id} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-col items-center">
                <div className="mb-4 p-4 bg-primary/10 rounded-full text-primary">
                  <step.icon className="h-10 w-10" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transform hover:scale-105 transition-transform duration-300"
            onClick={handleScrollToJoin}
          >
            এখনি একাউন্ট খুলুন
            <UserPlus className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
