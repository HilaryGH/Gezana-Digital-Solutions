import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  isRTL: boolean;
  availableLanguages: Array<{ code: string; name: string; nativeName: string; flag: string }>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' }
  ];

  // Determine if current language is RTL
  // Note: Amharic is written left-to-right (LTR), not right-to-left (RTL)
  const isRTL = false; // Both English and Amharic use LTR direction

  const changeLanguage = async (language: string) => {
    try {
      await i18n.changeLanguage(language);
      setCurrentLanguage(language);
      localStorage.setItem('i18nextLng', language);
      
      // Update document direction and language
      // Both English and Amharic use left-to-right (LTR) direction
      document.documentElement.lang = language;
      document.documentElement.dir = 'ltr'; // Always LTR for both languages
      
      // Add language-specific CSS class
      document.body.className = document.body.className.replace(/lang-\w+/g, '');
      document.body.classList.add(`lang-${language}`);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
      document.documentElement.lang = lng;
      // Always use LTR direction - both English and Amharic are left-to-right languages
      document.documentElement.dir = 'ltr';
      document.body.className = document.body.className.replace(/lang-\w+/g, '');
      document.body.classList.add(`lang-${lng}`);
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    // Set initial language
    handleLanguageChange(i18n.language);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    isRTL,
    availableLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
