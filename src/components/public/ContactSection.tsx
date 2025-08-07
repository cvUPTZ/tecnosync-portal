import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, Phone } from 'lucide-react';

interface AcademyContact {
  name: string;
  contact_email?: string | null;
  contact_phone?: string | null;
}

interface ContactSectionProps {
  academy: AcademyContact;
}

const ContactSection: React.FC<ContactSectionProps> = ({ academy }) => {
  if (!academy) {
    return null;
  }

  return (
    <section className="bg-gray-100 py-12">
      <div className="container mx-auto px-6">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Get in Touch</h3>
              <p className="text-gray-600">
                We'd love to hear from you. Please fill out the form, or contact us using the details below.
              </p>
              {academy.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-tfa-blue" />
                  <a href={`mailto:${academy.contact_email}`} className="hover:underline">
                    {academy.contact_email}
                  </a>
                </div>
              )}
              {academy.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-tfa-blue" />
                  <span>{academy.contact_phone}</span>
                </div>
              )}
            </div>
            <form className="space-y-4">
              <Input placeholder="Your Name" />
              <Input type="email" placeholder="Your Email" />
              <Textarea placeholder="Your Message" />
              <Button className="w-full bg-tfa-blue hover:bg-tfa-blue/90">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ContactSection;
