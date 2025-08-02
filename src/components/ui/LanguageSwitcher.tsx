import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={i18n.language === 'en' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => changeLanguage('en')}
      >
        EN
      </Button>
      <Button
        variant={i18n.language === 'fr' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => changeLanguage('fr')}
      >
        FR
      </Button>
      <Button
        variant={i18n.language === 'ar' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => changeLanguage('ar')}
      >
        AR
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
