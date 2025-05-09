
import HeroSection from '@/app/_components/sections/hero-section';
import PromotionsSection from '@/app/_components/sections/promotions-section';
import HowToJoinSection from '@/app/_components/sections/how-to-join-section';
import ContactSection from '@/app/_components/sections/contact-section';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PromotionsSection />
      <HowToJoinSection />
      <ContactSection />
    </>
  );
}
