import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Star, Award, Users, Calendar, Shield, Target, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-2 text-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-bold">🏆 أكاديمية تكنو لكرة القدم</span>
            <Badge variant="secondary" className="bg-tfa-gold text-primary">
              إعلان هام: التسجيل مفتوح الآن للموسم الجديد 2024-2025
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>+213 XXX XXX XXX</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>info@tecnofootball.dz</span>
            </div>
            <span>🇩🇿 الجزائر</span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/110f1368-cc3e-49a8-ba42-0e0f2e7ec6ee.png" 
                  alt="Tecno Football Academy Logo" 
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <div className="font-bold text-lg text-tfa-blue">أكاديمية تكنو</div>
                  <div className="text-xs text-tfa-red font-medium">لكرة القدم</div>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-6">
                <a href="#home" className="hover:text-primary transition-colors">الرئيسية</a>
                <a href="#about" className="hover:text-primary transition-colors">من نحن</a>
                <a href="#programs" className="hover:text-primary transition-colors">البرامج التدريبية</a>
                <a href="#coaches" className="hover:text-primary transition-colors">المدربون</a>
                <a href="#facilities" className="hover:text-primary transition-colors">المرافق</a>
                <a href="#events" className="hover:text-primary transition-colors">الفعاليات</a>
                <a href="#contact" className="hover:text-primary transition-colors">اتصل بنا</a>
              </div>
            </div>

            <Button className="gradient-hero bg-tfa-blue hover:bg-tfa-red transition-colors">
              انضم إلينا الآن
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="gradient-hero text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                أكاديمية تكنو
                <br />
                <span className="text-white/90">لكرة القدم</span>
              </h1>
              <p className="text-xl mb-8 text-white/90 leading-relaxed">
                اكتشف موهبتك وطور مهاراتك في كرة القدم مع أفضل المدربين والمرافق الحديثة في الجزائر
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-tfa-gold hover:bg-tfa-gold/90 text-primary text-lg px-8">
                  ابدأ رحلتك
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 border-white/30 text-white hover:bg-white/10">
                  شاهد الفيديو
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">+500</div>
                  <div className="text-white/80">لاعب</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">15+</div>
                  <div className="text-white/80">مدرب</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">7+</div>
                  <div className="text-white/80">سنوات خبرة</div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in">
              <div className="relative">
                <div className="aspect-video bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent mr-1"></div>
                    </div>
                    <p className="text-white/80">شاهد فيديو تعريفي بالأكاديمية</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">من نحن</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              أكاديمية رائدة في تدريب كرة القدم تأسست عام 2017 بهدف تطوير المواهب الشابة
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow border-tfa-blue/10">
              <CardHeader>
                <div className="w-16 h-16 bg-tfa-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-tfa-blue" />
                </div>
                <CardTitle className="text-tfa-blue">الهدف</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">تطوير المواهب الكروية وإعداد جيل من اللاعبين المحترفين</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-tfa-red/10">
              <CardHeader>
                <div className="w-16 h-16 bg-tfa-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-tfa-red" />
                </div>
                <CardTitle className="text-tfa-red">الشغف</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">حب كرة القدم والتفاني في تعليم أسس اللعبة الصحيحة</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-tfa-gold/10">
              <CardHeader>
                <div className="w-16 h-16 bg-tfa-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-tfa-gold" />
                </div>
                <CardTitle className="text-tfa-gold">التميز</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">تقديم أعلى مستوى من التدريب باستخدام أحدث الأساليب</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-tfa-green/10">
              <CardHeader>
                <div className="w-16 h-16 bg-tfa-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-tfa-green" />
                </div>
                <CardTitle className="text-tfa-green">الإنجاز</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">دعم اللاعبين لتحقيق أهدافهم والوصول لأعلى المستويات</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-tfa-blue/5 via-tfa-gold/5 to-tfa-red/5 rounded-2xl p-8 border border-tfa-blue/10">
            <h3 className="text-2xl font-bold mb-6 text-center">لماذا نحن الخيار الأفضل؟</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-tfa-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span>مدربون محترفون ومؤهلون</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-tfa-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span>ملاعب حديثة (5000 م²)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-tfa-red rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <span>أكثر من 50 لقب محلي</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-tfa-green rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span>بيئة آمنة ومحفزة</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-tfa-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span>جداول مرنة ومناسبة</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-tfa-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <span>تطوير علمي متقدم</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">البرامج التدريبية</h2>
            <p className="text-xl text-muted-foreground">
              برامج متنوعة تناسب جميع الأعمار والمستويات
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow border-tfa-blue/20">
              <CardHeader>
                <CardTitle className="text-xl">البراعم (5-8 سنوات)</CardTitle>
                <CardDescription>تعلم أساسيات كرة القدم بطريقة ممتعة</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• تطوير المهارات الحركية الأساسية</li>
                  <li>• التعرف على الكرة والملعب</li>
                  <li>• اللعب الجماعي والتفاعل</li>
                  <li>• مرتين في الأسبوع - 60 دقيقة</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">الأشبال (9-12 سنة)</CardTitle>
                <CardDescription>تطوير المهارات التقنية والتكتيكية</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• تحسين تقنيات السيطرة والتمرير</li>
                  <li>• فهم قوانين اللعبة</li>
                  <li>• المباريات التطبيقية</li>
                  <li>• ثلاث مرات في الأسبوع - 90 دقيقة</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">الناشئين (13-16 سنة)</CardTitle>
                <CardDescription>إعداد اللاعبين للمستوى المتقدم</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• تدريب تكتيكي متقدم</li>
                  <li>• إعداد بدني مخصص</li>
                  <li>• مشاركة في البطولات</li>
                  <li>• أربع مرات في الأسبوع - 120 دقيقة</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">الفعاليات القادمة</h2>
            <p className="text-xl text-muted-foreground">
              انضم إلى فعالياتنا المثيرة والمتنوعة
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-tfa-gold text-primary">15 يوليو</Badge>
                <CardTitle className="text-lg text-tfa-blue">بطولة الأكاديمية الصيفية</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  مسابقة ودية بين جميع فئات الأكاديمية
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  سجل الآن
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Badge className="w-fit mb-2">20-25 يوليو</Badge>
                <CardTitle className="text-lg">معسكر تدريبي مكثف</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  خمسة أيام من التدريب المكثف والتطوير
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  تفاصيل أكثر
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Badge className="w-fit mb-2">30 يوليو</Badge>
                <CardTitle className="text-lg">يوم مفتوح للعائلات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  ادعو عائلتك لزيارة الأكاديمية
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  احجز مكانك
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Badge className="w-fit mb-2">5 أغسطس</Badge>
                <CardTitle className="text-lg">ورشة تطوير المهارات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  ورشة مخصصة لتحسين المهارات الفردية
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  انضم إلينا
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">تواصل معنا</h2>
            <p className="text-xl text-muted-foreground">
              نحن هنا لمساعدتك في بداية رحلتك الكروية
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">معلومات التواصل</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>الجزائر العاصمة - حي الرياضة</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>+213 XXX XXX XXX</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>info@tecnofootball.dz</span>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-6">
                <h4 className="font-bold mb-3">ساعات العمل:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>السبت إلى الخميس:</span>
                    <span>08:00 - 20:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الجمعة:</span>
                    <span>14:00 - 20:00</span>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>ابدأ رحلتك معنا</CardTitle>
                <CardDescription>
                  سجل الآن واحصل على خصم 20% للمسجلين الجدد
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-tfa-blue hover:bg-tfa-red transition-colors text-lg py-6">
                  استمارة التسجيل الإلكترونية
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  أو اتصل بنا مباشرة على الرقم أعلاه
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/lovable-uploads/110f1368-cc3e-49a8-ba42-0e0f2e7ec6ee.png" 
                  alt="Tecno Football Academy Logo" 
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <div className="font-bold text-lg">أكاديمية تكنو</div>
                  <div className="text-xs text-tfa-gold font-medium">لكرة القدم</div>
                </div>
              </div>
              <p className="text-sm text-primary-foreground/80">
                أكاديمية رائدة في تدريب كرة القدم منذ عام 2017
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-primary-foreground/80">من نحن</a></li>
                <li><a href="#programs" className="hover:text-primary-foreground/80">البرامج التدريبية</a></li>
                <li><a href="#events" className="hover:text-primary-foreground/80">الفعاليات</a></li>
                <li><a href="#contact" className="hover:text-primary-foreground/80">اتصل بنا</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">معلومات التواصل</h4>
              <ul className="space-y-2 text-sm">
                <li>الجزائر العاصمة</li>
                <li>+213 XXX XXX XXX</li>
                <li>info@tecnofootball.dz</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">النشرة البريدية</h4>
              <p className="text-sm text-primary-foreground/80 mb-4">
                اشترك للحصول على آخر الأخبار والعروض
              </p>
              <Button variant="secondary" size="sm">
                اشترك الآن
              </Button>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm">
            <p>© 2024 أكاديمية تكنو لكرة القدم - جميع الحقوق محفوظة - صُنع في الجزائر 🇩🇿</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;