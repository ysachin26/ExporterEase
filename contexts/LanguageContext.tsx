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
    // Navigation
    "about_us": "About Us",
    "services": "Services",
    "video_tutorial": "Video Tutorial",
    "support": "Support",
    "login_register": "Login / Register",
    "english": "English",
    "hindi": "हिन्दी",
    "marathi": "मराठी",
    
    // Hero Section
    "revolutionizing_agriculture": "🌾 Revolutionizing Agriculture",
    "welcome_to": "Welcome to",
    "gofarmlyconnect": "GoFarmlyConnect",
    "hero_description": "Transform your farming operations with our comprehensive digital platform. Join thousands of farmers who have increased their productivity by 40% using our innovative solutions.",
    "get_started_free": "Get Started Free",
    "watch_demo": "Watch Demo",
    "active_farmers": "Active Farmers",
    "trade_volume": "Trade Volume",
    "uptime": "Uptime",
    "latest_updates": "🚀 Latest Updates",
    "ai_crop_prediction": "🌾 New AI crop prediction system - Increase yield by 40%",
    "mobile_app_launched": "📱 Mobile app launched - Manage your farm anywhere",
    "special_financing": "💰 Special financing for small farmers - Apply now",
    
    // Services
    "our_services": "Our Services",
    "comprehensive_solutions": "Comprehensive Import Export Solutions",
    "services_description": "Everything you need to streamline your international trade operations and ensure compliance",
    "gst_filing": "GST Filing",
    "gst_description": "Simplify your Goods and Services Tax (GST) compliance with easy online filing.",
    "automated_gst_returns": "Automated GST Returns",
    "input_tax_credit": "Input Tax Credit Management",
    "reconciliation_tools": "Reconciliation Tools",
    "audit_support": "Audit Support",
    "iec_registration": "IEC Registration",
    "iec_description": "Obtain your Import Export Code (IEC) quickly and hassle-free for international trade.",
    "new_iec_application": "New IEC Application",
    "iec_modification": "IEC Modification",
    "iec_renewal": "IEC Renewal",
    "consultation_services": "Consultation Services",
    "dsc_procurement": "DSC Procurement",
    "dsc_description": "Secure your Digital Signature Certificate (DSC) for online document authentication.",
    "class3_dsc": "Class 3 DSC",
    "organization_dsc": "Organization DSC",
    "individual_dsc": "Individual DSC",
    "renewal_services": "Renewal Services",
    "icegate_services": "ICEGATE Services",
    "icegate_description": "Seamlessly interact with ICEGATE for customs clearance and trade-related services.",
    "bill_of_entry": "Bill of Entry Filing",
    "shipping_bill": "Shipping Bill Processing",
    "duty_payment": "Duty Payment",
    "status_tracking": "Status Tracking",
    "adcode_registration": "AD Code Registration",
    "adcode_description": "Register your Authorized Dealer (AD) Code for smooth export transactions.",
    "adcode_reg": "AD Code Registration",
    "bank_linkage": "Bank Linkage",
    "export_incentives": "Export Incentives",
    "compliance_checks": "Compliance Checks",
    "other_documents": "Other Document Filing",
    "other_documents_description": "Comprehensive support for various other import-export related document filings.",
    "rcmc_application": "RCMC Application",
    "meis_seis_claims": "MEIS/SEIS Claims",
    "epcg_license": "EPCG License",
    "advance_authorization": "Advance Authorization",
    "learn_more": "Learn More",
    "ready_to_streamline": "Ready to Streamline Your Trade Operations?",
    "join_thousands": "Join thousands of importers and exporters who have digitized their operations with GoFarmlyConnect",
    "get_started_today": "Get Started Today",
    
    // Features
    "why_choose": "Why Choose GoFarmlyConnect",
    "built_for_modern": "Built for Modern",
    "farmers": "Farmers",
    "features_description": "We understand the unique challenges farmers face. That's why we've built a platform that combines cutting-edge technology with deep agricultural expertise.",
    "lightning_fast": "Lightning Fast Processing",
    "lightning_description": "Process documents and applications in minutes, not hours or days",
    "bank_grade_security": "Bank-Grade Security",
    "security_description": "Your data is protected with enterprise-level encryption",
    "expert_support": "Expert Support",
    "expert_description": "24/7 customer support from agricultural experts",
    "proven_results": "Proven Results",
    "results_description": "Average 40% increase in productivity for our users",
    "save_time": "Save Time",
    "time_description": "Reduce paperwork time by up to 80% with automation",
    "compliance_100": "100% Compliance",
    "compliance_description": "Stay compliant with all regulatory requirements",
    "happy_farmers": "Happy Farmers",
    
    // Dashboard
    "dashboard": "Dashboard",
    "profile": "My Profile",
    "progress": "Progress",
    "documents": "Documents",
    "settings": "Settings",
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
    "failed_to_load": "Failed to load profile data",
    "try_again": "Try Again"
  },
  hi: {
    // Navigation
    "about_us": "हमारे बारे में",
    "services": "सेवाएं",
    "video_tutorial": "वीडियो ट्यूटोरियल",
    "support": "सहायता",
    "login_register": "लॉगिन / रजिस्टर",
    "english": "English",
    "hindi": "हिन्दी",
    "marathi": "मराठी",
    
    // Hero Section
    "revolutionizing_agriculture": "🌾 कृषि में क्रांति",
    "welcome_to": "स्वागत है",
    "gofarmlyconnect": "गोफार्मलीकनेक्ट",
    "hero_description": "अपने कृषि संचालन को हमारे व्यापक डिजिटल प्लेटफॉर्म के साथ बदलें। हजारों किसानों से जुड़ें जिन्होंने हमारे नवाचार समाधानों का उपयोग करके अपनी उत्पादकता 40% बढ़ाई है।",
    "get_started_free": "मुफ्त शुरुआत करें",
    "watch_demo": "डेमो देखें",
    "active_farmers": "सक्रिय किसान",
    "trade_volume": "व्यापार मात्रा",
    "uptime": "अपटाइम",
    "latest_updates": "🚀 नवीनतम अपडेट",
    "ai_crop_prediction": "🌾 नई AI फसल भविष्यवाणी प्रणाली - उत्पादन 40% बढ़ाएं",
    "mobile_app_launched": "📱 मोबाइल ऐप लॉन्च - कहीं भी अपने खेत का प्रबंधन करें",
    "special_financing": "💰 छोटे किसानों के लिए विशेष वित्तपोषण - अभी आवेदन करें",
    
    // Services
    "our_services": "हमारी सेवाएं",
    "comprehensive_solutions": "व्यापक आयात निर्यात समाधान",
    "services_description": "आपके अंतर्राष्ट्रीय व्यापार संचालन को सुव्यवस्थित करने और अनुपालन सुनिश्चित करने के लिए आवश्यक सब कुछ",
    "gst_filing": "GST फाइलिंग",
    "gst_description": "आसान ऑनलाइन फाइलिंग के साथ अपने वस्तु और सेवा कर (GST) अनुपालन को सरल बनाएं।",
    "automated_gst_returns": "स्वचालित GST रिटर्न",
    "input_tax_credit": "इनपुट टैक्स क्रेडिट प्रबंधन",
    "reconciliation_tools": "सुलह उपकरण",
    "audit_support": "ऑडिट सहायता",
    "iec_registration": "IEC पंजीकरण",
    "iec_description": "अंतर्राष्ट्रीय व्यापार के लिए अपना आयात निर्यात कोड (IEC) जल्दी और आसानी से प्राप्त करें।",
    "new_iec_application": "नया IEC आवेदन",
    "iec_modification": "IEC संशोधन",
    "iec_renewal": "IEC नवीकरण",
    "consultation_services": "परामर्श सेवाएं",
    "dsc_procurement": "DSC खरीद",
    "dsc_description": "ऑनलाइन दस्तावेज़ प्रमाणीकरण के लिए अपना डिजिटल हस्ताक्षर प्रमाणपत्र (DSC) सुरक्षित करें।",
    "class3_dsc": "क्लास 3 DSC",
    "organization_dsc": "संगठन DSC",
    "individual_dsc": "व्यक्तिगत DSC",
    "renewal_services": "नवीकरण सेवाएं",
    "icegate_services": "ICEGATE सेवाएं",
    "icegate_description": "सीमा शुल्क निकासी और व्यापार संबंधी सेवाओं के लिए ICEGATE के साथ निर्बाध रूप से बातचीत करें।",
    "bill_of_entry": "बिल ऑफ एंट्री फाइलिंग",
    "shipping_bill": "शिपिंग बिल प्रसंस्करण",
    "duty_payment": "शुल्क भुगतान",
    "status_tracking": "स्थिति ट्रैकिंग",
    "adcode_registration": "AD कोड पंजीकरण",
    "adcode_description": "सुचारू निर्यात लेनदेन के लिए अपना अधिकृत डीलर (AD) कोड पंजीकृत करें।",
    "adcode_reg": "AD कोड पंजीकरण",
    "bank_linkage": "बैंक लिंकेज",
    "export_incentives": "निर्यात प्रोत्साहन",
    "compliance_checks": "अनुपालन जांच",
    "other_documents": "अन्य दस्तावेज़ फाइलिंग",
    "other_documents_description": "विभिन्न अन्य आयात-निर्यात संबंधी दस्तावेज़ फाइलिंग के लिए व्यापक सहायता।",
    "rcmc_application": "RCMC आवेदन",
    "meis_seis_claims": "MEIS/SEIS दावे",
    "epcg_license": "EPCG लाइसेंस",
    "advance_authorization": "अग्रिम प्राधिकरण",
    "learn_more": "और जानें",
    "ready_to_streamline": "अपने व्यापार संचालन को सुव्यवस्थित करने के लिए तैयार हैं?",
    "join_thousands": "हजारों आयातकों और निर्यातकों से जुड़ें जिन्होंने गोफार्मलीकनेक्ट के साथ अपने संचालन को डिजिटल बनाया है",
    "get_started_today": "आज ही शुरुआत करें",
    
    // Features
    "why_choose": "गोफार्मलीकनेक्ट क्यों चुनें",
    "built_for_modern": "आधुनिक के लिए निर्मित",
    "farmers": "किसान",
    "features_description": "हम समझते हैं कि किसानों को किन अनूठी चुनौतियों का सामना करना पड़ता है। इसीलिए हमने एक प्लेटफॉर्म बनाया है जो अत्याधुनिक तकनीक को गहरी कृषि विशेषज्ञता के साथ जोड़ता है।",
    "lightning_fast": "बिजली की तेज़ी से प्रसंस्करण",
    "lightning_description": "दस्तावेज़ों और आवेदनों को घंटों या दिनों में नहीं, मिनटों में प्रसंस्करण करें",
    "bank_grade_security": "बैंक-ग्रेड सुरक्षा",
    "security_description": "आपका डेटा एंटरप्राइज़-स्तरीय एन्क्रिप्शन के साथ सुरक्षित है",
    "expert_support": "विशेषज्ञ सहायता",
    "expert_description": "कृषि विशेषज्ञों से 24/7 ग्राहक सहायता",
    "proven_results": "सिद्ध परिणाम",
    "results_description": "हमारे उपयोगकर्ताओं के लिए औसतन 40% उत्पादकता वृद्धि",
    "save_time": "समय बचाएं",
    "time_description": "स्वचालन के साथ कागजी कार्रवाई का समय 80% तक कम करें",
    "compliance_100": "100% अनुपालन",
    "compliance_description": "सभी नियामक आवश्यकताओं के साथ अनुपालन में रहें",
    "happy_farmers": "खुश किसान",
    
    // Dashboard
    "dashboard": "डैशबोर्ड",
    "profile": "मेरी प्रोफाइल",
    "progress": "प्रगति",
    "documents": "दस्तावेज़",
    "settings": "सेटिंग्स",
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
    "failed_to_load": "प्रोफाइल डेटा लोड करने में असफल",
    "try_again": "पुनः प्रयास करें"
  },
  mr: {
    // Navigation
    "about_us": "आमच्याबद्दल",
    "services": "सेवा",
    "video_tutorial": "व्हिडिओ ट्यूटोरियल",
    "support": "सहाय्य",
    "login_register": "लॉगिन / नोंदणी",
    "english": "English",
    "hindi": "हिन्दी",
    "marathi": "मराठी",
    
    // Hero Section
    "revolutionizing_agriculture": "🌾 शेतीमध्ये क्रांती",
    "welcome_to": "स्वागत आहे",
    "gofarmlyconnect": "गोफार्मलीकनेक्ट",
    "hero_description": "आमच्या व्यापक डिजिटल प्लॅटफॉर्मसह तुमच्या शेती ऑपरेशन्सचे रूपांतर करा। हजारो शेतकऱ्यांना सामील व्हा ज्यांनी आमच्या नाविन्यपूर्ण उपायांचा वापर करून त्यांची उत्पादकता 40% वाढवली आहे.",
    "get_started_free": "विनामूल्य सुरुवात करा",
    "watch_demo": "डेमो पहा",
    "active_farmers": "सक्रिय शेतकरी",
    "trade_volume": "व्यापार मात्रा",
    "uptime": "अपटाइम",
    "latest_updates": "🚀 नवीनतम अपडेट्स",
    "ai_crop_prediction": "🌾 नवीन AI पीक अंदाज प्रणाली - उत्पादन 40% वाढवा",
    "mobile_app_launched": "📱 मोबाइल अॅप लॉन्च - कुठेही तुमच्या शेताचे व्यवस्थापन करा",
    "special_financing": "💰 लहान शेतकऱ्यांसाठी विशेष वित्तपुरवठा - आता अर्ज करा",
    
    // Services
    "our_services": "आमच्या सेवा",
    "comprehensive_solutions": "व्यापक आयात निर्यात उपाय",
    "services_description": "तुमच्या आंतरराष्ट्रीय व्यापार ऑपरेशन्स सुव्यवस्थित करण्यासाठी आणि अनुपालन सुनिश्चित करण्यासाठी आवश्यक असलेली प्रत्येक गोष्ट",
    "gst_filing": "GST फाइलिंग",
    "gst_description": "सोप्या ऑनलाइन फाइलिंगसह तुमचे वस्तू आणि सेवा कर (GST) अनुपालन सरल करा.",
    "automated_gst_returns": "स्वयंचलित GST रिटर्न",
    "input_tax_credit": "इनपुट टॅक्स क्रेडिट व्यवस्थापन",
    "reconciliation_tools": "सामंजस्य साधने",
    "audit_support": "ऑडिट सहाय्य",
    "iec_registration": "IEC नोंदणी",
    "iec_description": "आंतरराष्ट्रीय व्यापारासाठी तुमचा आयात निर्यात कोड (IEC) लवकर आणि सहजतेने मिळवा.",
    "new_iec_application": "नवीन IEC अर्ज",
    "iec_modification": "IEC बदल",
    "iec_renewal": "IEC नूतनीकरण",
    "consultation_services": "सल्लागार सेवा",
    "dsc_procurement": "DSC खरेदी",
    "dsc_description": "ऑनलाइन दस्तऐवज प्रमाणीकरणासाठी तुमचे डिजिटल स्वाक्षरी प्रमाणपत्र (DSC) सुरक्षित करा.",
    "class3_dsc": "वर्ग 3 DSC",
    "organization_dsc": "संघटना DSC",
    "individual_dsc": "वैयक्तिक DSC",
    "renewal_services": "नूतनीकरण सेवा",
    "icegate_services": "ICEGATE सेवा",
    "icegate_description": "सीमाशुल्क मंजुरी आणि व्यापार संबंधी सेवांसाठी ICEGATE शी अखंडपणे संवाद साधा.",
    "bill_of_entry": "बिल ऑफ एंट्री फाइलिंग",
    "shipping_bill": "शिपिंग बिल प्रक्रिया",
    "duty_payment": "शुल्क पेमेंट",
    "status_tracking": "स्थिती ट्रॅकिंग",
    "adcode_registration": "AD कोड नोंदणी",
    "adcode_description": "सुरळीत निर्यात व्यवहारांसाठी तुमचा अधिकृत डीलर (AD) कोड नोंदवा.",
    "adcode_reg": "AD कोड नोंदणी",
    "bank_linkage": "बँक लिंकेज",
    "export_incentives": "निर्यात प्रोत्साहन",
    "compliance_checks": "अनुपालन तपासणी",
    "other_documents": "इतर दस्तऐवज फाइलिंग",
    "other_documents_description": "विविध इतर आयात-निर्यात संबंधी दस्तऐवज फाइलिंगसाठी व्यापक सहाय्य.",
    "rcmc_application": "RCMC अर्ज",
    "meis_seis_claims": "MEIS/SEIS दावे",
    "epcg_license": "EPCG परवाना",
    "advance_authorization": "आगाऊ अधिकृतीकरण",
    "learn_more": "अधिक जाणून घ्या",
    "ready_to_streamline": "तुमच्या व्यापार ऑपरेशन्स सुव्यवस्थित करण्यास तयार आहात?",
    "join_thousands": "हजारो आयातदार आणि निर्यातदारांसह सामील व्हा ज्यांनी गोफार्मलीकनेक्टसह त्यांच्या ऑपरेशन्सचे डिजिटलीकरण केले आहे",
    "get_started_today": "आजच सुरुवात करा",
    
    // Features
    "why_choose": "गोफार्मलीकनेक्ट का निवडा",
    "built_for_modern": "आधुनिकसाठी निर्मित",
    "farmers": "शेतकरी",
    "features_description": "शेतकऱ्यांना कोणत्या अनन्य आव्हानांना सामोरे जावे लागते हे आम्हाला समजते. म्हणूनच आम्ही एक प्लॅटफॉर्म तयार केले आहे जे अत्याधुनिक तंत्रज्ञानाला खोल कृषी तज्ञतेसह जोडते.",
    "lightning_fast": "विजेसारखी जलद प्रक्रिया",
    "lightning_description": "तास किंवा दिवसांत नाही तर मिनिटांत दस्तऐवज आणि अर्जांवर प्रक्रिया करा",
    "bank_grade_security": "बँक-ग्रेड सिक्यूरिटी",
    "security_description": "तुमचा डेटा एंटरप्राइझ-स्तरीय एन्क्रिप्शनसह संरक्षित आहे",
    "expert_support": "तज्ञ सहाय्य",
    "expert_description": "कृषी तज्ञांकडून 24/7 ग्राहक सहाय्य",
    "proven_results": "सिद्ध परिणाम",
    "results_description": "आमच्या वापरकर्त्यांसाठी सरासरी 40% उत्पादकता वाढ",
    "save_time": "वेळ वाचवा",
    "time_description": "ऑटोमेशनसह कागदी कामकाजाचा वेळ 80% पर्यंत कमी करा",
    "compliance_100": "100% अनुपालन",
    "compliance_description": "सर्व नियामक आवश्यकतांचे अनुपालन करा",
    "happy_farmers": "आनंदी शेतकरी",
    
    // Dashboard
    "dashboard": "डॅशबोर्ड",
    "profile": "माझी प्रोफाइल",
    "progress": "प्रगती",
    "documents": "दस्तऐवज",
    "settings": "सेटिंग्ज",
    "registration": "नोंदणी",
    "logout": "लॉगआउट",
    "welcome": "स्वागत",
    "complete_profile": "सुरु करण्यासाठी तुमची प्रोफाइल पूर्ण करा",
    "upload_document": "दस्तऐवज अपलोड करा",
    "document_uploaded": "दस्तऐवज यशस्वीरित्या अपलोड झाले",
    "document_verified": "दस्तऐवज सत्यापित",
    "document_rejected": "दस्तऐवज नाकारले",
    "pending_verification": "सत्यापन प्रलंबित",
    "re_upload_required": "पुन्हा अपलोड आवश्यक",
    "profile_completion": "प्रोफाइल पूर्णता",
    "basic_information": "मूलभूत माहिती",
    "required_documents": "आवश्यक दस्तऐवज",
    "email_verified": "ईमेल सत्यापित",
    "mobile_verified": "मोबाइल सत्यापित",
    "upload_successful": "अपलोड यशस्वी",
    "upload_failed": "अपलोड अयशस्वी",
    "email_required": "ईमेल आवश्यक",
    "enter_email": "कृपया ईमेल पत्ता प्रविष्ट करा",
    "file_too_large": "फाइल खूप मोठी",
    "file_size_limit": "कृपया 1MB पेक्षा लहान फाइल अपलोड करा",
    "supported_formats": "समर्थित: PDF, JPG, PNG (कमाल 1MB)",
    "loading": "लोड होत आहे...",
    "error": "त्रुटी",
    "failed_to_load": "प्रोफाइल डेटा लोड करण्यात अयशस्वी",
    "try_again": "पुन्हा प्रयत्न करा"
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
