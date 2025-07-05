"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation dictionary
const translations: Record<string, Record<string, string>> = {
  en: {
    "dashboard": "Dashboard",
    "profile": "My Profile",
    "progress": "Progress",
    "documents": "Documents",
    "settings": "Settings",
    "support": "Support",
    "registration": "Registration",
    "logout": "Logout",
    "welcome": "Welcome",
    "complete_profile": "Complete your profile to get started",
    "upload_document": "Upload Document",
    "document_uploaded": "Document uploaded successfully",
    "document_verified": "Document verified",
    "document_rejected": "Document rejected",
    "pending_verification": "Pending Verification",
    "re_upload_required": "Re-upload Required",
    "profile_completion": "Profile Completion",
    "basic_information": "Basic Information",
    "required_documents": "Required Documents",
    "email_verified": "Email verified",
    "mobile_verified": "Mobile verified",
    "upload_successful": "Upload Successful",
    "upload_failed": "Upload Failed",
    "email_required": "Email Required",
    "enter_email": "Please enter an email address",
    "file_too_large": "File Too Large",
    "file_size_limit": "Please upload a file smaller than 1MB",
    "supported_formats": "Supported: PDF, JPG, PNG (max 1MB)",
    "loading": "Loading...",
    "error": "Error",
    "failed_to_load": "Failed to load profile data"
  },
  hi: {
    "dashboard": "डैशबोर्ड",
    "profile": "मेरी प्रोफाइल",
    "progress": "प्रगति",
    "documents": "दस्तावेज़",
    "settings": "सेटिंग्स",
    "support": "सहायता",
    "registration": "पंजीकरण",
    "logout": "लॉगआउट",
    "welcome": "स्वागत",
    "complete_profile": "शुरू करने के लिए अपनी प्रोफाइल पूरी करें",
    "upload_document": "दस्तावेज़ अपलोड करें",
    "document_uploaded": "दस्तावेज़ सफलतापूर्वक अपलोड किया गया",
    "document_verified": "दस्तावेज़ सत्यापित",
    "document_rejected": "दस्तावेज़ अस्वीकृत",
    "pending_verification": "सत्यापन लंबित",
    "re_upload_required": "पुनः अपलोड आवश्यक",
    "profile_completion": "प्रोफाइल पूर्णता",
    "basic_information": "मूलभूत जानकारी",
    "required_documents": "आवश्यक दस्तावेज़",
    "email_verified": "ईमेल सत्यापित",
    "mobile_verified": "मोबाइल सत्यापित",
    "upload_successful": "अपलोड सफल",
    "upload_failed": "अपलोड असफल",
    "email_required": "ईमेल आवश्यक",
    "enter_email": "कृपया एक ईमेल पता दर्ज करें",
    "file_too_large": "फ़ाइल बहुत बड़ी",
    "file_size_limit": "कृपया 1MB से छोटी फ़ाइल अपलोड करें",
    "supported_formats": "समर्थित: PDF, JPG, PNG (अधिकतम 1MB)",
    "loading": "लोड हो रहा है...",
    "error": "त्रुटि",
    "failed_to_load": "प्रोफाइल डेटा लोड करने में असफल"
  },
  gu: {
    "dashboard": "ડેશબોર્ડ",
    "profile": "મારી પ્રોફાઇલ",
    "progress": "પ્રગતિ",
    "documents": "દસ્તાવેજો",
    "settings": "સેટિંગ્સ",
    "support": "સહાય",
    "registration": "નોંધણી",
    "logout": "લૉગઆઉટ",
    "welcome": "સ્વાગત",
    "complete_profile": "શરૂ કરવા માટે તમારી પ્રોફાઇલ પૂર્ણ કરો",
    "upload_document": "દસ્તાવેજ અપલોડ કરો",
    "document_uploaded": "દસ્તાવેજ સફળતાપૂર્વક અપલોડ થયો",
    "document_verified": "દસ્તાવેજ ચકાસાયો",
    "document_rejected": "દસ્તાવેજ નકાર્યો",
    "pending_verification": "ચકાસણી બાકી",
    "re_upload_required": "ફરીથી અપલોડ જરૂરી",
    "profile_completion": "પ્રોફાઇલ પૂર્ણતા",
    "basic_information": "મૂળભૂત માહિતી",
    "required_documents": "જરૂરી દસ્તાવેજો",
    "email_verified": "ઇમેઇલ ચકાસાયું",
    "mobile_verified": "મોબાઇલ ચકાસાયું",
    "upload_successful": "અપલોડ સફળ",
    "upload_failed": "અપલોડ નિષ્ફળ",
    "email_required": "ઇમેઇલ જરૂરી",
    "enter_email": "કૃપા કરીને ઇમેઇલ સરનામું દાખલ કરો",
    "file_too_large": "ફાઇલ ખૂબ મોટી",
    "file_size_limit": "કૃપા કરીને 1MB કરતાં નાની ફાઇલ અપલોડ કરો",
    "supported_formats": "સમર્થિત: PDF, JPG, PNG (મહત્તમ 1MB)",
    "loading": "લોડ થઈ રહ્યું છે...",
    "error": "ભૂલ",
    "failed_to_load": "પ્રોફાઇલ ડેટા લોડ કરવામાં નિષ્ફળ"
  }
}

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<string>('en')

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en'
    setLanguage(savedLanguage)
  }, [])

  const changeLanguage = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('preferredLanguage', lang)
  }

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
