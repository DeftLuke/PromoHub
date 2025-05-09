import ContactForm from './contact/contact-form';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactSection() {
  return (
    <section id="contact" className="bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            আমাদের সাথে <span className="text-primary">যোগাযোগ</span> করুন
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            আপনার যেকোনো প্রশ্ন, মতামত বা সহায়তার জন্য আমরা সর্বদা প্রস্তুত। নিচের ফর্মটি পূরণ করুন অথবা সরাসরি আমাদের সাথে যোগাযোগ করুন।
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-6">যোগাযোগের তথ্য</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-primary/10 rounded-full text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">ইমেইল</h4>
                  <a href="mailto:support@sohoz88.com" className="text-muted-foreground hover:text-primary transition-colors">
                    support@sohoz88.com
                  </a>
                  <p className="text-xs text-muted-foreground/80">সাধারণ জিজ্ঞাসা এবং সহায়তার জন্য।</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-primary/10 rounded-full text-primary">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">ফোন</h4>
                  <a href="tel:+8801XXXXXXXXX" className="text-muted-foreground hover:text-primary transition-colors">
                    +৮৮০ ১xxxxxxxxx (সকাল ১০টা - রাত ৮টা)
                  </a>
                  <p className="text-xs text-muted-foreground/80">জরুরী সহায়তার জন্য কল করুন।</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-primary/10 rounded-full text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">অফিসের ঠিকানা</h4>
                  <p className="text-muted-foreground">প্লট নং ১২৩, রোড নং ৪২, গুলশান, ঢাকা-১২১২, বাংলাদেশ (শুধুমাত্র অ্যাপয়েন্টমেন্টের মাধ্যমে)</p>
                </div>
              </div>
            </div>
          </div>
          
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
