import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { CalendarDays, Gift } from 'lucide-react';
import Link from 'next/link';
import { getBonuses as fetchActiveBonuses } from '@/app/admin/bonuses/_actions'; // Use the action to fetch bonuses
import type { Bonus } from '@/schemas/bonus';

// Helper function to determine placeholder icon based on title keywords
const getIconForBonus = (title: string) => {
  // This is a simple example; you might want a more sophisticated logic
  // or even store an icon choice in the bonus data itself.
  // For now, all bonuses get a Gift icon.
  return <Gift className="h-8 w-8 text-primary" />;
};

export default async function PromotionsSection() {
  const allBonuses: Bonus[] = await fetchActiveBonuses();
  const activeBonuses = allBonuses.filter(b => b.isActive);

  return (
    <section id="promotions" className="bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            আকর্ষণীয় <span className="text-primary">প্রোমোশন</span> ও <span className="text-primary">অফারসমূহ</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            সোহজ৮৮ এ আপনার গেমিং অভিজ্ঞতা আরও রোমাঞ্চকর করতে আমরা নিয়ে এসেছি দারুণ সব প্রোমোশন। এখনই দেখে নিন!
          </p>
        </div>

        {activeBonuses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {activeBonuses.map((promo) => (
              <Card key={promo._id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 group">
                <CardHeader className="p-0">
                  <div className="relative w-full h-52">
                    <Image
                      src={promo.imageUrl || "https://picsum.photos/seed/defaultpromo/400/250"} // Fallback image
                      alt={promo.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-500 group-hover:scale-105"
                      data-ai-hint="casino promotion bonus" // Generic hint
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow p-6">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="flex-shrink-0">{getIconForBonus(promo.title)}</div>
                    <CardTitle className="text-xl font-semibold text-foreground leading-tight">{promo.title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {promo.description}
                  </CardDescription>
                  <p className="text-xs text-accent font-medium">
                    <CalendarDays className="inline-block mr-1 h-3 w-3" />
                    Turnover: {promo.turnoverRequirement}
                  </p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button variant="default" className="w-full bg-primary hover:bg-primary/90" asChild>
                    <Link href={promo.ctaLink} target="_blank" rel="noopener noreferrer">
                      অফারটি নিন
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Gift className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold text-foreground">কোনো প্রোমোশন পাওয়া যায়নি</h3>
            <p className="mt-2 text-muted-foreground">বর্তমানে কোনো সক্রিয় প্রোমোশন নেই। অনুগ্রহ করে পরে আবার দেখুন।</p>
          </div>
        )}
        
        {activeBonuses.length > 0 && (
            <div className="text-center mt-12">
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                    সকল প্রোমোশন দেখুন (যদি আরো পেজ থাকে)
                </Button>
            </div>
        )}
      </div>
    </section>
  );
}
