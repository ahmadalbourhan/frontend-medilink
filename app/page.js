"use client";
import { useState } from "react";
import { Activity, Heart, Shield, Users, FileText, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import Footer from "./components/footer";

export default function HomePage() {
  const router = useRouter();
  const [isArabic, setIsArabic] = useState(false);

  const handleLogin = () => {
    router.push("/login");
  };

  const toggleLanguage = () => {
    setIsArabic(!isArabic);
  };

  const features = [
    {
      icon: <Shield className="h-8 w-8 mx-auto mb-4 text-[#00368c]" />,
      title: isArabic ? "سجلات آمنة" : "Secure Records",
      description: isArabic
        ? "بياناتك الطبية محمية بأمان على مستوى المؤسسات"
        : "Your medical data is protected with enterprise-grade security",
    },
    {
      icon: <Users className="h-8 w-8 mx-auto mb-4 text-[#00368c]" />,
      title: isArabic ? "إدارة المرضى" : "Patient Management",
      description: isArabic
        ? "إدارة ومتابعة معلومات المرضى بكفاءة"
        : "Efficiently manage and track patient information",
    },
    {
      icon: <FileText className="h-8 w-8 mx-auto mb-4 text-[#00368c]" />,
      title: isArabic ? "سجلات رقمية" : "Digital Records",
      description: isArabic
        ? "تحويل السجلات الورقية إلى ملفات رقمية منظمة"
        : "Convert paper records into organized digital files",
    },
    {
      icon: <Clock className="h-8 w-8 mx-auto mb-4 text-[#00368c]" />,
      title: isArabic ? "الوصول السريع" : "Quick Access",
      description: isArabic
        ? "الوصول الفوري لتاريخك الطبي والسجلات"
        : "Instant access to medical history and records",
    },
    {
      icon: <Activity className="h-8 w-8 mx-auto mb-4 text-[#00368c]" />,
      title: isArabic ? "متابعة الصحة" : "Track Health",
      description: isArabic
        ? "مراقبة تاريخك الطبي والبقاء على اطلاع"
        : "Monitor your medical history and stay updated",
    },
    {
      icon: <Heart className="h-8 w-8 mx-auto mb-4 text-[#00368c]" />,
      title: isArabic ? "رعاية شخصية" : "Personal Care",
      description: isArabic
        ? "كل سجلاتك منظمة لتقديم رعاية أفضل"
        : "All your records are organized for better care",
    },
  ];

  return (
    <div
      className={`flex flex-col min-h-screen ${
        isArabic ? "text-right" : "text-left"
      } bg-[#efefef] text-[#342520]`}
      dir={isArabic ? "rtl" : "ltr"} // sets page direction
    >
      {/* Hero Section with #9ebdb3 gradient */}
      <section className="relative py-28 text-center bg-gradient-to-br from-[#9ebdb3] via-[#4b7bc6]/70 to-[#00368c]/20 rounded-b-3xl">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="absolute top-6 right-6 px-4 py-2 bg-[#00368c] text-white font-semibold rounded-full shadow hover:bg-[#4b7bc6] transition-all duration-300"
        >
          {isArabic ? "English" : "العربية"}
        </button>

        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold text-[#efefef]">MediLink</h1>
          <p className="text-xl text-[#00368c]/90">
            {isArabic
              ? "حوّل ممارستك الطبية باستخدام نظامنا الشامل للسجلات الصحية الرقمية"
              : "Transform your medical practice with our comprehensive digital health records system"}
          </p>
          <button
            onClick={handleLogin}
            className="mt-6 px-10 py-4 bg-white text-[#00368c] font-semibold rounded-full shadow-lg hover:bg-[#00368c] hover:text-white transition-all duration-300"
          >
            {isArabic ? "ابدأ الآن" : "Get Started"}
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-[#d2e5df] rounded-2xl p-8 shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1"
          >
            {feature.icon}
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-[#342520]/80">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
