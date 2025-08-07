import React, { useState } from 'react';

const index = () => {
  const [formData, setFormData] = useState({
    academyName: '',
    subdomain: '',
    contactEmail: '',
    contactPhone: '',
    selectedTemplate: 'default',
    selectedModules: ['student-management', 'attendance', 'finance', 'website']
  });
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('create-academy');

  const availableModules = [
    { id: 'student-management', label: 'إدارة الطلاب', enabled: true },
    { id: 'attendance', label: 'الحضور والانصراف', enabled: true },
    { id: 'finance', label: 'الإدارة المالية', enabled: true },
    { id: 'website', label: 'محتوى الموقع', enabled: true },
    { id: 'schedule', label: 'الجداول والمواعيد', enabled: true },
    { id: 'messages', label: 'الرسائل', enabled: true },
    { id: 'gallery', label: 'المعرض', enabled: true },
    { id: 'documents', label: 'المستندات', enabled: true },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleModuleChange = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(moduleId)
        ? prev.selectedModules.filter(id => id !== moduleId)
        : [...prev.selectedModules, moduleId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsCreating(true);
    
    // Simulate API call
    setTimeout(() => {
      alert('تم إنشاء الأكاديمية بنجاح!');
      setIsCreating(false);
      setFormData({
        academyName: '',
        subdomain: '',
        contactEmail: '',
        contactPhone: '',
        selectedTemplate: 'default',
        selectedModules: ['student-management', 'attendance', 'finance', 'website']
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans" style={{ direction: 'rtl' }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.75v6m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-.08-8.25 4.5 4.5 0 016.78 0A2.25 2.25 0 0115 18H9a2.25 2.25 0 010-4.5z" />
              </svg>
              <span className="mr-3 text-2xl font-bold text-gray-900">TecnoFootball</span>
            </div>
            <div className="flex items-center">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                تسجيل الدخول
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            أنشئ أكاديمية كرة قدم <br /> 
            <span className="text-blue-600">احترافية بكل سهولة</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto">
            منصة شاملة ومتكاملة لإدارة أكاديميات كرة القدم، بدءًا من الموقع الإلكتروني وانتهاءً بلوحة التحكم الإدارية.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="order-2 lg:order-1">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">ابدأ رحلتك نحو النجاح</h2>
            <p className="text-gray-700 mb-8 text-lg">
              أنشئ أكاديمية كرة قدم احترافية في دقائق. اختر اسم نطاقك، وحدد الميزات التي تحتاجها، وابدأ في استقبال المواهب الجديدة.
            </p>
            
            {/* Tabs */}
            <div className="w-full">
              <div className="flex bg-gray-200 rounded-lg p-1 mb-8">
                <button
                  className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-colors ${
                    activeTab === 'create-academy' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('create-academy')}
                >
                  إنشاء أكاديمية
                </button>
                <button
                  className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-colors ${
                    activeTab === 'admin-login' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('admin-login')}
                >
                  تسجيل دخول المشرف
                </button>
              </div>

              {/* Create Academy Tab */}
              {activeTab === 'create-academy' && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">إنشاء أكاديمية جديدة</h3>
                    <p className="text-gray-600">املأ النموذج التالي لبدء رحلة أكاديميتك نحو التميز.</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Academy Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">اسم الأكاديمية</label>
                      <input
                        type="text"
                        name="academyName"
                        value={formData.academyName}
                        onChange={handleInputChange}
                        placeholder="أكاديمية المستقبل لكرة القدم"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Subdomain */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">اختر رابط موقعك</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-100 text-gray-600 text-sm">
                          https://
                        </span>
                        <input
                          type="text"
                          name="subdomain"
                          value={formData.subdomain}
                          onChange={handleInputChange}
                          placeholder="اسم-أكاديميتك"
                          className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm">
                          .tecnosync.com
                        </span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">البريد الإلكتروني</label>
                        <input
                          type="email"
                          name="contactEmail"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                          placeholder="info@academy.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">رقم الهاتف</label>
                        <input
                          type="tel"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                          placeholder="+213 XXX XXX XXX"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Template Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">اختر قالب الموقع</label>
                      <div className="grid grid-cols-3 gap-4">
                        {['default', 'modern', 'classic'].map((template) => (
                          <div
                            key={template}
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.selectedTemplate === template 
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                            onClick={() => setFormData(prev => ({ ...prev, selectedTemplate: template }))}
                          >
                            <div className="aspect-video bg-gray-200 rounded mb-2"></div>
                            <p className="text-center text-sm font-medium text-gray-700">
                              {template === 'default' ? 'افتراضي' : 
                               template === 'modern' ? 'حديث' : 'كلاسيكي'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Module Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">حدد الميزات المطلوبة</label>
                      <div className="grid grid-cols-2 gap-3">
                        {availableModules.map((module) => (
                          <div
                            key={module.id}
                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                              formData.selectedModules.includes(module.id) 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                            onClick={() => handleModuleChange(module.id)}
                          >
                            <input
                              type="checkbox"
                              className="h-5 w-5 text-blue-600 rounded ml-3 border-gray-300 focus:ring-blue-500"
                              checked={formData.selectedModules.includes(module.id)}
                              onChange={() => handleModuleChange(module.id)}
                            />
                            <span className="text-gray-800">{module.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={handleSubmit}
                      className="w-full text-lg py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isCreating}
                    >
                      {isCreating ? 'جاري الإنشاء...' : 'إنشاء الأكاديمية الآن'}
                    </button>
                  </div>
                </div>
              )}

              {/* Admin Login Tab */}
              {activeTab === 'admin-login' && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">تسجيل دخول المشرف</h3>
                    <p className="text-gray-600">أدخل بياناتك للوصول إلى لوحة تحكم أكاديميتك.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">البريد الإلكتروني</label>
                      <input
                        type="email"
                        placeholder="you@academy.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">كلمة المرور</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button 
                      className="w-full text-lg py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                    >
                      تسجيل الدخول
                    </button>
                  </div>
                  <div className="mt-6 text-center">
                    <a href="#" className="text-sm text-blue-600 hover:underline">
                      تسجيل دخول المشرف العام للمنصة
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <img 
              src="https://images.unsplash.com/photo-1540552990290-9e0de118b5b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="لاعب كرة قدم شاب" 
              className="rounded-xl shadow-2xl w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 bg-white rounded-lg">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">كل ما تحتاجه لنجاح أكاديميتك</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "موقع إلكتروني احترافي",
                description: "احصل على موقع ويب متجاوب ومصمم خصيصًا لأكاديميتك، مع محرر محتوى سهل الاستخدام.",
                icon: "🌐"
              },
              {
                title: "إدارة شاملة للطلاب",
                description: "تتبع بيانات الطلاب، الحضور والغياب، الاشتراكات المالية، والتقارير الطبية في مكان واحد.",
                icon: "👥"
              },
              {
                title: "لوحة تحكم قوية",
                description: "واجهة بديهية لإدارة جميع جوانب أكاديميتك بكفاءة عالية ومن أي جهاز.",
                icon: "📊"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-5xl mb-5 flex items-center justify-center h-16 w-16 bg-blue-100 rounded-full mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-24">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">خطط أسعار مرنة تناسب الجميع</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "الأساسية",
                price: "99",
                period: "شهريًا",
                features: ["موقع إلكتروني", "إدارة الطلاب (حتى 50 طالب)", "نظام التسجيل أونلاين", "دعم فني عبر البريد الإلكتروني"]
              },
              {
                name: "الاحترافية",
                price: "199",
                period: "شهريًا",
                features: ["جميع مزايا الخطة الأساسية", "تقارير مالية متقدمة", "جدولة التدريبات والمباريات", "دعم فني ذو أولوية"],
                popular: true
              },
              {
                name: "المؤسسية",
                price: "399",
                period: "شهريًا",
                features: ["جميع مزايا الخطة الاحترافية", "نطاق مخصص (yourname.com)", "تكامل مع أنظمة خارجية", "مدير حساب مخصص"]
              }
            ].map((plan, index) => (
              <div key={index} className={`bg-white rounded-lg shadow-lg transition-transform hover:scale-105 p-6 ${plan.popular ? "border-2 border-blue-500" : "border border-gray-200"}`}>
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-2xl font-bold text-gray-800">{plan.name}</span>
                    {plan.popular && (
                      <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                        الأكثر شيوعًا
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600"> / {plan.period}</span>
                  </div>
                </div>
                <div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <svg className="h-6 w-6 text-green-500 ml-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    className={`w-full text-lg py-3 rounded-md font-medium transition-colors ${plan.popular ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-800 hover:bg-gray-900 text-white"}`}
                  >
                    ابدأ الآن
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center mb-4">
                <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.75v6m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-.08-8.25 4.5 4.5 0 016.78 0A2.25 2.25 0 0115 18H9a2.25 2.25 0 010-4.5z" />
                </svg>
                <span className="mr-3 text-2xl font-bold">TecnoFootball</span>
              </div>
              <p className="text-gray-400 mt-4 leading-relaxed">
                منصة الإدارة المتكاملة لأكاديميات كرة القدم الطموحة.
              </p>
            </div>
            <div className="col-span-3">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 tracking-wider uppercase">روابط سريعة</h3>
                  <ul className="space-y-3 text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">الصفحة الرئيسية</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">الميزات</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">الأسعار</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 tracking-wider uppercase">الدعم</h3>
                  <ul className="space-y-3 text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">الأسئلة الشائعة</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">الوثائق</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">اتصل بنا</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 tracking-wider uppercase">تواصل معنا</h3>
                  <div className="space-y-3 text-gray-400">
                    <p>الجزائر، الجزائر</p>
                    <p>+213 XXX XXX XXX</p>
                    <p>info@tecnofootball.dz</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>© 2024 TecnoFootball. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default index;
