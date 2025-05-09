import Link from 'next/link';
import { Gamepad2 } from 'lucide-react'; 
// import Image from 'next/image';
// import Logo from '../assets/logo.png';
export default function SiteLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2 group">
      <Gamepad2 className="h-8 w-8 text-primary transition-transform group-hover:rotate-12" />
      <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
        Baji<span className="text-primary group-hover:text-accent transition-colors">Buz</span>
      </span>

      {/* <Image src={Logo} alt="Site Logo" width={100} height={40} className='bg-teal-' /> */}
    </Link>
  );
}
