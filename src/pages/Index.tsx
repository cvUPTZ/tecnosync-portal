import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Layout, SlidersHorizontal, Star, HelpCircle, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import PlatformHeader from '@/components/public/PlatformHeader';
import PlatformFooter from '@/components/public/PlatformFooter';

// Optional: Install with `npm install framer-motion`
// import { motion } from 'framer-motion';

const Index = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Layout className="w-8 h-8 text-tfa-blue" />,
      title: t('landingPage.feature1Title'),
      text: t('landingPage.feature1Text'),
    },
    {
      icon: <CheckCircle2 className="w-8 h-8 text-tfa-blue" />,
      title: t('landingPage.feature2Title'),
      text: t('landingPage.feature2Text'),
    },
    {
      icon: <SlidersHorizontal className="w-8 h-8 text-tfa-blue" />,
      title: t('landingPage.feature3Title'),
      text: t('landingPage.feature3Text'),
    },
  ];

  const testimonials = [
    {
      name: t('landingPage.testimonial1.name'),
      role: t('landingPage.testimonial1.role'),
      content: t('landingPage.testimonial1.content'),
      rating: 5,
    },
    {
      name: t('landingPage.testimonial2.name'),
      role: t('landingPage.testimonial2.role'),
      content: t('landingPage.testimonial2.content'),
      rating: 5,
    },
    {
      name: t('landingPage.testimonial3.name'),
      role: t('landingPage.testimonial3.role'),
      content: t('landingPage.testimonial3.content'),
      rating: 4,
    },
  ];

  const pricingPlans = [
    {
      name: t('landingPage.pricing.basic.name'),
      price: t('landingPage.pricing.basic.price'),
      description: t('landingPage.pricing.basic.description'),
      features: [
        t('landingPage.pricing.basic.feature1'),
        t('landingPage.pricing.basic.feature2'),
        t('landingPage.pricing.basic.feature3'),
      ],
      cta: t('landingPage.pricing.basic.cta'),
      popular: false,
    },
    {
      name: t('landingPage.pricing.pro.name'),
      price: t('landingPage.pricing.pro.price'),
      description: t('landingPage.pricing.pro.description'),
      features: [
        t('landingPage.pricing.pro.feature1'),
        t('landingPage.pricing.pro.feature2'),
        t('landingPage.pricing.pro.feature3'),
        t('landingPage.pricing.pro.feature4'),
      ],
      cta: t('landingPage.pricing.pro.cta'),
      popular: true,
    },
    {
      name: t('landingPage.pricing.enterprise.name'),
      price: t('landingPage.pricing.enterprise.price'),
      description: t('landingPage.pricing.enterprise.description'),
      features: [
        t('landingPage.pricing.enterprise.feature1'),
        t('landingPage.pricing.enterprise.feature2'),
        t('landingPage.pricing.enterprise.feature3'),
        t('landingPage.pricing.enterprise.feature4'),
      ],
      cta: t('landingPage.pricing.enterprise.cta'),
      popular: false,
    },
  ];

  const faqs = [
    {
      question: t('landingPage.faq.q1'),
      answer: t('landingPage.faq.a1'),
    },
    {
      question: t('landingPage.faq.q2'),
      answer: t('landingPage.faq.a2'),
    },
    {
      question: t('landingPage.faq.q3'),
      answer: t('landingPage.faq.a3'),
    },
    {
      question: t('landingPage.faq.q4'),
      answer: t('landingPage.faq.a4'),
    },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col min-h-screen">
      <PlatformHeader />
      <main className="flex-grow">
        {/* Hero Section */}
        <section id="hero" className="bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6 py-16 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white md:text-5xl lg:text-6xl">
                {t('landingPage.heroTitle')}
              </h1>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
                {t('landingPage.heroSubtitle')}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/login">
                  <Button size="lg" className="bg-tfa-blue hover:bg-tfa-blue/90">
                    {t('landingPage.getStarted')}
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-tfa-blue border-tfa-blue hover:bg-tfa-blue/5"
                  >
                    {t('landingPage.watchDemo')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-gray-50 dark:bg-gray-800 py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                {t('landingPage.featuresTitle')}
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t('landingPage.featuresSubtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader className="flex flex-col items-center">
                    <div className="p-3 bg-tfa-blue/10 rounded-full mb-4">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">{feature.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="bg-white dark:bg-gray-900 py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                {t('landingPage.testimonialsTitle')}
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                {t('landingPage.testimonialsSubtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic mb-4">"{testimonial.content}"</p>
                  <div className="font-semibold text-gray-800 dark:text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="bg-gray-50 dark:bg-gray-800 py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                {t('landingPage.pricingTitle')}
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                {t('landingPage.pricingSubtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <Card
                  key={index}
                  className={`relative ${
                    plan.popular ? 'border-tfa-blue shadow-lg scale-105 md:scale-110' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-tfa-blue text-white text-xs font-bold px-3 py-1 rounded-full">
                        {t('landingPage.popular')}
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold">{plan.price}</div>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/pricing">
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? 'bg-tfa-blue hover:bg-tfa-blue/90'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white'
                        }`}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="bg-white dark:bg-gray-900 py-16">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                {t('landingPage.faqTitle')}
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                {t('landingPage.faqSubtitle')}
              </p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 dark:border-gray-700 pb-2"
                >
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-gray-800 dark:text-white py-2 focus:outline-none"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    {faq.question}
                    <HelpCircle
                      className={`w-5 h-5 text-tfa-blue transform transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <p className="mt-2 text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="cta" className="bg-tfa-blue text-white py-16">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold">
              {t('landingPage.ctaTitle')}
            </h2>
            <p className="mt-4 text-tfa-blue/80 max-w-2xl mx-auto">
              {t('landingPage.ctaSubtitle')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" variant="secondary">
                  {t('landingPage.startFreeTrial')}
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  {t('landingPage.contactSales')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PlatformFooter />
    </div>
  );
};

export default Index;