import Link from 'next/link';
import { Gamepad2 } from 'lucide-react'; // Using Gamepad2 as a placeholder logo icon

export default function SiteLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2 group">
      <Gamepad2 className="h-8 w-8 text-primary transition-transform group-hover:rotate-12" />
      <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
        সোহজ<span className="text-primary group-hover:text-accent transition-colors">৮৮</span>
      </span>
    </Link>
  );
}
