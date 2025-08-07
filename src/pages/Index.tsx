import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
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
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.academyName.trim()) {
      newErrors.academyName = 'اسم الأكاديمية مطلوب';
    }
    
    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'اسم النطاق مطلوب';
    } else if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      newErrors.subdomain = 'اسم النطاق يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط';
    }
    
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'البريد الإلكتروني غير صحيح';
    }
    
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'رقم الهاتف مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleModuleChange = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(moduleId)
        ? prev.selectedModules.filter(id => id !== moduleId)
        : [...prev.selectedModules, moduleId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Replace this with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form on success
      setFormData({
        academyName: '',
        subdomain: '',
        contactEmail: '',
        contactPhone: '',
        selectedTemplate: 'default',
        selectedModules: ['student-management', 'attendance', 'finance', 'website']
      });
      
      // Show success message or redirect
      alert('تم إنشاء الأكاديمية بنجاح!');
      
    } catch (error) {
      console.error('Error creating academy:', error);
      alert('حدث خطأ أثناء إنشاء الأكاديمية. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans" style={{ direction: 'rtl' }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.75v6m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-.08-8.25 4.5 4.5 0 016.78 0A2.25 2.25 0 0115 18H9a2.25 2.25 0 010-4.5z" />
              </svg>
              <span className="mr-3 text-2xl font-bold text-gray-900">TecnoFootball</span>
            </div>
            <div className="flex items-center">
              <button 
                onClick={handleLoginClick}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
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
              <div className="flex bg-gray-200 rounded-lg p-1 mb-8" role="tablist">
                <button
                  role="tab"
                  aria-selected={activeTab === 'create-academy'}
                  className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    activeTab === 'create-academy' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('create-academy')}
                >
                  إنشاء أكاديمية
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 'admin-login'}
                  className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                <div className="bg-white rounded-lg shadow-lg p-6" role="tabpanel">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">إنشاء أكاديمية جديدة</h3>
                    <p className="text-gray-600">املأ النموذج التالي لبدء رحلة أكاديميتك نحو التميز.</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Academy Name */}
                    <div>
                      <label htmlFor="academyName" className="block text-sm font-semibold text-gray-700 mb-1">
                        اسم الأكاديمية <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="academyName"
                        type="text"
                        name="academyName"
                        value={formData.academyName}
                        onChange={handleInputChange}
                        placeholder="أكاديمية المستقبل لكرة القدم"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.academyName ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                        aria-describedby={errors.academyName ? "academyName-error" : undefined}
                      />
                      {errors.academyName && (
                        <p id="academyName-error" className="mt-1 text-sm text-red-600" role="alert">
                          {errors.academyName}
                        </p>
                      )}
                    </div>

                    {/* Subdomain */}
                    <div>
                      <label htmlFor="subdomain" className="block text-sm font-semibold text-gray-700 mb-1">
                        اختر رابط موقعك <span className="text-red-500">*</span>
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-100 text-gray-600 text-sm">
                          https://
                        </span>
                        <input
                          id="subdomain"
                          type="text"
                          name="subdomain"
                          value={formData.subdomain}
                          onChange={handleInputChange}
                          placeholder="اسم-أكاديميتك"
                          className={`flex-1 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.subdomain ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          aria-describedby={errors.subdomain ? "subdomain-error" : undefined}
                        />
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm">
                          .tecnosync.com
                        </span>
                      </div>
                      {errors.subdomain && (
                        <p id="subdomain-error" className="mt-1 text-sm text-red-600" role="alert">
                          {errors.subdomain}
                        </p>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contactEmail" className="block text-sm font-semibold text-gray-700 mb-1">
                          البريد الإلكتروني <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contactEmail"
                          type="email"
                          name="contactEmail"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                          placeholder="info@academy.com"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.contactEmail ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          aria-describedby={errors.contactEmail ? "contactEmail-error" : undefined}
                        />
                        {errors.contactEmail && (
                          <p id="contactEmail-error" className="mt-1 text-sm text-red-600" role="alert">
                            {errors.contactEmail}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="contactPhone" className="block text-sm font-semibold text-gray-700 mb-1">
                          رقم الهاتف <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contactPhone"
                          type="tel"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                          placeholder="+213 XXX XXX XXX"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.contactPhone ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          aria-describedby={errors.contactPhone ? "contactPhone-error" : undefined}
                        />
                        {errors.contactPhone && (
                          <p id="contactPhone-error" className="mt-1 text-sm text-red-600" role="alert">
                            {errors.contactPhone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Template Selection */}
                    <fieldset>
                      <legend className="block text-sm font-semibold text-gray-700 mb-3">اختر قالب الموقع</legend>
                      <div className="grid grid-cols-3 gap-4">
                        {['default', 'modern', 'classic'].map((template) => (
                          <label
                            key={template}
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-all focus-within:ring-2 focus-within:ring-blue-500 ${
                              formData.selectedTemplate === template 
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <input
                              type="radio"
                              name="selectedTemplate"
                              value={template}
                              checked={formData.selectedTemplate === template}
                              onChange={(e) => setFormData(prev => ({ ...prev, selectedTemplate: e.target.value }))}
                              className="sr-only"
                            />
                            <div className="aspect-video bg-gray-200 rounded mb-2"></div>
                            <p className="text-center text-sm font-medium text-gray-700">
                              {template === 'default' ? 'افتراضي' : 
                               template === 'modern' ? 'حديث' : 'كلاسيكي'}
                            </p>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    {/* Module Selection */}
                    <fieldset>
                      <legend className="block text-sm font-semibold text-gray-700 mb-3">حدد الميزات المطلوبة</legend>
                      <div className="grid grid-cols-2 gap-3">
                        {availableModules.map((module) => (
                          <label
                            key={module.id}
                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all focus-within:ring-2 focus-within:ring-blue-500 ${
                              formData.selectedModules.includes(module.id) 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="h-5 w-5 text-blue-600 rounded ml-3 border-gray-300 focus:ring-blue-500"
                              checked={formData.selectedModules.includes(module.id)}
                              onChange={() => handleModuleChange(module.id)}
                            />
                            <span className="text-gray-800">{module.label}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <button 
                      type="submit"
                      className="w-full text-lg py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isCreating}
                    >
                      {isCreating ? 'جاري الإنشاء...' : 'إنشاء الأكاديمية الآن'}
                    </button>
                  </form>
                </div>
              )}

              {/* Admin Login Tab */}
              {activeTab === 'admin-login' && (
                <div className="bg-white rounded-lg shadow-lg p-6" role="tabpanel">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">تسجيل دخول المشرف</h3>
                    <p className="text-gray-600">أدخل بياناتك للوصول إلى لوحة تحكم أكاديميتك.</p>
                  </div>
                  
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 mb-1">البريد الإلكتروني</label>
                      <input
                        id="login-email"
                        type="email"
                        placeholder="you@academy.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-1">كلمة المرور</label>
                      <input
                        id="login-password"
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full text-lg py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={handleLoginClick}
                    >
                      تسجيل الدخول
                    </button>
                  </form>
                  <div className="mt-6 text-center">
                    <button 
                      onClick={handleLoginClick}
                      className="text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    >
                      تسجيل دخول المشرف العام للمنصة
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <img 
              src="https://images.unsplash.com/photo-1540552990290-9e0de118b5b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="لاعب كرة قدم شاب يدرب على العشب الأخضر" 
              className="rounded-xl shadow-2xl w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Features Section */}
        <section className="py-24 bg-white rounded-lg">
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
                <div className="text-5xl mb-5 flex items-center justify-center h-16 w-16 bg-blue-100 rounded-full mx-auto" aria-hidden="true">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24">
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
                        <svg className="h-6 w-6 text-green-500 ml-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    className={`w-full text-lg py-3 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${plan.popular ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-800 hover:bg-gray-900 text-white"}`}
                  >
                    ابدأ الآن
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center mb-4">
                <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
                    <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">الصفحة الرئيسية</a></li>
                    <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">الميزات</a></li>
                    <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">الأسعار</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 tracking-wider uppercase">الدعم</h3>
                  <ul className="space-y-3 text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">الأسئلة الشائعة</a></li>
                    <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">الوثائق</a></li>
                    <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">اتصل بنا</a></li>
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

export default Index;